import * as v from 'valibot';

export const timeValidationSchema = v.object({
  description: v.nullish(v.string(), null),
  timeIntervalStart: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  timeIntervalEnd: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
  project: v.pipe(
    v.custom((input) => input !== undefined && input !== null, 'Project is required'),
    v.object({
      id: v.string(),
      name: v.string(),
    })
  ),
  tags: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
    })
  ),
});

export const stopTimeValidationSchema = v.object({
  project: v.pipe(
    v.custom((input) => input !== undefined && input !== null, 'Project is required'),
    v.object({
      id: v.string(),
      name: v.string(),
    })
  ),
  tags: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
    })
  ),
});

export type TimeRequest = v.InferInput<typeof timeValidationSchema>;
export type StartTimeRequest = v.InferInput<typeof stopTimeValidationSchema>;
