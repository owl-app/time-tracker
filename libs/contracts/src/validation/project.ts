import * as v from 'valibot';

export const projectValidationSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  client: v.pipe(
    v.custom((input) => input !== undefined, 'Field is required'),
    v.nonNullish(
      v.object({
        id: v.string(),
        name: v.string(),
      })
    )
  ),
});

export type ProjectRequest = v.InferInput<typeof projectValidationSchema>;
