import Joi from 'joi';
import JoiUtil, { JoiConfig } from '../../../utils/joi-config';

describe('#utils', () => {
  describe('joi-config', () => {
    describe('validate', () => {
      it('should return values if validation passes', () => {
        const config: JoiConfig<{ TEST_VAR: string }> = {
          TEST_VAR: {
            value: 'test_value',
            joi: Joi.string().required(),
          },
        };

        const result = JoiUtil.validate(config);

        expect(result).toEqual({ TEST_VAR: 'test_value' });
      });

      it('should throw an error if validation fails', () => {
        const config: JoiConfig<{ TEST_VAR: string }> = {
          TEST_VAR: {
            value: undefined,
            joi: Joi.string().required(),
          },
        };

        expect(() => JoiUtil.validate(config)).toThrowError(
          'Validation failed - Is there an environment variable missing?'
        );
      });
    });

    describe('extractByPropName', () => {
      it('should extract values by property name', () => {
        const config: JoiConfig<{ TEST_VAR: string; ANOTHER_VAR: number }> = {
          TEST_VAR: {
            value: 'test_value',
            joi: Joi.string().required(),
          },
          ANOTHER_VAR: {
            value: 123,
            joi: Joi.number().required(),
          },
        };

        const values = JoiUtil.extractByPropName(config, 'value');
        const schemas = JoiUtil.extractByPropName(config, 'joi');

        expect(values).toEqual({ TEST_VAR: 'test_value', ANOTHER_VAR: 123 });
        expect(schemas).toEqual({
          TEST_VAR: Joi.string().required(),
          ANOTHER_VAR: Joi.number().required(),
        });
      });
    });
  });
});
