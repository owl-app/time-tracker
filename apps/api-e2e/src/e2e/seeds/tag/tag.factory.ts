import { setSeederFactory } from 'typeorm-extension';

import { TagEntitySchema } from '@owl-app/lib-api-module-tag/database/entity-schema/tag.entity-schema';
import { TagEntity } from '@owl-app/lib-api-module-tag/domain/entity/tag.entity';

import { generateWithoutWords } from '../../../utils/unique';

export default setSeederFactory(TagEntitySchema, (faker, meta: { unique: string }) => {
    const user = new TagEntity();

    if(meta.unique) {
        user.name = generateWithoutWords(faker.company.name, (meta.unique.split(/\s+/)));
    } else {
        user.name = faker.company.name();
    }

    user.archived = faker.datatype.boolean();

    return user;
})
