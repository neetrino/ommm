import { IsObject, Validate } from 'class-validator';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  HOME_PAGE_SECTION_KEYS,
  type HomePageSectionKey,
} from '@ommm/database';

@ValidatorConstraint({ name: 'homePageSectionVisibilityMap', async: false })
class HomePageSectionVisibilityMapConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }

    const entries = Object.entries(value);
    if (entries.length === 0) {
      return false;
    }

    const record = value as Record<string, unknown>;
    const hasOnlyKnownKeys = entries.every(([key]) =>
      (HOME_PAGE_SECTION_KEYS as readonly string[]).includes(key),
    );
    if (!hasOnlyKnownKeys) {
      return false;
    }

    return HOME_PAGE_SECTION_KEYS.every(
      (key) => typeof record[key] === 'boolean',
    );
  }

  defaultMessage(args: ValidationArguments): string {
    const keys = HOME_PAGE_SECTION_KEYS.join(', ');
    return `${args.property} must include every section key (${keys}) with boolean values`;
  }
}

export type UpdateHomeSectionsBody = Record<HomePageSectionKey, boolean>;

export class UpdateHomeSectionsDto {
  @IsObject()
  @Validate(HomePageSectionVisibilityMapConstraint)
  sections!: UpdateHomeSectionsBody;
}
