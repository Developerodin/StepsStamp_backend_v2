import Joi from 'joi';

const validatePoolA = {
  body: Joi.object().keys({
    userId:Joi.string(),
    stepsRecorded: Joi.number().min(1500).required(), // Pool A requires 1500 steps
  }),
};

const validatePoolB = {
  body: Joi.object().keys({
    userId:Joi.string(),
    stepsRecorded: Joi.number().min(10000).required(), // Pool B requires 10,000 steps
  }),
};

export { validatePoolA, validatePoolB };
