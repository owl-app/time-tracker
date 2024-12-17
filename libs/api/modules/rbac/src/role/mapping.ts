import { Role } from '@owl-app/rbac-manager';

import { RbacItemMapper } from '../common/mapping';

import { RoleEntity } from '../domain/entity/role.entity';

const mapper = new RbacItemMapper(RoleEntity, Role);

export default mapper;
