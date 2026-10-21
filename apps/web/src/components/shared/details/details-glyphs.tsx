import type { ReactNode } from "react";

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function WalletGlyph() {
  return (
    <Glyph>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
      <path d="M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5Z" />
      <path d="M16 13.5h.01" />
    </Glyph>
  );
}

export function CalendarGlyph() {
  return (
    <Glyph>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </Glyph>
  );
}

export function ClockGlyph() {
  return (
    <Glyph>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </Glyph>
  );
}

export function CheckCircleGlyph() {
  return (
    <Glyph>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </Glyph>
  );
}

export function XCircleGlyph() {
  return (
    <Glyph>
      <circle cx="12" cy="12" r="8" />
      <path d="m9.5 9.5 5 5M14.5 9.5l-5 5" />
    </Glyph>
  );
}

export function LinkGlyph() {
  return (
    <Glyph>
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </Glyph>
  );
}

export function UserGlyph() {
  return (
    <Glyph>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5a7 7 0 0 1 14 0" />
    </Glyph>
  );
}

export function PhoneGlyph() {
  return (
    <Glyph>
      <path d="M6.5 4h2.6l1.4 3.6-1.8 1.2a9 9 0 0 0 4.5 4.5l1.2-1.8 3.6 1.4v2.6A1.5 1.5 0 0 1 16.5 17 12.5 12.5 0 0 1 5 5.5 1.5 1.5 0 0 1 6.5 4Z" />
    </Glyph>
  );
}

export function MailGlyph() {
  return (
    <Glyph>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7.5 5.5L19.5 7" />
    </Glyph>
  );
}

export function SparkGlyph() {
  return (
    <Glyph>
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.5 6.5l2.5 2.5M15 15l2.5 2.5M6.5 17.5 9 15M15 9l2.5-2.5" />
    </Glyph>
  );
}

export function GiftGlyph() {
  return (
    <Glyph>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M3.5 9h17M12 9v11" />
      <path d="M12 9c-1.5-3-5-3.5-5-1.25C7 9 9.5 9 12 9Zm0 0c1.5-3 5-3.5 5-1.25C17 9 14.5 9 12 9Z" />
    </Glyph>
  );
}

export function TicketGlyph() {
  return (
    <Glyph>
      <path d="M4 8a2 2 0 0 0 0 4v4h16v-4a2 2 0 0 1 0-4V5H4v3Z" />
      <path d="M14 5v11" strokeDasharray="2 2" />
    </Glyph>
  );
}

export function NoteGlyph() {
  return (
    <Glyph>
      <path d="M6 4h9l3 3v13H6z" />
      <path d="M9 11h6M9 15h4" />
    </Glyph>
  );
}

export function UsersGlyph() {
  return (
    <Glyph>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M15.5 6.5a3 3 0 0 1 0 5.5M17 14.5a5.5 5.5 0 0 1 3.5 4.5" />
    </Glyph>
  );
}

export function PauseGlyph() {
  return (
    <Glyph>
      <circle cx="12" cy="12" r="8" />
      <path d="M10 9v6M14 9v6" />
    </Glyph>
  );
}

export function ChartGlyph() {
  return (
    <Glyph>
      <path d="M5 19V11M12 19V5M19 19v-6" />
    </Glyph>
  );
}
