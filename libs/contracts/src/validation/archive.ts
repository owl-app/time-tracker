import * as v from 'valibot';

export const archiveValidationSchema = v.object({
  archived: v.optional(v.boolean(), false),
});

export const clientArchiveValidationSchema = v.object({
  ...archiveValidationSchema.entries,
  withProjects: v.boolean(),
});

export type ArchiveRequest = v.InferInput<typeof archiveValidationSchema>;
export type ClientArchiveRequest = v.InferInput<typeof clientArchiveValidationSchema>;
