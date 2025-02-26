// import { BaseSchema, BaseIssue, ValiError, parse, flatten } from 'valibot';
import * as v from 'valibot';

import { ValibotValidationPipe } from '../../../validation/valibot.pipe';
import { ValidationErrorException } from '../../../validation/validation-error.exception';

describe('ValibotValidationPipe', () => {
  let pipe: ValibotValidationPipe;
  const schema = v.object({
    name: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  });

  beforeEach(() => {
    pipe = new ValibotValidationPipe(schema);
  });

  describe('transform', () => {
    it('should return the parsed value when the value is valid', () => {
      const value = { name: 'name value' };

      expect(pipe.transform(value)).toStrictEqual(value);
    });

    it('should reject when the value is invalid', () => {
      const value = { name: '' };

      try {
        pipe.transform(value);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ValidationErrorException);
        expect(error.message).toBe('Validation error');

        expect(error.getErrors()).toStrictEqual({
          name: ['Field is required'],
        });
      }
    });
  });
});
