import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly resend: Resend | null;

  constructor(private readonly config: ConfigService) {
    const key = config.get<string>("RESEND_API_KEY");
    this.resend = key ? new Resend(key) : null;
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const from = this.config.get<string>("RESEND_FROM") ?? "Ommm <onboarding@resend.dev>";
    if (!this.resend) {
      this.logger.log(
        `Email (dev, no RESEND_API_KEY): to=${params.to} subject=${params.subject}`,
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
