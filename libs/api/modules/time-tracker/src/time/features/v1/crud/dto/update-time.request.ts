import { PartialType } from '@nestjs/swagger';
import { CreateTimeRequest } from './create-time.request';

export class UpdateTimeRequest extends PartialType(CreateTimeRequest) {}
