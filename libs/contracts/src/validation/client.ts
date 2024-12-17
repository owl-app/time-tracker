import * as v from 'valibot';

export const createClientValidationSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
});

export const updateClientValidationSchema = v.object({
  name: v.nonNullish(
    v.optional(
      v.pipe(v.nullish(v.string(), null), v.string(), v.nonEmpty('Field is required')),
      ''
    ),
    'Field is required'
  ),
  email: v.nonNullish(
    v.optional(
      v.pipe(v.nullish(v.string(), null), v.string(), v.email(), v.nonEmpty('Field is required')),
      ''
    ),
    'Field is required'
  ),
});

export type CreateClientRequest = v.InferInput<typeof createClientValidationSchema>;
export type UpdateClientRequest = v.InferInput<typeof updateClientValidationSchema>;
