import dotenv from 'dotenv';
import Web3 from 'web3';
import cron from 'node-cron';

dotenv.config();

const web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/"));

const contractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_ssbToken",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_busdToken",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_priceOracle",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_companyWalletA",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_companyWalletB",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_companyWalletC",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_greenNFT",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_goldNFT",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_silverNFT",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_blackNFT",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_whiteNFT",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "newWallet",
				"type": "address"
			}
		],
		"name": "CompanyWalletAUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "newWallet",
				"type": "address"
			}
		],
		"name": "CompanyWalletBUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "newWallet",
				"type": "address"
			}
		],
		"name": "CompanyWalletCUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_poolAuserAddresses",
				"type": "address[]"
			},
			{
				"internalType": "address[]",
				"name": "_poolBuserAddresses",
				"type": "address[]"
			}
		],
		"name": "distribute50kDailyDistribution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_userAddresses",
				"type": "address[]"
			}
		],
		"name": "distributeInvestorBonusDaily",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "investor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "bonusAmount",
				"type": "uint256"
			}
		],
		"name": "InvestorBonusDistributed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "nftAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newBonus",
				"type": "uint256"
			}
		],
		"name": "InvestorBonusUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "status",
				"type": "bool"
			}
		],
		"name": "NFTContractWhitelisted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "nftAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPrice",
				"type": "uint256"
			}
		],
		"name": "NFTPriceUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "nftAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "pricePaid",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "purchaseCurrency",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "companyWalletA",
				"type": "address"
			}
		],
		"name": "NFTPurchased",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "nftType",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "referrerNFTaddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "discount",
				"type": "uint256"
			}
		],
		"name": "purchaseNFTWithBNB",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "nftType",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "referrerNFTaddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "discount",
				"type": "uint256"
			}
		],
		"name": "purchaseNFTWithBUSD",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "bonusAmount",
				"type": "uint256"
			}
		],
		"name": "ReferralBonusDistributed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "nftAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newBonus",
				"type": "uint256"
			}
		],
		"name": "ReferralBonusUpdated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newWallet",
				"type": "address"
			}
		],
		"name": "setCompanyWalletA",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newWallet",
				"type": "address"
			}
		],
		"name": "setCompanyWalletB",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newWallet",
				"type": "address"
			}
		],
		"name": "setCompanyWalletC",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_seconds",
				"type": "uint256"
			}
		],
		"name": "setINVESTOR_BONUS_DURATION",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "bonus",
				"type": "uint256"
			}
		],
		"name": "setInvestorBonus",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "bonus",
				"type": "uint256"
			}
		],
		"name": "setReferralBonus",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "bonusAmount",
				"type": "uint256"
			}
		],
		"name": "WelcomeBonusDistributed",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "busdToken",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "companyWalletA",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "companyWalletB",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "companyWalletC",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentPhase",
		"outputs": [
			{
				"internalType": "enum NFTDistribution.Phase",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "INVESTOR_BONUS_DURATION",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "investorBonusEnd",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "investorBonuses",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "investors",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "lastInvestorBonusClaimed",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "latestBNBPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "nftPrices",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "nftPurchased",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "referralBonus",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ssbToken",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ssbtPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "welcomeBonus",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const contractAddress = "0xb596e429007065c3AAE8b6F3F3159EbD870B01a9";
const contract = new web3.eth.Contract(contractABI, contractAddress);

const account = web3.eth.accounts.privateKeyToAccount("8e658813e3dd595b2aa2d15f94cae9dbabf8813ac478fe8a159b59b5d9c4edfd");
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

const MAX_BATCH_SIZE = 100; // 100 per pool (Pool A + Pool B = 200 total per call)

/**
 * Fetches eligible Pool A & Pool B users from the database.
 * Replace with actual logic to fetch users who walked required steps.
 */
async function getEligibleUsers() {
    try {
        const users = await fetchUsersFromDatabase(); // Mock function
        let poolA = [];
        let poolB = [];

        users.forEach(user => {
            if (user.steps >= 1500) {
                poolA.push(user.wallet);
            }
            if (user.steps >= 10000) {
                poolB.push(user.wallet);
            }
        });

        return { poolA, poolB };
    } catch (error) {
        console.error('Error fetching eligible users:', error);
        return { poolA: [], poolB: [] };
    }
}

/**
 * Splits the list into smaller chunks of MAX_BATCH_SIZE
 */
function splitBatches(poolA, poolB) {
    const batches = [];
    let index = 0;

    while (index < poolA.length || index < poolB.length) {
        const batchA = poolA.slice(index, index + MAX_BATCH_SIZE);
        const batchB = poolB.slice(index, index + MAX_BATCH_SIZE);
        batches.push({ batchA, batchB });
        index += MAX_BATCH_SIZE;
    }

    return batches;
}

/**
 * Calls distribute50kDailyDistribution function on the contract in batches
 */
const distribute50kDailyRewards = async () => {
    try {
        const { poolA, poolB } = await getEligibleUsers();

        if (poolA.length === 0 && poolB.length === 0) {
            console.log("No eligible users for Pool A or Pool B today.");
            return;
        }

        console.log(`Total eligible users: Pool A - ${poolA.length}, Pool B - ${poolB.length}`);

        // Create batches where each call includes up to 100 users from Pool A and 100 from Pool B
        const batches = splitBatches(poolA, poolB);

        // Process each batch separately
        for (const { batchA, batchB } of batches) {
            console.log(`Sending batch with Pool A: ${batchA.length}, Pool B: ${batchB.length} users...`);
            await sendTransaction(contract.methods.distribute50kDailyDistribution(batchA, batchB));
        }

    } catch (error) {
        console.error('Error distributing daily 50k rewards:', error);
    }
};

/**
 * Calls distributeInvestorBonusDaily function on the contract
 */
// const distributeInvestorBonusDaily = async () => {
//     try {
//         console.log("Distributing daily investor bonuses...");
//         const tx = contract.methods.distributeInvestorBonusDaily();
//         await sendTransaction(tx);
//     } catch (error) {
//         console.error('Error distributing investor bonuses:', error);
//     }
// };

/**
 * Signs and sends a transaction to the blockchain
 */
const sendTransaction = async (tx) => {
    try {
        const gas = await tx.estimateGas({ from: account.address });
        const gasPrice = await web3.eth.getGasPrice();

        const txData = {
            from: account.address,
            to: contractAddress,
            gas,
            gasPrice,
            data: tx.encodeABI(),
        };

        const signedTx = await web3.eth.accounts.signTransaction(txData, process.env.PRIVATE_KEY);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('Transaction Hash:', receipt.transactionHash);
    } catch (error) {
        console.error('Error sending transaction:', error);
    }
};

// Schedule jobs to run daily at midnight (GMT+00)
cron.schedule('0 0 * * *', async () => {
    console.log('Executing daily rewards distribution at GMT+00...');
    await distribute50kDailyRewards();
   // await distributeInvestorBonusDaily();
});

console.log('Cron jobs set to run daily at midnight GMT+00.');
