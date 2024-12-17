import Joi from 'joi';

export const loginValidation = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});
