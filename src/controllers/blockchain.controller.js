import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import * as blockchainService from '../services/blockchian.service.js';


/**
 * Get all blockchains
 */
const getAllBlockchains = catchAsync(async (req, res) => {
  const blockchains = await blockchainService.getAllBlockchains();
  res.status(httpStatus.OK).json({ success: true, data: blockchains });
});

/**
 * Get blockchain by ID
 */
const getBlockchainById = catchAsync(async (req, res) => {
  const blockchain = await blockchainService.getBlockchainById(req.params.blockchainId);
  if (!blockchain) {
    return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Blockchain not found' });
  }
  res.status(httpStatus.OK).json({ success: true, data: blockchain });
});


const purchaseBlockchain = catchAsync(async (req, res) => {
  const transaction = await blockchainService.savePurchaseTransaction(req.body);
  res.status(httpStatus.CREATED).json({ message: 'Transaction recorded successfully', data: transaction });
})

const saveSwapping = catchAsync(async (req, res) => {
  //console.log(req.body);
  const transaction = await blockchainService.saveSwapTransaction(req.body);
  
  res.status(httpStatus.CREATED).json({ message: 'Transaction recorded successfully', data: transaction });
})


/**
 * Controller to handle fetching global supply data.
 */
const fetchGlobalSupply = catchAsync(async (req, res) => {
  const globalSupply = await blockchainService.getGlobalSupplyData();
  res.status(200).json({ success: true, data: globalSupply });
});


/**
 * Controller to fetch all phases
 */
const getAllPhases = async (req, res) => {
  try {
    const phases = await blockchainService.fetchAllPhases();
    res.status(200).json({ success: true, data: phases });
  } catch (error) {
    console.error("❌ Error fetching phases:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller to fetch the active phase
 */
const getActivePhase = async (req, res) => {
  try {
    const activePhase = await blockchainService.fetchActivePhase();
    res.status(200).json({ success: true, data: activePhase });
  } catch (error) {
    console.error("❌ Error fetching active phase:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getAllBlockchains, getActivePhase,saveSwapping,
   getAllPhases, fetchGlobalSupply, getBlockchainById, purchaseBlockchain };
