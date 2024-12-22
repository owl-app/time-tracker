import { setSeederFactory } from 'typeorm-extension';

import { ProjectEntitySchema } from '@owl-app/lib-api-module-project/database/entity-schema/project.entity-schema';
import { ProjectEntity } from '@owl-app/lib-api-module-project/domain/entity/project.entity';

import { generateWithoutWords } from '../../../utils/unique';

export default setSeederFactory(ProjectEntitySchema, (faker, meta: { unique: string }) => {
    const user = new ProjectEntity();

    if(meta.unique) {
        user.name = generateWithoutWords(faker.word.words, (meta.unique.split(/\s+/)));
    } else {
        user.name = faker.word.words();
    }

    user.archived = faker.datatype.boolean();

    return user;
})
