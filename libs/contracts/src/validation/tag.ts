import * as v from 'valibot';

export const tagValidationSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  color: v.nullish(v.string(), null),
});

export type TagRequest = v.InferInput<typeof tagValidationSchema>;
