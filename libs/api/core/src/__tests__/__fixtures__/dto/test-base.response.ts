import { Exclude } from "class-transformer";

export class TestBaseResponse {

  testEntityPk: string;

  stringType: string;

  boolType: boolean;

  numberType: number;

  dateType: Date;

  @Exclude()
  archived: boolean;
}
