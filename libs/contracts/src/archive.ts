export interface Archivable {
  archived: boolean;
}

export enum ArchiveOptions {
  ALL = 'all',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}
