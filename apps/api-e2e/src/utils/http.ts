export function isStatusSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}
