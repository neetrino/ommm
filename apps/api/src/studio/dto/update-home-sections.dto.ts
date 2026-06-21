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
    if (entries.length !== HOME_PAGE_SECTION_KEYS.length) {
      return false;
    }

    return entries.every(([key, enabled]) => {
      return (
        (HOME_PAGE_SECTION_KEYS as readonly string[]).includes(key) &&
        typeof enabled === 'boolean'
      );
    });
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
