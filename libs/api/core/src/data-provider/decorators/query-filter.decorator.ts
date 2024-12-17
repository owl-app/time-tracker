import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QueryFilter = createParamDecorator((ctx: ExecutionContext, data = 'filters') => {
  const request = ctx.switchToHttp().getRequest();

  return request.query[data] ?? {};
});
