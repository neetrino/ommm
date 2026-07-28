import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  EMAIL_LOGO_PUBLIC_SRC,
  resolveEmailLogoPreviewSrc,
} from './email-logo';

/** Log only (no external API). Same as `MAIL_TRANSPORT=test`. */
const TRANSPORT_LOG = 'log' as const;
/** Send via Resend (requires valid `RESEND_API_KEY`). */
const TRANSPORT_RESEND = 'resend' as const;

const DEFAULT_FROM = 'Ommm <onboarding@resend.dev>';

type MailTransport = typeof TRANSPORT_LOG | typeof TRANSPORT_RESEND;

function normalizeMailTransport(raw: string | undefined): MailTransport | null {
  const v = raw?.trim().toLowerCase();
  if (v === TRANSPORT_LOG || v === 'test') {
    return TRANSPORT_LOG;
  }
  if (v === TRANSPORT_RESEND) {
    return TRANSPORT_RESEND;
  }
  return null;
}

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: Array<{
    content?: string | Buffer;
    filename?: string | false;
    path?: string;
    contentType?: string;
    contentId?: string;
  }>;
};

/** Builds a Resend-compatible `from` using `RESEND_FROM` and `RESEND_FROM_EMAIL`. */
function resolveFromAddress(
  fromRaw: string | undefined,
  fromEmailRaw: string | undefined,
): string {
  const from = fromRaw?.trim() ?? '';
  if (from.includes('@')) {
    return from;
  }

  const email = fromEmailRaw?.trim() ?? '';
  if (email.length > 0) {
    const displayName = from.length > 0 ? from : 'Ommm';
    return `${displayName} <${email}>`;
  }

  return DEFAULT_FROM;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly transport: MailTransport;

  private readonly resend: Resend | null;

  constructor(private readonly config: ConfigService) {
    const nodeEnv =
      this.config.get<string>('NODE_ENV') ??
      process.env.NODE_ENV ??
      'development';
    const explicit = normalizeMailTransport(
      this.config.get<string>('MAIL_TRANSPORT'),
    );
    const key = this.config.get<string>('RESEND_API_KEY')?.trim() ?? '';

    if (explicit !== null) {
      this.transport = explicit;
    } else if (nodeEnv === 'production') {
      this.transport = TRANSPORT_RESEND;
    } else {
      this.transport = TRANSPORT_LOG;
    }

    if (this.transport === TRANSPORT_RESEND && key.length > 0) {
      this.resend = new Resend(key);
    } else {
      this.resend = null;
      if (this.transport === TRANSPORT_RESEND && key.length === 0) {
        this.logger.warn(
          'MAIL_TRANSPORT=resend but RESEND_API_KEY is empty; outbound email is disabled.',
        );
      }
    }
  }

  async sendEmail(params: SendEmailParams): Promise<void> {
    const from = resolveFromAddress(
      this.config.get<string>('RESEND_FROM'),
      this.config.get<string>('RESEND_FROM_EMAIL'),
    );
    const replyTo = params.replyTo?.trim();

    if (this.transport === TRANSPORT_LOG || this.resend === null) {
      if (this.transport === TRANSPORT_RESEND && this.resend === null) {
        this.logger.warn(
          `Email not sent (Resend unavailable): to=${params.to} subject=${params.subject}`,
        );
        throw new ServiceUnavailableException('Email delivery is unavailable');
      }
      this.logger.log(
        `[mail:test] to=${params.to} subject=${params.subject} from=${from}${replyTo ? ` replyTo=${replyTo}` : ''}\n${params.html.replaceAll(EMAIL_LOGO_PUBLIC_SRC, resolveEmailLogoPreviewSrc())}`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(replyTo ? { replyTo } : {}),
      ...(params.attachments?.length
        ? { attachments: params.attachments }
        : {}),
    });
    if (error) {
      this.logger.error(`Resend error: ${error.message}`);
      throw new ServiceUnavailableException('Email delivery failed');
    }
  }
}
