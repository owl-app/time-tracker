import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { isEmpty } from '@owl-app/utils';

@Injectable()
export class UUIDValidationPipe implements PipeTransform<string> {
  public transform(value: string): string {
    if (isEmpty(value)) {
      throw new NotFoundException('Validation failed (uuid is expected)');
    }
    if (!isUUID(value)) {
      throw new NotAcceptableException('Validation failed (valid uuid is expected)');
    }
    return value;
  }
}
