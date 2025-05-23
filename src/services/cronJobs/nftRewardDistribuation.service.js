import dotenv from 'dotenv';
import Web3 from 'web3';
import cron from 'node-cron';
import DailyReward from '../../models/dailyrewards.model.js';
import path from 'path';
import fs from 'fs';
import User from "../../models/user.model.js";
import TransactionHistory from "../../models/transactions.model.js";
import { calculatePoolRewards } from '../nftreward.service.js';

dotenv.config({ path: path.resolve(process.cwd(), '../../../.env') });

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const MAX_BATCH_SIZE = 100; // 100 per pool (Pool A + Pool B = 200 total per call)

if (!PRIVATE_KEY || PRIVATE_KEY.length !== 64) {
    throw new Error("❌ Invalid PRIVATE_KEY! It must be a 64-character hex string without '0x'.");
}

// Web3 & Contract Setup
const WEB3_PROVIDER = process.env.WEB3_PROVIDER;
const web3 = new Web3(new Web3.providers.HttpProvider(WEB3_PROVIDER));

const contractAddress = process.env.DISTRIBUTION;
const contractAddressFK = process.env.FIFTYK_DISTRIBUTION;
const contractMining = process.env.Mining;


console.log('c address'+contractAddress);
const formattedPrivateKey = `0x${PRIVATE_KEY}`;

const ABI = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'DistributionABI.json'), 'utf-8'));
const FIFTYK_ABI = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'fiftyKDistributionABI.json'), 'utf-8'));
const Mining_ABI = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'MiningABI.json'), 'utf-8'));
const contract = new web3.eth.Contract(ABI, contractAddress);
const fiftyKContract = new web3.eth.Contract(FIFTYK_ABI, contractAddressFK);
const miningContract = new web3.eth.Contract(Mining_ABI, contractMining);

const account = web3.eth.accounts.privateKeyToAccount(formattedPrivateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

console.log(`✅ Successfully loaded private key for account: ${account.address}`);

// NFT Addresses
const nftAddresses = {
    Green: process.env.GREEN_NFT,
    Gold:process.env.GOLD_NFT,
    Silver:process.env.SILVER_NFT,
    White:process.env.WHITE_NFT,
    Black:process.env.BLACK_NFT
   };

// 🛠 Send Transaction Helper
const sendTransaction = async (tx) => {
    try {
        const gasPrice = BigInt(await web3.eth.getGasPrice());
        const estimatedGas = BigInt(await tx.estimateGas({ from: account.address }));
        const gasLimit = estimatedGas * BigInt(12) / BigInt(10); // Add 20% buffer
        
        console.log(`⛽ Estimated Gas: ${estimatedGas}, Gas Limit: ${gasLimit}`);

        const txData = {
            from: account.address,
            to: contractAddress,
            gas: Number(gasLimit),
            gasPrice: gasPrice.toString(),
            data: tx.encodeABI(),
        };

        console.log("📡 Sending Transaction: ", txData);

        const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
        console.log("📜 Signed Transaction:", signedTx);

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
       
        console.log(`✅ Transaction Hash: ${receipt.transactionHash}`);
        return receipt.transactionHash; // ✅ Extract and return `hash`
    } catch (error) {
        console.error('❌ Error sending transaction:', error);
        return null;
    }
};

// 📌 Fetch Transaction Details
async function getTransactionDetails(txHash, txType) {
    try {
        const tx = await web3.eth.getTransaction(txHash);
        if (!tx) {
            console.log("❌ Transaction not found!");
            return;
        }

        let currency = "BNB";
        console.log(`🔹 TX Type: ${tx.input === "0x" ? "BNB Transfer" : "Contract Interaction"}`);

        if (tx.input !== "0x") {
            const receipt = await web3.eth.getTransactionReceipt(txHash);
            if (receipt && receipt.logs.length > 0) {
                for (const log of receipt.logs) {
                    if (log.topics[0] === web3.utils.sha3("Transfer(address,address,uint256)")) {
                        let sender = `0x${log.topics[1].slice(26)}`;
                        let receiver = `0x${log.topics[2].slice(26)}`;
                        let amount = BigInt(log.data).toString();

                        // Load token contract to get symbol
                        const tokenContract = new web3.eth.Contract(
                            JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "SSBABI.json"), "utf-8")),
                            log.address
                        );
                        currency = await tokenContract.methods.symbol().call();
                        amount = web3.utils.fromWei(amount, "ether");

                        // Find users with matching receiver wallet
                        const users = await User.find({ decentralizedWalletAddress: receiver });

                        if (users.length === 0) {
                            console.log(`⚠️ No users found for wallet address: ${receiver}`);
                            continue; // Skip saving if no user found
                        }

                        // Save each transaction for all users
                        for (const user of users) {
                            const transaction = new TransactionHistory({
                                userId: user._id,
                                transactionType: txType,
                                amount,
                                currency,
                                transactionHash: txHash,
                                senderWalletId: sender,
                                receiverWalletId: receiver,
                                transactionStatus: "completed",
                            });

                            await transaction.save();
                            console.log(`✅ Transaction saved for User ID: ${user._id}`);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("❌ Error fetching transaction:", error);
    }
}


// 🎯 Distribute Investor Bonus & Save Transactions
export const distributeBonusForAllNFTs = async ()=> {
    for (const [tier, nftAddress] of Object.entries(nftAddresses)) {
        if (nftAddress) {  
            try {
                console.log(`🚀 Distributing bonus for ${tier} NFT at ${nftAddress}`);
                const tx = contract.methods.distributeInvestorBonusDaily(nftAddress);
                try {
                    const gas = await tx.estimateGas({ from: account.address });
                    console.log(`Estimated Gas: ${gas}`);
                
                    const txHash = await sendTransaction(tx);
                    await getTransactionDetails(txHash,"investor_bonus");
                } catch (error) {
                    console.error("Transaction Failed! Revert Reason:", error.message);
                }
            } catch (error) {
                console.error(`❌ Error distributing bonus for ${tier}:`, error);
            }
        }
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


//pool A & Pool B bonus
export const distribute50kDailyRewards = async () => {
   
    try {
       
        const poolA = await DailyReward.find({ poolType: "A" }).select("decentralizedWalletAddress");
        const poolB = await DailyReward.find({ poolType: "B" }).select("decentralizedWalletAddress");
   
        const isValidEthAddress = (addr) => web3.utils.isAddress(addr);
           
        const poolAWallets = [...new Set(poolA.map(doc => doc.decentralizedWalletAddress))] .filter(addr => isValidEthAddress(addr));
       
       const poolBWallets = [...new Set(poolB.map(doc => doc.decentralizedWalletAddress))] .filter(addr => isValidEthAddress(addr));;
        
     
       console.log(`Total eligible users: Pool A - ${poolAWallets}, Pool B - ${poolBWallets}`);
        
        if(poolAWallets.length>0){
           
        const txA = fiftyKContract.methods.distribute50kDailyDistribution(poolAWallets,[]);
        try {
            const gas = await txA.estimateGas({ from: account.address });
            const gasPrice = await web3.eth.getGasPrice();
            const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);
            const CONTRACT_ADDRESS = process.env.FIFTYK_DISTRIBUTION;
            const txData = {
                from: account.address,
                to: CONTRACT_ADDRESS,
                gas: Number(gasLimit),
                gasPrice,
                data: txA.encodeABI()
            };
    
            const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
            console.log("✅ Tx Successful! Hash:", receipt.transactionHash);
            await getTransactionDetails(receipt.transactionHash,"pool_A_reward");
        } catch (error) {
            console.error("❌ Transaction Failed:", error.message);
        }
       }
        
        if(poolBWallets.length>0){
        const txB = fiftyKContract.methods.distribute50kDailyDistribution([], poolBWallets);
        try {
            const gas = await txB.estimateGas({ from: account.address });
            const gasPrice = await web3.eth.getGasPrice();
            const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);
            const CONTRACT_ADDRESS = process.env.FIFTYK_DISTRIBUTION;
            const txData = {
                from: account.address,
                to: CONTRACT_ADDRESS,
                gas: Number(gasLimit),
                gasPrice,
                data: txB.encodeABI()
            };
    
            const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
            console.log("✅ Tx Successful! Hash:", receipt.transactionHash);
            await getTransactionDetails(receipt.transactionHash,"pool_B_reward");
        } catch (error) {
            console.error("❌ Transaction Failed:", error.message);
        }
        }

     } catch (error) {
         console.error('Error distributing daily 50k rewards:', error);
     }
   
};

// Add this helper function at the top with other helper functions
const getNextNonce = async (address) => {
    const nonce = await web3.eth.getTransactionCount(address, 'latest');
    return nonce;
};

// Add delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const distributeMiningDailyRewardsForGreenNft = async () => {
    try {
        const poolAResult = await calculatePoolRewards('A', nftAddresses.Green);
        const poolBResult = await calculatePoolRewards('B', nftAddresses.Green);

        // console.log("poolA result:", poolAResult);
        // console.log("poolB result:", poolBResult);

        // Check if either pool calculation failed
        if (!poolAResult.success || !poolBResult.success) {
            console.log("Pool calculation failed:", {
                poolA: poolAResult.message,
                poolB: poolBResult.message
            });
            return {
                success: false,
                message: "Failed to calculate pool rewards",
                poolA: poolAResult.rewards,
                poolB: poolBResult.rewards
            };
        }

        const poolA = poolAResult.rewards;
        const poolB = poolBResult.rewards;

        const isValidEthAddress = (addr) => web3.utils.isAddress(addr);
           
        // Create object with wallet address as key and tokens as value for Pool A
        const poolARewardsObj = poolA.reduce((acc, user) => {
            if (isValidEthAddress(user.decentralizedWalletAddress)) {
                acc[user.decentralizedWalletAddress] = user.tokens;
            }
            return acc;
        }, {});

        // Create object with wallet address as key and tokens as value for Pool B
        const poolBRewardsObj = poolB.reduce((acc, user) => {
            if (isValidEthAddress(user.decentralizedWalletAddress)) {
                acc[user.decentralizedWalletAddress] = user.tokens;
            }
            return acc;
        }, {});
        
        // Convert objects to arrays
        const poolARewards = Object.entries(poolARewardsObj).map(([address, tokens]) => ({
            [address]: tokens
        }));
        const poolBRewards = Object.entries(poolBRewardsObj).map(([address, tokens]) => ({
            [address]: tokens
        }));
        
        // console.log("Pool A Rewards:", poolARewards);
        // console.log("Pool B Rewards:", poolBRewards);
        
        // Get just the wallet addresses for contract calls
        const poolAWallets = Object.keys(poolARewardsObj);
        const poolBWallets = Object.keys(poolBRewardsObj);
        
        console.log(`Total eligible users: Pool A - ${poolAWallets.length}, Pool B - ${poolBWallets.length}`);
        
        if(poolAWallets.length > 0) {
            // Get current nonce
            const nonce = await getNextNonce(account.address);
            console.log("Current nonce:", nonce);

            // Convert poolARewards to the format expected by the contract
            const poolAAddresses = poolAWallets;
            // Convert decimal tokens to integers (multiply by 10^18)
            const poolARewardValues = poolAWallets.map(address => {
                const tokens = poolARewardsObj[address];
                return web3.utils.toWei(tokens.toString(), 'ether').toString();
            });
            // console.log("poolARewardValues", poolARewardValues);
            // console.log("poolAAddresses", poolAAddresses);
            
            // Log contract details
            console.log("Contract Address:", process.env.Mining);

            // Check if our account is the owner of the contract
            const contractOwner = await miningContract.methods.owner().call();
            console.log("Contract Owner:", contractOwner);
            console.log("Our Account:", account.address);

            const txA = miningContract.methods.updateUserRewards(poolAAddresses, poolARewardValues);
            
            try {
                const gas = await txA.estimateGas({ from: account.address });
                console.log("gas", gas);
                const gasPrice = await web3.eth.getGasPrice();
                const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);
                const CONTRACT_ADDRESS = process.env.Mining;
                const txData = {
                    from: account.address,
                    to: CONTRACT_ADDRESS,
                    gas: Number(gasLimit),
                    gasPrice,
                    nonce: nonce,
                    data: txA.encodeABI()
                };
                console.log("txData", txData);
                const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
                console.log("✅ Tx Successful! Hash for pool A:", receipt.transactionHash);
                await getTransactionDetails(receipt.transactionHash, "pool_A_reward");

                // Wait for transaction to be confirmed
                await delay(1000); // 1 second delay
            } catch (error) {
                console.error("❌ Transaction Failed. Full error:", error);
                if (error.data) {
                    console.error("Error data:", error.data);
                }
                if (error.message) {
                    console.error("Error message:", error.message);
                }
                if (error.reason) {
                    console.error("Error reason:", error.reason);
                }
            }
        }
        
        if(poolBWallets.length > 0) {
            // Get updated nonce after Pool A transaction
            const nonce = await getNextNonce(account.address);
            console.log("Updated nonce for Pool B:", nonce);

            // Convert poolBRewards to the format expected by the contract
            const poolBAddresses = poolBWallets;
            // Convert decimal tokens to integers (multiply by 10^18)
            const poolBRewardValues = poolBWallets.map(address => {
                const tokens = poolBRewardsObj[address];
                return web3.utils.toWei(tokens.toString(), 'ether').toString();
            });

            const txB = miningContract.methods.updateUserRewards(poolBAddresses, poolBRewardValues);
            try {
                // First try to call the function to see if it works
                await txB.call({ from: account.address });
                
                const gas = await txB.estimateGas({ from: account.address });
                const gasPrice = await web3.eth.getGasPrice();
                const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);
                const CONTRACT_ADDRESS = process.env.Mining;
                const txData = {
                    from: account.address,
                    to: CONTRACT_ADDRESS,
                    gas: Number(gasLimit),
                    gasPrice,
                    nonce: nonce,
                    data: txB.encodeABI()
                };
        
                const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
                console.log("✅ Tx Successful! Hash for pool B:", receipt.transactionHash);
                await getTransactionDetails(receipt.transactionHash, "pool_B_reward");
            } catch (error) {
                console.error("❌ Transaction Failed. Full error:", error);
                if (error.data) {
                    console.error("Error data:", error.data);
                }
                if (error.message) {
                    console.error("Error message:", error.message);
                }
                if (error.reason) {
                    console.error("Error reason:", error.reason);
                }
            }
        }

        return {
            success: true,
            message: "Rewards distributed successfully",
            poolA: poolARewards,
            poolB: poolBRewards
        };

    } catch (error) {
        console.error('Error distributing daily mining rewards:', error);
        throw error;
    }
};

export const distributeMiningDailyRewardsForGoldNft = async () => {
    try {
        const poolAResult = await calculatePoolRewards('A', nftAddresses.Gold);
        const poolBResult = await calculatePoolRewards('B', nftAddresses.Gold);

        // console.log("poolA result:", poolAResult);
        // console.log("poolB result:", poolBResult);

        // Check if either pool calculation failed
        if (!poolAResult.success || !poolBResult.success) {
            console.log("Pool calculation failed:", {
                poolA: poolAResult.message,
                poolB: poolBResult.message
            });
            return {
                success: false,
                message: "Failed to calculate pool rewards",
                poolA: poolAResult.rewards,
                poolB: poolBResult.rewards
            };
        }

        const poolA = poolAResult.rewards;
        const poolB = poolBResult.rewards;

        const isValidEthAddress = (addr) => web3.utils.isAddress(addr);
           
        // Create object with wallet address as key and tokens as value for Pool A
        const poolARewardsObj = poolA.reduce((acc, user) => {
            if (isValidEthAddress(user.decentralizedWalletAddress)) {
                acc[user.decentralizedWalletAddress] = user.tokens;
            }
            return acc;
        }, {});

        // Create object with wallet address as key and tokens as value for Pool B
        const poolBRewardsObj = poolB.reduce((acc, user) => {
            if (isValidEthAddress(user.decentralizedWalletAddress)) {
                acc[user.decentralizedWalletAddress] = user.tokens;
            }
            return acc;
        }, {});
        
        // Convert objects to arrays
        const poolARewards = Object.entries(poolARewardsObj).map(([address, tokens]) => ({
            [address]: tokens
        }));
        const poolBRewards = Object.entries(poolBRewardsObj).map(([address, tokens]) => ({
            [address]: tokens
        }));
        
        // console.log("Pool A Rewards:", poolARewards);
        // console.log("Pool B Rewards:", poolBRewards);
        
        // Get just the wallet addresses for contract calls
        const poolAWallets = Object.keys(poolARewardsObj);
        const poolBWallets = Object.keys(poolBRewardsObj);
        
        console.log(`Total eligible users: Pool A - ${poolAWallets.length}, Pool B - ${poolBWallets.length}`);
        
        if(poolAWallets.length > 0) {
            // Get current nonce
            const nonce = await getNextNonce(account.address);
            console.log("Current nonce:", nonce);

            // Convert poolARewards to the format expected by the contract
            const poolAAddresses = poolAWallets;
            // Convert decimal tokens to integers (multiply by 10^18)
            const poolARewardValues = poolAWallets.map(address => {
                const tokens = poolARewardsObj[address];
                return web3.utils.toWei(tokens.toString(), 'ether').toString();
            });
            // console.log("poolARewardValues", poolARewardValues);
            // console.log("poolAAddresses", poolAAddresses);
            
            // Log contract details
            console.log("Contract Address:", process.env.Mining);

            // Check if our account is the owner of the contract
            const contractOwner = await miningContract.methods.owner().call();
            // console.log("Contract Owner:", contractOwner);
            // console.log("Our Account:", account.address);

            const txA = miningContract.methods.updateUserRewards(poolAAddresses, poolARewardValues);
            
            try {
                const gas = await txA.estimateGas({ from: account.address });
                console.log("gas", gas);
                const gasPrice = await web3.eth.getGasPrice();
                const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);
                const CONTRACT_ADDRESS = process.env.Mining;
                const txData = {
                    from: account.address,
                    to: CONTRACT_ADDRESS,
                    gas: Number(gasLimit),
                    gasPrice,
                    nonce: nonce,
                    data: txA.encodeABI()
                };
                console.log("txData", txData);
                const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
                console.log("✅ Tx Successful! Hash for pool A:", receipt.transactionHash);
                await getTransactionDetails(receipt.transactionHash, "pool_A_reward");

                // Wait for transaction to be confirmed
                await delay(1000); // 1 second delay
            } catch (error) {
                console.error("❌ Transaction Failed. Full error:", error);
                if (error.data) {
                    console.error("Error data:", error.data);
                }
                if (error.message) {
                    console.error("Error message:", error.message);
                }
                if (error.reason) {
                    console.error("Error reason:", error.reason);
                }
            }
        }
        
        if(poolBWallets.length > 0) {
            // Get updated nonce after Pool A transaction
            const nonce = await getNextNonce(account.address);
            console.log("Updated nonce for Pool B:", nonce);

            // Convert poolBRewards to the format expected by the contract
            const poolBAddresses = poolBWallets;
            // Convert decimal tokens to integers (multiply by 10^18)
            const poolBRewardValues = poolBWallets.map(address => {
                const tokens = poolBRewardsObj[address];
                return web3.utils.toWei(tokens.toString(), 'ether').toString();
            });

            const txB = miningContract.methods.updateUserRewards(poolBAddresses, poolBRewardValues);
            try {
                // First try to call the function to see if it works
                await txB.call({ from: account.address });
                
                const gas = await txB.estimateGas({ from: account.address });
                const gasPrice = await web3.eth.getGasPrice();
                const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);
                const CONTRACT_ADDRESS = process.env.Mining;
                const txData = {
                    from: account.address,
                    to: CONTRACT_ADDRESS,
                    gas: Number(gasLimit),
                    gasPrice,
                    nonce: nonce,
                    data: txB.encodeABI()
                };
        
                const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
                console.log("✅ Tx Successful! Hash for pool B:", receipt.transactionHash);
                await getTransactionDetails(receipt.transactionHash, "pool_B_reward");
            } catch (error) {
                console.error("❌ Transaction Failed. Full error:", error);
                if (error.data) {
                    console.error("Error data:", error.data);
                }
                if (error.message) {
                    console.error("Error message:", error.message);
                }
                if (error.reason) {
                    console.error("Error reason:", error.reason);
                }
            }
        }

        return {
            success: true,
            message: "Rewards distributed successfully",
            poolA: poolARewards,
            poolB: poolBRewards
        };

    } catch (error) {
        console.error('Error distributing daily mining rewards:', error);
        throw error;
    }
};

export const distributeMiningDailyRewardsForSilverNft = async () => {
    try {
        const poolAResult = await calculatePoolRewards('A', nftAddresses.Silver);
        const poolBResult = await calculatePoolRewards('B', nftAddresses.Silver);

        // console.log("poolA result:", poolAResult);
        // console.log("poolB result:", poolBResult);

        // Check if either pool calculation failed
        if (!poolAResult.success || !poolBResult.success) {
            console.log("Pool calculation failed:", {
                poolA: poolAResult.message,
                poolB: poolBResult.message
            });
            return {
                success: false,
                message: "Failed to calculate pool rewards",
                poolA: poolAResult.rewards,
                poolB: poolBResult.rewards
            };
        }

        const poolA = poolAResult.rewards;
        const poolB = poolBResult.rewards;

        const isValidEthAddress = (addr) => web3.utils.isAddress(addr);
           
        // Create object with wallet address as key and tokens as value for Pool A
        const poolARewardsObj = poolA.reduce((acc, user) => {
            if (isValidEthAddress(user.decentralizedWalletAddress)) {
                acc[user.decentralizedWalletAddress] = user.tokens;
            }
            return acc;
        }, {});

        // Create object with wallet address as key and tokens as value for Pool B
        const poolBRewardsObj = poolB.reduce((acc, user) => {
            if (isValidEthAddress(user.decentralizedWalletAddress)) {
                acc[user.decentralizedWalletAddress] = user.tokens;
            }
            return acc;
        }, {});
        
        // Convert objects to arrays
        const poolARewards = Object.entries(poolARewardsObj).map(([address, tokens]) => ({
            [address]: tokens
        }));
        const poolBRewards = Object.entries(poolBRewardsObj).map(([address, tokens]) => ({
            [address]: tokens
        }));
        
        // console.log("Pool A Rewards:", poolARewards);
        // console.log("Pool B Rewards:", poolBRewards);
        
        // Get just the wallet addresses for contract calls
        const poolAWallets = Object.keys(poolARewardsObj);
        const poolBWallets = Object.keys(poolBRewardsObj);
        
        console.log(`Total eligible users: Pool A - ${poolAWallets.length}, Pool B - ${poolBWallets.length}`);
        
        if(poolAWallets.length > 0) {
            // Get current nonce
            const nonce = await getNextNonce(account.address);
            console.log("Current nonce:", nonce);

            // Convert poolARewards to the format expected by the contract
            const poolAAddresses = poolAWallets;
            // Convert decimal tokens to integers (multiply by 10^18)
            const poolARewardValues = poolAWallets.map(address => {
                const tokens = poolARewardsObj[address];
                return web3.utils.toWei(tokens.toString(), 'ether').toString();
            });
            // console.log("poolARewardValues", poolARewardValues);
            // console.log("poolAAddresses", poolAAddresses);
            
            // Log contract details
            console.log("Contract Address:", process.env.Mining);

            // Check if our account is the owner of the contract
            const contractOwner = await miningContract.methods.owner().call();
            console.log("Contract Owner:", contractOwner);
            console.log("Our Account:", account.address);

            const txA = miningContract.methods.updateUserRewards(poolAAddresses, poolARewardValues);
            
            try {
                const gas = await txA.estimateGas({ from: account.address });
                console.log("gas", gas);
                const gasPrice = await web3.eth.getGasPrice();
                const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);
                const CONTRACT_ADDRESS = process.env.Mining;
                const txData = {
                    from: account.address,
                    to: CONTRACT_ADDRESS,
                    gas: Number(gasLimit),
                    gasPrice,
                    nonce: nonce,
                    data: txA.encodeABI()
                };
                console.log("txData", txData);
                const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
                console.log("✅ Tx Successful! Hash for pool A:", receipt.transactionHash);
                await getTransactionDetails(receipt.transactionHash, "pool_A_reward");

                // Wait for transaction to be confirmed
                await delay(1000); // 1 second delay
            } catch (error) {
                console.error("❌ Transaction Failed. Full error:", error);
                if (error.data) {
                    console.error("Error data:", error.data);
                }
                if (error.message) {
                    console.error("Error message:", error.message);
                }
                if (error.reason) {
                    console.error("Error reason:", error.reason);
                }
            }
        }
        
        if(poolBWallets.length > 0) {
            // Get updated nonce after Pool A transaction
            const nonce = await getNextNonce(account.address);
            console.log("Updated nonce for Pool B:", nonce);

            // Convert poolBRewards to the format expected by the contract
            const poolBAddresses = poolBWallets;
            // Convert decimal tokens to integers (multiply by 10^18)
            const poolBRewardValues = poolBWallets.map(address => {
                const tokens = poolBRewardsObj[address];
                return web3.utils.toWei(tokens.toString(), 'ether').toString();
            });

            const txB = miningContract.methods.updateUserRewards(poolBAddresses, poolBRewardValues);
            try {
                // First try to call the function to see if it works
                await txB.call({ from: account.address });
                
                const gas = await txB.estimateGas({ from: account.address });
                const gasPrice = await web3.eth.getGasPrice();
                const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);
                const CONTRACT_ADDRESS = process.env.Mining;
                const txData = {
                    from: account.address,
                    to: CONTRACT_ADDRESS,
                    gas: Number(gasLimit),
                    gasPrice,
                    nonce: nonce,
                    data: txB.encodeABI()
                };
        
                const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
                console.log("✅ Tx Successful! Hash for pool B:", receipt.transactionHash);
                await getTransactionDetails(receipt.transactionHash, "pool_B_reward");
            } catch (error) {
                console.error("❌ Transaction Failed. Full error:", error);
                if (error.data) {
                    console.error("Error data:", error.data);
                }
                if (error.message) {
                    console.error("Error message:", error.message);
                }
                if (error.reason) {
                    console.error("Error reason:", error.reason);
                }
            }
        }

        return {
            success: true,
            message: "Rewards distributed successfully",
            poolA: poolARewards,
            poolB: poolBRewards
        };

    } catch (error) {
        console.error('Error distributing daily mining rewards:', error);
        throw error;
    }
};

export const distributeMiningDailyRewardsForWhiteNft = async () => {
    try {
        const poolAResult = await calculatePoolRewards('A', nftAddresses.White);
        const poolBResult = await calculatePoolRewards('B', nftAddresses.White);

        // console.log("poolA result:", poolAResult);
        // console.log("poolB result:", poolBResult);

        // Check if either pool calculation failed
        if (!poolAResult.success || !poolBResult.success) {
            console.log("Pool calculation failed:", {
                poolA: poolAResult.message,
                poolB: poolBResult.message
            });
            return {
                success: false,
                message: "Failed to calculate pool rewards",
                poolA: poolAResult.rewards,
                poolB: poolBResult.rewards
            };
        }

        const poolA = poolAResult.rewards;
        const poolB = poolBResult.rewards;

        const isValidEthAddress = (addr) => web3.utils.isAddress(addr);
           
        // Create object with wallet address as key and tokens as value for Pool A
        const poolARewardsObj = poolA.reduce((acc, user) => {
            if (isValidEthAddress(user.decentralizedWalletAddress)) {
                acc[user.decentralizedWalletAddress] = user.tokens;
            }
            return acc;
        }, {});

        // Create object with wallet address as key and tokens as value for Pool B
        const poolBRewardsObj = poolB.reduce((acc, user) => {
            if (isValidEthAddress(user.decentralizedWalletAddress)) {
                acc[user.decentralizedWalletAddress] = user.tokens;
            }
            return acc;
        }, {});
        
        // Convert objects to arrays
        const poolARewards = Object.entries(poolARewardsObj).map(([address, tokens]) => ({
            [address]: tokens
        }));
        const poolBRewards = Object.entries(poolBRewardsObj).map(([address, tokens]) => ({
            [address]: tokens
        }));
        
        // console.log("Pool A Rewards:", poolARewards);
        // console.log("Pool B Rewards:", poolBRewards);
        
        // Get just the wallet addresses for contract calls
        const poolAWallets = Object.keys(poolARewardsObj);
        const poolBWallets = Object.keys(poolBRewardsObj);
        
        console.log(`Total eligible users: Pool A - ${poolAWallets.length}, Pool B - ${poolBWallets.length}`);
        
        if(poolAWallets.length > 0) {
            // Get current nonce
            const nonce = await getNextNonce(account.address);
            console.log("Current nonce:", nonce);

            // Convert poolARewards to the format expected by the contract
            const poolAAddresses = poolAWallets;
            // Convert decimal tokens to integers (multiply by 10^18)
            const poolARewardValues = poolAWallets.map(address => {
                const tokens = poolARewardsObj[address];
                return web3.utils.toWei(tokens.toString(), 'ether').toString();
            });
            // console.log("poolARewardValues", poolARewardValues);
            // console.log("poolAAddresses", poolAAddresses);
            
            // Log contract details
            console.log("Contract Address:", process.env.Mining);

            // Check if our account is the owner of the contract
            const contractOwner = await miningContract.methods.owner().call();
            console.log("Contract Owner:", contractOwner);
            console.log("Our Account:", account.address);

            const txA = miningContract.methods.updateUserRewards(poolAAddresses, poolARewardValues);
            
            try {
                const gas = await txA.estimateGas({ from: account.address });
                console.log("gas", gas);
                const gasPrice = await web3.eth.getGasPrice();
                const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);
                const CONTRACT_ADDRESS = process.env.Mining;
                const txData = {
                    from: account.address,
                    to: CONTRACT_ADDRESS,
                    gas: Number(gasLimit),
                    gasPrice,
                    nonce: nonce,
                    data: txA.encodeABI()
                };
                console.log("txData", txData);
                const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
                console.log("✅ Tx Successful! Hash for pool A:", receipt.transactionHash);
                await getTransactionDetails(receipt.transactionHash, "pool_A_reward");

                // Wait for transaction to be confirmed
                await delay(1000); // 1 second delay
            } catch (error) {
                console.error("❌ Transaction Failed. Full error:", error);
                if (error.data) {
                    console.error("Error data:", error.data);
                }
                if (error.message) {
                    console.error("Error message:", error.message);
                }
                if (error.reason) {
                    console.error("Error reason:", error.reason);
                }
            }
        }
        
        if(poolBWallets.length > 0) {
            // Get updated nonce after Pool A transaction
            const nonce = await getNextNonce(account.address);
            console.log("Updated nonce for Pool B:", nonce);

            // Convert poolBRewards to the format expected by the contract
            const poolBAddresses = poolBWallets;
            // Convert decimal tokens to integers (multiply by 10^18)
            const poolBRewardValues = poolBWallets.map(address => {
                const tokens = poolBRewardsObj[address];
                return web3.utils.toWei(tokens.toString(), 'ether').toString();
            });

            const txB = miningContract.methods.updateUserRewards(poolBAddresses, poolBRewardValues);
            try {
                // First try to call the function to see if it works
                await txB.call({ from: account.address });
                
                const gas = await txB.estimateGas({ from: account.address });
                const gasPrice = await web3.eth.getGasPrice();
                const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);
                const CONTRACT_ADDRESS = process.env.Mining;
                const txData = {
                    from: account.address,
                    to: CONTRACT_ADDRESS,
                    gas: Number(gasLimit),
                    gasPrice,
                    nonce: nonce,
                    data: txB.encodeABI()
                };
        
                const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
                console.log("✅ Tx Successful! Hash for pool B:", receipt.transactionHash);
                await getTransactionDetails(receipt.transactionHash, "pool_B_reward");
            } catch (error) {
                console.error("❌ Transaction Failed. Full error:", error);
                if (error.data) {
                    console.error("Error data:", error.data);
                }
                if (error.message) {
                    console.error("Error message:", error.message);
                }
                if (error.reason) {
                    console.error("Error reason:", error.reason);
                }
            }
        }

        return {
            success: true,
            message: "Rewards distributed successfully",
            poolA: poolARewards,
            poolB: poolBRewards
        };

    } catch (error) {
        console.error('Error distributing daily mining rewards:', error);
        throw error;
    }
};

export const distributeMiningDailyRewardsForBlackNft = async () => {
    try {
        const poolAResult = await calculatePoolRewards('A', nftAddresses.Black);
        const poolBResult = await calculatePoolRewards('B', nftAddresses.Black);

        // console.log("poolA result:", poolAResult);
        // console.log("poolB result:", poolBResult);

        // Check if either pool calculation failed
        if (!poolAResult.success || !poolBResult.success) {
            console.log("Pool calculation failed:", {
                poolA: poolAResult.message,
                poolB: poolBResult.message
            });
            return {
                success: false,
                message: "Failed to calculate pool rewards",
                poolA: poolAResult.rewards,
                poolB: poolBResult.rewards
            };
        }

        const poolA = poolAResult.rewards;
        const poolB = poolBResult.rewards;

        const isValidEthAddress = (addr) => web3.utils.isAddress(addr);
           
        // Create object with wallet address as key and tokens as value for Pool A
        const poolARewardsObj = poolA.reduce((acc, user) => {
            if (isValidEthAddress(user.decentralizedWalletAddress)) {
                acc[user.decentralizedWalletAddress] = user.tokens;
            }
            return acc;
        }, {});

        // Create object with wallet address as key and tokens as value for Pool B
        const poolBRewardsObj = poolB.reduce((acc, user) => {
            if (isValidEthAddress(user.decentralizedWalletAddress)) {
                acc[user.decentralizedWalletAddress] = user.tokens;
            }
            return acc;
        }, {});
        
        // Convert objects to arrays
        const poolARewards = Object.entries(poolARewardsObj).map(([address, tokens]) => ({
            [address]: tokens
        }));
        const poolBRewards = Object.entries(poolBRewardsObj).map(([address, tokens]) => ({
            [address]: tokens
        }));
        
        // console.log("Pool A Rewards:", poolARewards);
        // console.log("Pool B Rewards:", poolBRewards);
        
        // Get just the wallet addresses for contract calls
        const poolAWallets = Object.keys(poolARewardsObj);
        const poolBWallets = Object.keys(poolBRewardsObj);
        
        console.log(`Total eligible users: Pool A - ${poolAWallets.length}, Pool B - ${poolBWallets.length}`);
        
        if(poolAWallets.length > 0) {
            // Get current nonce
            const nonce = await getNextNonce(account.address);
            console.log("Current nonce:", nonce);

            // Convert poolARewards to the format expected by the contract
            const poolAAddresses = poolAWallets;
            // Convert decimal tokens to integers (multiply by 10^18)
            const poolARewardValues = poolAWallets.map(address => {
                const tokens = poolARewardsObj[address];
                return web3.utils.toWei(tokens.toString(), 'ether').toString();
            });
            // console.log("poolARewardValues", poolARewardValues);
            // console.log("poolAAddresses", poolAAddresses);
            
            // Log contract details
            console.log("Contract Address:", process.env.Mining);

            // Check if our account is the owner of the contract
            const contractOwner = await miningContract.methods.owner().call();
            console.log("Contract Owner:", contractOwner);
            console.log("Our Account:", account.address);

            const txA = miningContract.methods.updateUserRewards(poolAAddresses, poolARewardValues);
            
            try {
                const gas = await txA.estimateGas({ from: account.address });
                console.log("gas", gas);
                const gasPrice = await web3.eth.getGasPrice();
                const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);
                const CONTRACT_ADDRESS = process.env.Mining;
                const txData = {
                    from: account.address,
                    to: CONTRACT_ADDRESS,
                    gas: Number(gasLimit),
                    gasPrice,
                    nonce: nonce,
                    data: txA.encodeABI()
                };
                console.log("txData", txData);
                const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
                console.log("✅ Tx Successful! Hash for pool A:", receipt.transactionHash);
                await getTransactionDetails(receipt.transactionHash, "pool_A_reward");

                // Wait for transaction to be confirmed
                await delay(1000); // 1 second delay
            } catch (error) {
                console.error("❌ Transaction Failed. Full error:", error);
                if (error.data) {
                    console.error("Error data:", error.data);
                }
                if (error.message) {
                    console.error("Error message:", error.message);
                }
                if (error.reason) {
                    console.error("Error reason:", error.reason);
                }
            }
        }
        
        if(poolBWallets.length > 0) {
            // Get updated nonce after Pool A transaction
            const nonce = await getNextNonce(account.address);
            console.log("Updated nonce for Pool B:", nonce);

            // Convert poolBRewards to the format expected by the contract
            const poolBAddresses = poolBWallets;
            // Convert decimal tokens to integers (multiply by 10^18)
            const poolBRewardValues = poolBWallets.map(address => {
                const tokens = poolBRewardsObj[address];
                return web3.utils.toWei(tokens.toString(), 'ether').toString();
            });

            const txB = miningContract.methods.updateUserRewards(poolBAddresses, poolBRewardValues);
            try {
                // First try to call the function to see if it works
                await txB.call({ from: account.address });
                
                const gas = await txB.estimateGas({ from: account.address });
                const gasPrice = await web3.eth.getGasPrice();
                const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);
                const CONTRACT_ADDRESS = process.env.Mining;
                const txData = {
                    from: account.address,
                    to: CONTRACT_ADDRESS,
                    gas: Number(gasLimit),
                    gasPrice,
                    nonce: nonce,
                    data: txB.encodeABI()
                };
        
                const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
                console.log("✅ Tx Successful! Hash for pool B:", receipt.transactionHash);
                await getTransactionDetails(receipt.transactionHash, "pool_B_reward");
            } catch (error) {
                console.error("❌ Transaction Failed. Full error:", error);
                if (error.data) {
                    console.error("Error data:", error.data);
                }
                if (error.message) {
                    console.error("Error message:", error.message);
                }
                if (error.reason) {
                    console.error("Error reason:", error.reason);
                }
            }
        }

        return {
            success: true,
            message: "Rewards distributed successfully",
            poolA: poolARewards,
            poolB: poolBRewards
        };

    } catch (error) {
        console.error('Error distributing daily mining rewards:', error);
        throw error;
    }
};



cron.schedule('0 0 * * *', async() => {
  await distributeMiningDailyRewardsForGreenNft();
  await distributeMiningDailyRewardsForGoldNft();
  await distributeMiningDailyRewardsForSilverNft();
  await distributeMiningDailyRewardsForWhiteNft();
  await distributeMiningDailyRewardsForBlackNft();


  console.log("This function runs after 10 seconds.");

  },{
    timezone: 'Etc/UTC' // 🔥 This ensures it runs at GMT-00
  }
); // 10000 milliseconds = 10 seconds


console.log('⏳ Cron job set to run daily at GMT+00.');
