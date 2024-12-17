import * as v from 'valibot';

const createSchemaWithPasswordRepeat = (
  baseSchema: v.ObjectSchema<v.ObjectEntries, undefined>,
  customValidationPasswordNew:
    | v.BaseValidation<string, string, v.BaseIssue<unknown>>[]
    | null = null,
  customValidationPasswordRepeat:
    | v.BaseValidation<string, string, v.BaseIssue<unknown>>[]
    | null = null
) => {
  const passwordSchema = v.object({
    ...baseSchema.entries,
    passwordNew: v.pipe(
      v.fallback(v.string(), ''),
      ...(customValidationPasswordNew ?? []),
      v.check((input: string) => {
        if (input === '') {
          return true;
        }

        if (input.length < 8) {
          return false;
        }

        return true;
      }, 'Password must be at least 8 characters long')
    ),
    passwordNewRepeat: v.pipe(
      v.fallback(v.string(), ''),
      ...(customValidationPasswordRepeat ?? [])
    ),
  });

  return v.pipe(
    passwordSchema,
    v.forward(
      v.partialCheck(
        [['passwordNew'], ['passwordNewRepeat']],
        (input: { passwordNew: string; passwordNewRepeat: string }) =>
          input.passwordNew === input.passwordNewRepeat,
        'The two passwords do not match'
      ),
      ['passwordNewRepeat']
    )
  );
};

const baseSchema = v.object({
  email: v.optional(v.pipe(v.string(), v.email(), v.nonEmpty('Field is required')), ''),
  firstName: v.nullish(v.string(), null),
  lastName: v.nullish(v.string(), null),
  role: v.pipe(
    v.custom((input) => input !== undefined && input !== null, 'Field is required'),
    v.nonNullish(
      v.object({
        name: v.string(),
        description: v.string(),
      })
    )
  ),
});

export const createUserValidationSchema = v.object({
  ...baseSchema.entries,
  password: v.optional(v.pipe(v.string(), v.nonEmpty('Field is required')), ''),
});

export const updateUserValidationSchema = v.object({
  ...baseSchema.entries,
  password: v.optional(v.string(), ''),
});

export const profileUserValidationSchema = createSchemaWithPasswordRepeat(
  v.object({
    firstName: v.pipe(v.string(), v.nonEmpty('Field is required')),
    lastName: v.pipe(v.string(), v.nonEmpty('Field is required')),
  })
);

export const registerUserValidationSchema = createSchemaWithPasswordRepeat(
  v.object({
    email: v.optional(v.pipe(v.string(), v.email(), v.nonEmpty('Field is required')), ''),
  }),
  [v.nonEmpty('Field is required')],
  [v.nonEmpty('Field is required')]
);

export type UserCreateRequest = v.InferInput<typeof createUserValidationSchema>;
export type UserUpdateRequest = v.InferInput<typeof updateUserValidationSchema>;
export type ProfileRequest = v.InferInput<typeof profileUserValidationSchema>;
export type RegisterRequest = v.InferInput<typeof registerUserValidationSchema>;
