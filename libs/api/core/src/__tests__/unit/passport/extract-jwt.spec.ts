import { extractJWT } from '../../../passport/extract-jwt';

describe('#extractJWT', () => {
  it('should return the token when cookies exist and tokenName is present', () => {
    const req = { cookies: { myToken: 'abc123' } } as any;
    const extract = extractJWT('myToken');
    expect(extract(req)).toBe('abc123');
  });

  it('should return null when cookies do not exist', () => {
    const req = {} as any;
    const extract = extractJWT('myToken');
    expect(extract(req)).toBeNull();
  });

  it('should return null when tokenName is not found in cookies', () => {
    const req = { cookies: { otherToken: 'xyz' } } as any;
    const extract = extractJWT('myToken');
    expect(extract(req)).toBeNull();
  });

  it('should return null when token is an empty string', () => {
    const req = { cookies: { myToken: '' } } as any;
    const extract = extractJWT('myToken');
    expect(extract(req)).toBeNull();
  });

  it('should return null if tokenName was provided but cookies[tokenName] is null', () => {
    const req = { cookies: { myToken: null } } as any;
    const extract = extractJWT('myToken');
    expect(extract(req)).toBeNull();
  });
});
