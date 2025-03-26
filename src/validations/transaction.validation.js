import Joi from 'joi';
import { objectId } from './custom.validation.js';

const getByUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

const getByUserAndType = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    transactionType: Joi.string().valid(
      'deposit',
      'withdrawal',
      'staking',
      'unstaking',
      'swap',
      'referral_bonus',
      'investor_bonus',
      'watch_bonus',
      'phase_bonus',
      'daily_reward',
      'pool_A_reward',
      'pool_B_reward',
      'purchase',
      'deposite_against_purchase'
    ).required(),
  }),
};

export default { getByUser, getByUserAndType };
