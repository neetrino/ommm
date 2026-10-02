import { IsBoolean } from 'class-validator';

export class AdminAllowOtherClassesDto {
  @IsBoolean()
  allow!: boolean;
}
