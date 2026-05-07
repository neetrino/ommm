import { IsString } from "class-validator";

export class MoveBookingDto {
  @IsString()
  targetSessionId!: string;
}
