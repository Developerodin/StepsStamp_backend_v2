import Joi from 'joi';
import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';


const validate = (schema) => async (req, res, next) => {
  try {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));

    // Use validateAsync instead of validate to support async rules
    const value = await Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validateAsync(object);

    Object.assign(req, value);
    return next();
  } catch (error) {
    let errorMessage;

    // If error is from express-validator, extract error messages
    if (error && typeof error.array === "function") {
      errorMessage = error.array().map(err => err.msg);
    } else {
      // Otherwise, use error.message (for unexpected errors)
      errorMessage = error.message || "An unknown error occurred";
    }
  
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
};

export default validate;

