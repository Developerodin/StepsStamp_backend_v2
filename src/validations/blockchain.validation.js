import Joi from 'joi';

const purchase = {
      body: Joi.object().keys({
      userId:Joi.string().required(),
      blockchainId:Joi.string().required(),
      senderWalletId:Joi.string().required(),
      receiverWalletId:Joi.string().required(),
      transactionHash:Joi.string().required(),
      amount:Joi.number().required(),
      currency:Joi.string().required(),
      nftAddress:Joi.string().required(),
      tokenId:Joi.string().required(),
      welcomeBonusAmount:Joi.string().required(),
      referralBonusAmount:Joi.string().optional().allow(''),
      referrerWalletId:Joi.string().optional().allow(''),
      referrerUserId:Joi.string().optional().allow(''),
      referrerNftAddress:Joi.string().optional().allow('')
    }),
  };
  

  const swap = {
    body: Joi.object().keys({
    userId:Joi.string().required(),
    senderWalletId:Joi.string().required(),
    transactionHash:Joi.string().required(),
    amount:Joi.number().required(),
    currency:Joi.string().required(),
  }),
};
  export { purchase, swap };