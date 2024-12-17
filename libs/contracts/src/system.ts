export enum AvalilableCollections {
  USER = 'User',
  CLIENT = 'Client',
  ROLE = 'Role',
  PERMISSION = 'Permission',
  TIME = 'Time',
  TAG = 'Tag',
  PROJECT = 'Project',
}

export enum CommonActions {
  ARCHIVE = 'ARCHIVE',
  RESTORE = 'RESTORE',
}

export enum CrudActions {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LIST = 'LIST',
}

export enum ClientActions {
  AVAILABLE = 'AVAILABLE',
}

export enum UserActions {
  ME = 'ME',
  LOGOUT = 'LOGOUT',
  ASSIGN_ACCESS = 'ASSIGN_ACCESS',
  PERMISSIONS = 'PERMISSIONS',
  PROFILE = 'PROFILE',
}

export enum TagActions {
  AVAILABLE = 'AVAILABLE',
}

export enum ProjectActions {
  AVAILABLE = 'AVAILABLE',
}

export enum RoleActions {
  ASSIGN = 'ASSIGN',
  REVOKE = 'REVOKE',
  ASSIGNED_PERMISSIONS = 'ASSIGNED_PERMISSIONS',
  AVAILABLE = 'AVAILABLE',
}

export enum TimeActions {
  START_WATCH = 'START_WATCH',
  STOP_WATCH = 'STOP_WATCH',
  CONTINUE_WATCH = 'CONTINUE_WATCH',
  IN_PROGRESS = 'IN_PROGRESS',
  EXPORT_CSV = 'EXPORT_CSV',
}

export enum AvalilableRouteCollections {
  USER = 'User',
  CLIENT = 'Client',
  ROLE = 'Role',
  PERMISSION = 'Permission',
  TIME = 'Time',
  TAG = 'Tag',
}
