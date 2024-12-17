import * as v from 'valibot';

export const loginValidationSchema = v.object({
  email: v.optional(v.pipe(v.string(), v.email(), v.nonEmpty('Field is required')), ''),
  password: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
});

export type LoginRequest = v.InferInput<typeof loginValidationSchema>;
