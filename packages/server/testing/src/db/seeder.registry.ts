import { SeederEntity } from 'typeorm-extension';

export interface SeederRegistry {
  readonly seederEntity: SeederEntity[];

  addSeederEntity(seederEntity: SeederEntity | SeederEntity[]): void;

  getSederEntityByClass<T>(seederClass: Function[]): T;

  getResultSeed<T>(name: string): T;
}

export class TestSeederRegistry implements SeederRegistry {
  readonly seederEntity: SeederEntity[] = [];

  constructor(seederEntity: SeederEntity | SeederEntity[] = []) {
    this.addSeederEntity(seederEntity);
  }

  addSeederEntity(seederEntity: SeederEntity | SeederEntity[]): void {
    this.seederEntity.push(...(Array.isArray(seederEntity) ? seederEntity : [seederEntity]));
  }

  getSederEntityByClass<T>(seederClass: Function[]): T {
    return this.seederEntity.filter((seeder) => this.isInstanceOfAny(seeder, seederClass)) as T;
  }

  getResultSeed<T>(name: string): T {
    return this.seederEntity.find((seederEntity) => seederEntity.name === name).result as T;
  }

  private isInstanceOfAny(object: SeederEntity, constructors: Function[]): boolean {
    return constructors.some((constructor) => object.instance instanceof constructor);
  }
}
