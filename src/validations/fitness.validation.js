import Joi from 'joi';

const updateSteps = {
  body: Joi.object().keys({
    walkingSteps: Joi.number().integer().min(0).required(),
    rewardSteps: Joi.number().integer().min(0).required(),
    source: Joi.string().valid('Google Fit', 'Apple HealthKit', 'Manual').required(),
    userId:Joi.string().required()
  }),
};

const getSteps = {
  query: Joi.object().keys({
    date: Joi.string().regex(/^\d{2}\/\d{2}\/\d{2}$/).optional(),
    monthYear: Joi.string().regex(/^\d{4}-\d{2}$/).optional(),
    userId:Joi.string().optional()
  }),
};

const analysis = {
  params: Joi.object().keys({
    userId:Joi.string().required()
  })
}

export { updateSteps, getSteps, analysis };
