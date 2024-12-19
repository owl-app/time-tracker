import { setSeederFactory } from 'typeorm-extension';

import { ClientEntitySchema } from '@owl-app/lib-api-module-client/database/entity-schema/client.entity-schema';
import { ClientEntity } from '@owl-app/lib-api-module-client/domain/entity/client.entity';
import { randUserTenant } from '../../../utils/rand';

export default setSeederFactory(ClientEntitySchema, (faker) => {
    const user = new ClientEntity();

    user.name = faker.company.name();
    user.tenant = randUserTenant();

    console.log(user);

    return user;
})