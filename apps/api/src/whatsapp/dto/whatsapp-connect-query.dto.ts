import { IsIn, IsOptional } from 'class-validator';

export class WhatsappConnectQueryDto {
  @IsOptional()
  @IsIn(['1', 'true'])
  qr?: '1' | 'true';
}
