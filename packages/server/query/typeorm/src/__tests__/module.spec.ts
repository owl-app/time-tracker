import { NestjsQueryTypeOrmModule } from '..';

describe('NestjsQueryTypeOrmModule', () => {
  it('should create a module', () => {
    class TestEntity {}

    const typeOrmModule = NestjsQueryTypeOrmModule.forFeature({
      entities: [{ entity: TestEntity }],
    });
    expect(typeOrmModule.imports).toHaveLength(1);
    expect(typeOrmModule.module).toBe(NestjsQueryTypeOrmModule);
    expect(typeOrmModule.providers).toHaveLength(1);
    expect(typeOrmModule.exports).toHaveLength(2);
  });
});
