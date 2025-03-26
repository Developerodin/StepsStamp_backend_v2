import Joi from 'joi';

export const createRating = { 
    body: Joi.object(
        { userId: Joi.string().required(), 
          rating: Joi.number().min(1).max(5).required(),
          suggestion:Joi.string().optional(),
          notes:Joi.string().optional()
        }) 
    };
export const getRating = { params: Joi.object({ userId: Joi.string().required() }) };
export const updateRating = createRating;
export const deleteRating = getRating;

export const createFaq = { body: Joi.object({ category: Joi.string().required(), questions: Joi.array().items(Joi.object({ question: Joi.string().required(), answer: Joi.string().required() })) }) };

export const createInfo = { body: Joi.object({ type: Joi.string().valid('terms', 'privacy').required(), title: Joi.string().required(), content: Joi.string() }) };
