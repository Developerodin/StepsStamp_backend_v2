import express from 'express';
import authRoute from './auth.route.js';
import userRoute from './user.route.js';
import docsRoute from './docs.route.js';
import blockchainRoutes from './blockchain.route.js';
import config from '../../config/config.js';
import fitnessRoute from './fitness.route.js';
import pools from "./pools.route.js";
import info from "./info.route.js";
import investors from "./investor.route.js";
import mining from "./mining.route.js";
import notifications from "./notifications.route.js";
import adminRoute from './admin.route.js';
import version from './version.route.js';
import chat from './chat.route.js';
const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

router.use('/blockchains', blockchainRoutes);
router.use('/info', info);
router.use('/fitness', fitnessRoute);
router.use('/pools', pools);
router.use('/investors', investors);
router.use('/mining', mining);
router.use('/notifications', notifications);
router.use('/admin', adminRoute);
router.use('/version', version);
router.use('/chat', chat);

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
