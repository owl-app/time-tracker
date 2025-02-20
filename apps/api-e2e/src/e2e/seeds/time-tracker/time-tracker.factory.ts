import { setSeederFactory } from 'typeorm-extension';

import { TimeEntitySchema } from '@owl-app/lib-api-module-time-tracker/database/entity-schema/time.entity-schema';
import { TimeEntity } from '@owl-app/lib-api-module-time-tracker/domain/entity/time.entity';

import { generateWithoutWords } from '../../../utils/unique';


export default setSeederFactory(TimeEntitySchema, (faker, meta: { unique: string }) => {
  const time = new TimeEntity();

  if (meta.unique) {
    time.description = generateWithoutWords(faker.word.words, meta.unique.split(/\s+/));
  } else {
    time.description = faker.word.words(5);
  }

  time.timeIntervalStart = faker.date.recent();
  time.timeIntervalEnd = faker.date.future();

  return time;
});
