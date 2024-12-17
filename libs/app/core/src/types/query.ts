export type Query = {
  fields?: string[] | null;
  sort?: string[] | null;
  filter?: any | null;
  limit?: number | null;
  offset?: number | null;
  page?: number | null;
  search?: string | null;
  version?: string | null;
  versionRaw?: boolean | null;
  export?: 'json' | 'csv' | 'xml' | null;
  group?: string[] | null;
  alias?: Record<string, string> | null;
};
