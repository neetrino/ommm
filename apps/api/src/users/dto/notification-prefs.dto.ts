import { IsBoolean, IsOptional } from "class-validator";

export class NotificationPrefsDto {
  @IsOptional()
  @IsBoolean()
  bookingReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  waitlistAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  promotions?: boolean;

  @IsOptional()
  @IsBoolean()
  communityUpdates?: boolean;
}
