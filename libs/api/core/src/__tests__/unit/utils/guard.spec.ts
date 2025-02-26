import { Guard } from '../../../utils/guard';

describe('#utils', () => {
  describe('Guard', () => {
    describe('isEmpty', () => {
      it('should return false for a number', () => {
        expect(Guard.isEmpty(123)).toBe(false);
      });

      it('should return false for a boolean', () => {
        expect(Guard.isEmpty(true)).toBe(false);
        expect(Guard.isEmpty(false)).toBe(false);
      });

      it('should return true for undefined or null', () => {
        expect(Guard.isEmpty(undefined)).toBe(true);
        expect(Guard.isEmpty(null)).toBe(true);
      });

      it('should return false for a Date', () => {
        expect(Guard.isEmpty(new Date())).toBe(false);
      });

      it('should return true for an empty object', () => {
        expect(Guard.isEmpty({})).toBe(true);
      });

      it('should return true for an empty array', () => {
        expect(Guard.isEmpty([])).toBe(true);
      });

      it('should return true for an array with empty values', () => {
        expect(Guard.isEmpty([null, undefined, ''])).toBe(true);
      });

      it('should return false for a non-empty array', () => {
        expect(Guard.isEmpty([1, 2, 3])).toBe(false);
      });

      it('should return true for an empty string', () => {
        expect(Guard.isEmpty('')).toBe(true);
      });

      it('should return false for a non-empty string', () => {
        expect(Guard.isEmpty('test')).toBe(false);
      });
    });

    describe('lengthIsBetween', () => {
      it('should return true for a number within the range', () => {
        expect(Guard.lengthIsBetween(12345, 1, 5)).toBe(true);
      });

      it('should return false for a number outside the range', () => {
        expect(Guard.lengthIsBetween(123456, 1, 5)).toBe(false);
      });

      it('should return true for a string within the range', () => {
        expect(Guard.lengthIsBetween('test', 1, 5)).toBe(true);
      });

      it('should return false for a string outside the range', () => {
        expect(Guard.lengthIsBetween('testing', 1, 5)).toBe(false);
      });

      it('should return true for an array within the range', () => {
        expect(Guard.lengthIsBetween([1, 2, 3], 1, 5)).toBe(true);
      });

      it('should return false for an array outside the range', () => {
        expect(Guard.lengthIsBetween([1, 2, 3, 4, 5, 6], 1, 5)).toBe(false);
      });

      it('should throw an error for an empty value', () => {
        expect(() => Guard.lengthIsBetween('', 1, 5)).toThrow(
          'Cannot check length of a value. Provided value is empty'
        );
        expect(() => Guard.lengthIsBetween([], 1, 5)).toThrow(
          'Cannot check length of a value. Provided value is empty'
        );
      });
    });
  });
});
