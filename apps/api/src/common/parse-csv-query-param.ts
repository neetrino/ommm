/** Parses comma-separated query params into trimmed non-empty parts. */
export function parseCsvQueryParam(value: unknown): string[] {
  if (value === undefined || value === null || value === '') {
    return [];
  }
  let rawParts: string[];
  if (Array.isArray(value)) {
    rawParts = value.flatMap((entry) =>
      typeof entry === 'string' ? entry.split(',') : [],
    );
  } else if (typeof value === 'string') {
    rawParts = value.split(',');
  } else {
    return [];
  }
  return rawParts.map((part) => part.trim()).filter(Boolean);
}

/**
 * Transform + validate CSV enum query values.
 * Empty input → undefined (no filter). Invalid tokens are dropped.
 */
export function parseCsvEnumQueryParam<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T[] | undefined {
  const allowedSet = new Set<string>(allowed);
  const parsed = parseCsvQueryParam(value).filter((part): part is T =>
    allowedSet.has(part),
  );
  return parsed.length > 0 ? parsed : undefined;
}
