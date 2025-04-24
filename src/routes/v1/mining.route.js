import express from 'express';
import miningController from '../../controllers/mining.controller.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', miningController.getGlobalMiningStatus); // Get mining statuses for all users
router.patch('/', miningController.updateGlobalMiningStatus); // Update mining statuses for all users

router
  .route('/distribute-green-nft-rewards')
  .post( miningController.distributeGreenNftRewards);

export default router;