import * as v from 'valibot';

export const createPermissionValidationSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  description: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  refer: v.optional(v.pipe(v.string(), v.nonEmpty('Please select option')), ''),
  collection: v.optional(v.pipe(v.string(), v.nonEmpty('Please select option')), ''),
});

export const updatePermissionValidationSchema = v.object({
  description: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
});

export type PermissionCreateRequest = v.InferInput<typeof createPermissionValidationSchema>;
export type PermissionUpdateRequest = v.InferInput<typeof updatePermissionValidationSchema>;
