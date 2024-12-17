// eslint-disable-next-line import/prefer-default-export
export function convertToSnakeCase(str: string) {
  return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toUpperCase();
}
