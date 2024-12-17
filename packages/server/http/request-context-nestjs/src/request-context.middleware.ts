import { Injectable, NestMiddleware } from '@nestjs/common';
import { RequestContext } from './request-context.model';

@Injectable()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RequestContextMiddleware<Request = any, Response = any>
  implements NestMiddleware<Request, Response>
{
  use(req: Request, res: Response, next: () => void) {
    RequestContext.cls.run(new RequestContext(req, res), next);
  }
}
