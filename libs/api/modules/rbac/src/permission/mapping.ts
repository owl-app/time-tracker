import { Permission } from '@owl-app/lib-api-core/rbac/types/permission';

import { RbacPermissionMapper } from '../common/permission.mapping';

import { PermissionEntity } from '../domain/entity/permission.entity';

const mapper = new RbacPermissionMapper(PermissionEntity, Permission);

export default mapper;
