import Joi from 'joi';

const validateDiscount = {
  body: Joi.object().keys({
    userId:Joi.string().required(),
    code: Joi.string().required().uppercase().trim(),
  }),
};

const applyDiscount = {
  body: Joi.object().keys({
    userId:Joi.string().required(),
    code: Joi.string().required().uppercase().trim(),
    totalAmount: Joi.number().required().min(0),
  }),
};

export { validateDiscount, applyDiscount };
