import * as v from 'valibot';

const baseSchema = v.object({
  description: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  setting: v.object({
    displayName: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
    theme: v.nullish(v.string(), null),
  }),
});

export const createRoleValidationSchema = v.object({
  ...baseSchema.entries,
  name: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
});

export const updateRoleValidationSchema = v.object({
  ...baseSchema.entries,
});

export type RoleCreateRequest = v.InferInput<typeof createRoleValidationSchema>;
export type RoleUpdateRequest = v.InferInput<typeof updateRoleValidationSchema>;
