import express from 'express';
import * as blockchainController from '../../controllers/blockchain.controller.js'
import * as blockchainValidation from '../../validations/blockchain.validation.js';
import validate from '../../middlewares/validate.js';
import * as discountValidation from '../../validations/discount.validation.js';
import * as discountController from '../../controllers/discount.controller.js';
import transactionController from '../../controllers/transaction.controller.js';
import transactionValidation from '../../validations/transaction.validation.js';

const router = express.Router();

router.post('/saveSwap', validate(blockchainValidation.swap), blockchainController.saveSwapping);


// 🚀 Purchase blockchain
router.post('/purchaseBlockchain', validate(blockchainValidation.purchase), blockchainController.purchaseBlockchain);

// 🚀 Discount codes
router.post('/validateDiscountCode', validate(discountValidation.validateDiscount), discountController.checkDiscount);
router.post('/applyDiscountCode', validate(discountValidation.applyDiscount), discountController.applyDiscountCode);



//distribute 30 day bonus
router.post('/distribute30day',  transactionController.distribute30day);


//distribute 50k rewards
router.post('/distribute50k',  transactionController.distribute50k);




// 🚀 Fetch all transactions
router.get('/transactions', transactionController.getAllTransactions);

// 🚀 Fetch transactions by userId
router.get('/transactions/user/:userId', validate(transactionValidation.getByUser), transactionController.getTransactionsByUser);

// 🚀 Fetch transactions by userId and type
router.get('/transactions/user/:userId/type/:transactionType', validate(transactionValidation.getByUserAndType), transactionController.getTransactionsByUserAndType);



// 🚀 Get global data
router.get('/getActivePhase', blockchainController.getActivePhase);
router.get('/getPhaseData', blockchainController.getAllPhases);
router.get('/getGlobalSupply', blockchainController.fetchGlobalSupply);


// ✅ Move `/:blockchainId` to the end
router.get('/:blockchainId', (req, res, next) => {
    const { blockchainId } = req.params;

    // 🚨 Prevent treating named routes as IDs
    if (blockchainId === 'saveSwap') {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    blockchainController.getBlockchainById(req, res, next);
});




// 🚀 Get all blockchains
router.get('/', blockchainController.getAllBlockchains);

export default router;
   