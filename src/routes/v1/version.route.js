import express from 'express';
import versionController from '../../controllers/version.controller.js';

const router = express.Router();

// Route to create or update the version (for all users)
router.post('/', versionController.createOrUpdateVersion);
router.post('/checkVersion', versionController.checkAppVersion);

// Route to get the version (for all users)
router.get('/', versionController.getVersion);

export default router;