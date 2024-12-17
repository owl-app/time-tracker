import ms from 'ms';

export function getMilliseconds<T = undefined>(value: unknown, fallback?: T): number | T {
  if ((typeof value !== 'string' && typeof value !== 'number') || value === '') {
    return fallback as T;
  }

  return ms(String(value)) ?? fallback;
}
