import { IsObject, Validate } from 'class-validator';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  APP_UI_LOCALES,
  hasAtLeastOneEnabledLocale,
  type AppUiLocale,
  type EnabledLocalesMap,
} from '@ommm/database';

@ValidatorConstraint({ name: 'enabledLocalesMap', async: false })
class EnabledLocalesMapConstraint implements ValidatorConstraintInterface {
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
      (APP_UI_LOCALES as readonly string[]).includes(key),
    );
    if (!hasOnlyKnownKeys) {
      return false;
    }

    const hasAllKeys = APP_UI_LOCALES.every(
      (locale) => typeof record[locale] === 'boolean',
    );
    if (!hasAllKeys) {
      return false;
    }

    return hasAtLeastOneEnabledLocale(record as EnabledLocalesMap);
  }

  defaultMessage(args: ValidationArguments): string {
    const keys = APP_UI_LOCALES.join(', ');
    return `${args.property} must include every locale (${keys}) as booleans with at least one enabled`;
  }
}

export type UpdateEnabledLocalesBody = Record<AppUiLocale, boolean>;

export class UpdateEnabledLocalesDto {
  @IsObject()
  @Validate(EnabledLocalesMapConstraint)
  locales!: UpdateEnabledLocalesBody;
}
