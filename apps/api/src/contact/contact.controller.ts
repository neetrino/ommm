import { Body, Controller, Post } from '@nestjs/common';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  submit(@Body() dto: CreateContactMessageDto) {
    return this.contact.submit(dto);
  }
}
