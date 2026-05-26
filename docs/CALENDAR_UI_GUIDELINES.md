# Calendar UI Guidelines

## Shared calendar component

- Use the shared `DatePickerInput` component for all calendar/date picker UI.
- Base visual design must match the Add Coach form `Schedule / Availability` calendar.
- Do not create page-specific calendar popups or one-off calendar styles.
- Reuse the same spacing, colors, radius, hover states, selected-day style, disabled-day style, and typography already defined in `DatePickerInput`.

## User-facing date format

- All visible dates in UI must use `day/month/year`.
- Required example format: `25/05/2026`.
- Do not display user-facing dates as `month/day/year` or `year/month/day`.
- API/database/internal formats may stay unchanged (for example ISO strings) when needed by backend logic.

## Implementation rules

- Keep UI values and display in `day/month/year`, while converting internally as needed for API payloads/filters.
- Keep existing i18n translation flow for calendar labels/month/weekdays where already present.
- New date picker/calendar features must reuse the shared component and this date format rule.
- Verify responsive behavior for desktop/tablet/mobile and avoid popup overflow or horizontal scrolling.
