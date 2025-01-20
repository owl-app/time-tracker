import { plainToClass } from "class-transformer";
import { faker } from "@faker-js/faker";

import { TenantEntity } from "../../__fixtures__/tenant.entity";

export const TEST_TENANT_CREATED: TenantEntity[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
  plainToClass(TenantEntity, {
    id: faker.string.uuid(),
    name: faker.lorem.words(3),
  }
)));
