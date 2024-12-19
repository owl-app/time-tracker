import { shuffle } from 'lodash';

import { Tenant } from '@owl-app/lib-contracts';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';

export function randUserTenant(): Tenant {
  return shuffle(Object.values(dataUsers).map((user) => user.tenant))[0];
}