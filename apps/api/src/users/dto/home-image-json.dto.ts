import { IsString, MaxLength } from "class-validator";

/** Mobile/web upload fallback when multipart FormData is not parsed reliably by the server. */
export class HomeImageJsonDto {
  @IsString()
  @MaxLength(9_000_000)
  imageBase64!: string;

  @IsString()
  @MaxLength(64)
  mimeType!: string;
}
