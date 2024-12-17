import { EntitySchemaColumnOptions } from 'typeorm';

export const TimestampableSchemaPart = {
  createdAt: {
    name: 'created_at',
    type: 'datetime',
    createDate: true,
  } as EntitySchemaColumnOptions,
  updatedAt: {
    name: 'updated_at',
    type: 'datetime',
    updateDate: true,
  } as EntitySchemaColumnOptions,
};
