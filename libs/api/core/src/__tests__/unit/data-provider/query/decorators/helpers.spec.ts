import { EntitySchema } from 'typeorm';

import { getPaginatedQueryServiceToken } from '../../../../../data-provider/query/decorators/helpers';

describe('getPaginatedQueryServiceToken', () => {
  describe('with EntitySchema', () => {
    it('should return token with target name when EntitySchema has target', () => {
      const schema = new EntitySchema({
        name: 'TestSchema',
        target: class TestTarget {},
        columns: {},
      });
      expect(getPaginatedQueryServiceToken(schema)).toBe('TestTargetPaginatedQueryService');
    });

    it('should return token with schema name when EntitySchema has no target', () => {
      const schema = new EntitySchema({
        name: 'TestSchema',
        columns: {},
      });
      expect(getPaginatedQueryServiceToken(schema)).toBe('TestSchemaPaginatedQueryService');
    });

    it('should handle complex target names', () => {
      const schema = new EntitySchema({
        name: 'TestSchema',
        target: class ComplexEntityName {},
        columns: {},
      });
      expect(getPaginatedQueryServiceToken(schema)).toBe('ComplexEntityNamePaginatedQueryService');
    });
  });

  describe('with Class', () => {
    it('should return token based on class name', () => {
      class TestDTO {}
      expect(getPaginatedQueryServiceToken(TestDTO)).toBe('TestDTOPaginatedQueryService');
    });

    it('should handle class with inheritance', () => {
      class BaseDTO {}
      class ExtendedDTO extends BaseDTO {}
      expect(getPaginatedQueryServiceToken(ExtendedDTO)).toBe('ExtendedDTOPaginatedQueryService');
    });
  });

  describe('edge cases', () => {
    it('should handle class with special characters in name', () => {
      class TestDTO {}
      expect(getPaginatedQueryServiceToken(TestDTO)).toBe('TestDTOPaginatedQueryService');
    });

    it('should handle anonymous class', () => {
      const AnonymousClass = class {};
      expect(getPaginatedQueryServiceToken(AnonymousClass)).toBe(
        'AnonymousClassPaginatedQueryService'
      );
    });

    it('should reject with error', async () =>
      expect(() => getPaginatedQueryServiceToken(class {})).toThrow(
        'Anonymous class is not supported'
      ));

    it('should handle EntitySchema with empty name', () => {
      const schema = new EntitySchema({
        name: '',
        columns: {},
      });
      expect(getPaginatedQueryServiceToken(schema)).toBe('PaginatedQueryService');
    });
  });
});
