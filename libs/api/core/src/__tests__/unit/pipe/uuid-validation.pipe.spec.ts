import { isUUID } from 'class-validator';
import { NotAcceptableException, NotFoundException } from '@nestjs/common';

import { isEmpty } from '@owl-app/utils';

import { UUIDValidationPipe } from '../../../pipes/uuid-validation.pipe';

jest.mock('class-validator', () => ({
  isUUID: jest.fn(),
}));

jest.mock('@owl-app/utils', () => ({
  isEmpty: jest.fn(),
}));

describe('UUIDValidationPipe', () => {
  let pipe: UUIDValidationPipe;

  beforeEach(() => {
    pipe = new UUIDValidationPipe();
  });

  it('should throw NotFoundException if value is empty', () => {
    (isEmpty as jest.Mock).mockReturnValue(true);

    expect(() => pipe.transform('')).toThrow(NotFoundException);
    expect(() => pipe.transform('')).toThrow('Validation failed (uuid is expected)');
  });

  it('should throw NotAcceptableException if value is not a valid UUID', () => {
    (isEmpty as jest.Mock).mockReturnValue(false);
    (isUUID as jest.Mock).mockReturnValue(false);

    expect(() => pipe.transform('invalid-uuid')).toThrow(NotAcceptableException);
    expect(() => pipe.transform('invalid-uuid')).toThrow('Validation failed (valid uuid is expected)');
  });

  it('should return the value if it is a valid UUID', () => {
    (isEmpty as jest.Mock).mockReturnValue(false);
    (isUUID as jest.Mock).mockReturnValue(true);

    const result = pipe.transform('valid-uuid');
    expect(result).toBe('valid-uuid');
  });
});
