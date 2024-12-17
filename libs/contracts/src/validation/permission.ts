import * as v from 'valibot';

export const permissionValidationSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  description: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  refer: v.optional(v.pipe(v.string(), v.nonEmpty('Please select option')), ''),
  collection: v.optional(v.pipe(v.string(), v.nonEmpty('Please select option')), ''),
});

export type PermissionRequest = v.InferInput<typeof permissionValidationSchema>;
