import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Tag } from '@owl-app/lib-contracts';

import { TagEntitySchema } from '@owl-app/lib-api-module-tag/database/entity-schema/tag.entity-schema';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';

import { uniqueTagName } from '../unique';

export default class TagSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<Partial<Tag[]>> {
    const userFactory = await factoryManager.get(TagEntitySchema);

    let tags: Tag[] = [];
    const promises: Promise<Tag[]>[] = [];

    Object.values(dataUsers).map((users) =>
      users.map(async (user) => {
        userFactory.setMeta({ unique: uniqueTagName });
        promises.push(
          userFactory.saveMany(1, {
            name: uniqueTagName,
            tenant: user.tenant,
            archived: false,
          })
        );

        userFactory.setMeta({});
        promises.push(
          userFactory.saveMany(5, {
            tenant: user.tenant,
            archived: true,
          })
        );
        promises.push(
          userFactory.saveMany(5, {
            tenant: user.tenant,
            archived: false,
          })
        );
      })
    );

    tags = await Promise.all(promises).then((results) => results.flat());

    return tags;
  }
}
