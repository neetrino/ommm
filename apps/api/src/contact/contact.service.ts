import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { StudioService } from '../studio/studio.service';
import type { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly studio: StudioService,
  ) {}

  async submit(dto: CreateContactMessageDto) {
    const msg = await this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        subject: dto.subject,
        message: dto.message,
      },
    });
    const settings = await this.studio.getPublic();
    if (settings.contactEmail) {
      await this.mail.sendEmail({
        to: settings.contactEmail,
        subject: dto.subject
          ? `Contact: ${dto.subject}`
          : `Contact from ${dto.name}`,
        html: `<p>${dto.name} — ${dto.phone}</p><p>${dto.message}</p>`,
      });
    }
    return { id: msg.id, ok: true };
  }
}
