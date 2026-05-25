"use client";

export const COACH_MIN_AGE = 16;
export const COACH_MAX_AGE = 100;
export const MAX_SPECIALIZATION_LENGTH = 200;
export const MAX_BIO_LENGTH = 4000;
export const MAX_NAME_LENGTH = 120;
export const MAX_EMAIL_LENGTH = 254;
export const MIN_PHONE_DIGITS = 8;
export const MAX_PHONE_DIGITS = 15;
export const MAX_PHONE_CHARS = 32;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const ACCEPT_PHOTO =
  "image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
export const MAX_EXPERIENCE_YEARS = 80;
export const MIN_SCHEDULE_SPOTS = 1;
export const MAX_SCHEDULE_SPOTS = 200;

const PREVIEW_PATH_BASE = new URL("https://coach-preview.invalid");

export type CoachScheduleInput = {
  id: string;
  date: string;
  time: string;
  spots: string;
};

export type CoachClassOption = {
  id: string;
  name: string;
};

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_LENGTH) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function countDigits(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

export function isValidPhone(trimmed: string): boolean {
  if (trimmed.length < MIN_PHONE_DIGITS || trimmed.length > MAX_PHONE_CHARS) {
    return false;
  }
  const digits = countDigits(trimmed);
  return digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS;
}

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export function sanitizeCoachPreviewSrc(src: string): string | null {
  const trimmed = src.trim();
  if (trimmed === "") {
    return null;
  }
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    try {
      const parsed = new URL(trimmed, PREVIEW_PATH_BASE);
      if (parsed.origin !== PREVIEW_PATH_BASE.origin) {
        return null;
      }
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return null;
    }
  }
  try {
    const url = new URL(trimmed);
    if (
      url.protocol === "https:" ||
      url.protocol === "http:" ||
      url.protocol === "blob:"
    ) {
      return url.href;
    }
  } catch {
    return null;
  }
  return null;
}

export function calculateAgeFromBirthday(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function createScheduleRow(): CoachScheduleInput {
  return {
    id: crypto.randomUUID(),
    date: "",
    time: "",
    spots: "1",
  };
}

export function normalizeScheduleForApi(rows: CoachScheduleInput[]): {
  date: string;
  time: string;
  spots: number;
}[] {
  return rows.map((row) => ({
    date: row.date,
    time: row.time,
    spots: Number(row.spots),
  }));
}

export function readFileAsBase64Payload(file: File): Promise<{
  imageBase64: string;
  mimeType: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read image file"));
        return;
      }
      const splitIndex = result.indexOf("base64,");
      if (splitIndex === -1) {
        reject(new Error("Failed to read image file"));
        return;
      }
      resolve({
        imageBase64: result.slice(splitIndex + "base64,".length),
        mimeType: file.type || "image/jpeg",
      });
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read image file"));
    };
    reader.readAsDataURL(file);
  });
}
