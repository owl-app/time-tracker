/**
 * Check is function .
 * @param item
 * @returns {boolean}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFunction(item: unknown): boolean {
  return item && typeof item === 'function' && !Array.isArray(item);
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 * From https://stackoverflow.com/a/34749873/772859
 */
export function isObject(item: unknown) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Check is object or function.
 * @param item
 * @returns {boolean}
 */
export function isObjectOrFunction(item: unknown): boolean {
  return isFunction(item) || isObject(item);
}

/**
 * Check is class instance.
 * @param item
 * @returns {boolean}
 */
export function isClassInstance(item: unknown): boolean {
  return isObject(item) && item.constructor.name !== 'Object';
}

/**
 * Check value empty.
 * @param item
 * @returns {boolean}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmpty(item: any) {
  if (item instanceof Array) {
    // eslint-disable-next-line no-param-reassign
    item = item.filter((val) => !isEmpty(val));
    return item.length === 0;
  }

  if (item && typeof item === 'object') {
    return Object.keys(item).length === 0;
  }

  return (
    !item ||
    `${item}''`.toLocaleLowerCase() === 'null' ||
    `${item}''`.toLocaleLowerCase() === 'undefined'
  );
}

/**
 * Check value not empty.
 * @param item
 * @returns {boolean}
 */
export function isNotEmpty(item: unknown): boolean {
  return !isEmpty(item);
}

export function isJsObject(object: unknown) {
  return object !== null && object !== undefined && typeof object === 'object';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNumeric(val: any): boolean {
  return !(val instanceof Array) && val - parseFloat(val) + 1 >= 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function instanceOf<T>(value: any, fieldName: string): value is T {
  return fieldName in value;
}
