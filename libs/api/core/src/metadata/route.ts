import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_KEY = '_PUBLIC_ROUTE_';
export const Public = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
