import Joi from 'joi';
import { password } from './custom.validation.js';

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().custom(password),
  }),
};

const updateUser = {
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    isActive: Joi.boolean(),
    role: Joi.string().valid('user', 'admin'),
  }),
};

export { login, register, changePassword, updateUser }; 