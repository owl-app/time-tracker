import * as v from 'valibot';

export const roleValidationSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  description: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  setting: v.object({
    displayName: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  }),
});

export type RoleRequest = v.InferInput<typeof roleValidationSchema>;
