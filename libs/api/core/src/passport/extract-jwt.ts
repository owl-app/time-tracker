import { Request } from 'express';

export function extractJWT(tokenName: string): (req: Request) => string | null {
  return (req: Request): string | null => {
    if (req.cookies && tokenName in req.cookies && req.cookies[tokenName].length > 0) {
      return req.cookies[tokenName];
    }
    return null;
  };
}
