import { getMilliseconds } from '../../../utils/get-milliseconds';

describe('#utils', () => {
  describe('getMilliseconds', () => {
    it('should return the correct milliseconds for a valid string input', () => {
      expect(getMilliseconds('1s')).toBe(1000);
      expect(getMilliseconds('1m')).toBe(60000);
      expect(getMilliseconds('1h')).toBe(3600000);
    });

    it('should return the correct milliseconds for a valid number input', () => {
      expect(getMilliseconds(1000)).toBe(1000);
      expect(getMilliseconds(60000)).toBe(60000);
    });

    it('should return the fallback value for an invalid type input', () => {
      expect(getMilliseconds({}, 'fallback')).toBe('fallback');
      expect(getMilliseconds([], 'fallback')).toBe('fallback');
      expect(getMilliseconds(true, 'fallback')).toBe('fallback');
    });

    it('should return the fallback value for an empty string input', () => {
      expect(getMilliseconds('', 'fallback')).toBe('fallback');
    });

    it('should return the fallback value for undefined or null input', () => {
      expect(getMilliseconds(undefined, 'fallback')).toBe('fallback');
      expect(getMilliseconds(null, 'fallback')).toBe('fallback');
    });

    it('should return the fallback value if ms function returns undefined', () => {
      expect(getMilliseconds('invalid', 'fallback')).toBe('fallback');
    });
  });
})
