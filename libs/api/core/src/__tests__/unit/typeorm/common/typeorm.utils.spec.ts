import { AbstractRepository, EntitySchema, Repository } from 'typeorm';
import { getCustomRepositoryToken, getDataSourcePrefix } from '@nestjs/typeorm';
import { CircularDependencyException } from '@nestjs/core/errors/exceptions/circular-dependency.exception';

import { getRepositoryToken } from '../../../../typeorm/common/typeorm.utils';

jest.mock('@nestjs/typeorm', () => ({
  ...jest.requireActual('@nestjs/typeorm'),
  getDataSourcePrefix: jest.fn(),
}));

describe('TypeOrm', () => {
  describe('getRepositoryToken', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw CircularDependencyException when entity is null or undefined', () => {
      expect(() => getRepositoryToken(null)).toThrow(CircularDependencyException);
      expect(() => getRepositoryToken(undefined)).toThrow(CircularDependencyException);
    });

    it('should return the entity when it is a Repository or AbstractRepository and no dataSourcePrefix', () => {
      class TestRepository extends Repository<any> {}
      class TestAbstractRepository extends AbstractRepository<any> {}

      (getDataSourcePrefix as jest.Mock).mockReturnValue('');

      expect(getRepositoryToken(TestRepository)).toBe(TestRepository);
      expect(getRepositoryToken(TestAbstractRepository)).toBe(TestAbstractRepository);
    });

    it('should return the custom repository token when entity is a Repository or AbstractRepository and dataSourcePrefix exists', () => {
      class TestRepository extends Repository<any> {}
      class TestAbstractRepository extends AbstractRepository<any> {}

      (getDataSourcePrefix as jest.Mock).mockReturnValue('prefix_');

      expect(getRepositoryToken(TestRepository)).toBe('prefix_TestRepository');
      expect(getRepositoryToken(TestAbstractRepository)).toBe('prefix_TestAbstractRepository');
    });

    it('should return the custom repository token when entity is an EntitySchema', () => {
      const entitySchema = new EntitySchema<{ name: string }>({
        name: 'TestEntity',
        columns: {
          name: {
            type: String,
          },
        },
      });

      (getDataSourcePrefix as jest.Mock).mockReturnValue('prefix_');

      expect(getRepositoryToken(entitySchema)).toBe('prefix_TestEntityCustomRepository');
    });

    it('should return the custom repository token when entity is a regular class', () => {
      class TestEntity {}

      (getDataSourcePrefix as jest.Mock).mockReturnValue('prefix_');

      expect(getRepositoryToken(TestEntity)).toBe('prefix_TestEntityCustomRepository');
    });
  });
});
