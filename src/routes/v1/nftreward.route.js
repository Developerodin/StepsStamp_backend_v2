import express from 'express';
import nftRewardController from '../../controllers/nftreward.controller.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

router
  .route('/pool-rewards')
  .get( nftRewardController.getPoolRewards);

router
  .route('/distribute-all-rewards')
  .post(nftRewardController.distributeAllRewards);

export default router; 