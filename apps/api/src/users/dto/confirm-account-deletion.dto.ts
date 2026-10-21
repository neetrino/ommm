import { IsString, Matches } from 'class-validator';
import { ACCOUNT_DELETION_CODE_LENGTH } from '../account-deletion.constants';

const CODE_PATTERN = new RegExp(`^\\d{${ACCOUNT_DELETION_CODE_LENGTH}}$`);

export class ConfirmAccountDeletionDto {
  @IsString()
  @Matches(CODE_PATTERN)
  code!: string;
}
