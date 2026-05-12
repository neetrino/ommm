import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/** Log only (no external API). Same as `MAIL_TRANSPORT=test`. */
const TRANSPORT_LOG = 'log' as const;
/** Send via Resend (requires valid `RESEND_API_KEY`). */
const TRANSPORT_RESEND = 'resend' as const;

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

  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const from =
      this.config.get<string>('RESEND_FROM') ?? 'Ommm <onboarding@resend.dev>';

    if (this.transport === TRANSPORT_LOG || this.resend === null) {
      if (this.transport === TRANSPORT_RESEND && this.resend === null) {
        this.logger.warn(
          `Email not sent (Resend unavailable): to=${params.to} subject=${params.subject}`,
        );
        return;
      }
      this.logger.log(
        `[mail:test] to=${params.to} subject=${params.subject} from=${from}\n${params.html}`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      this.logger.error(`Resend error: ${error.message}`);
    }
  }
}
