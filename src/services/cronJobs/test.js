import dotenv from 'dotenv';
import Web3 from 'web3';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../../.env') });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PROVIDER_URL = process.env.WEB3_PROVIDER;
const CONTRACT_ADDRESS = process.env.FIFTYK_DISTRIBUTION;

if (!PRIVATE_KEY || PRIVATE_KEY.length !== 64) {
    throw new Error("❌ Invalid PRIVATE_KEY!");
}

const web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));
const formattedPrivateKey = `0x${PRIVATE_KEY}`;
const account = web3.eth.accounts.privateKeyToAccount(formattedPrivateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

console.log("✅ Using Account:", account.address);

// Load ABI from the correct path
const FIFTYK_ABI = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'fiftyKDistributionABI.json'), 'utf8'));

const contract = new web3.eth.Contract(FIFTYK_ABI, CONTRACT_ADDRESS);

// 🧪 Sample Valid Addresses (replace with real ones)
const poolAWallets = [];
const poolBWallets = ["0xFeE3eAc0ae5cA4f0e3db3c2EC10Caa510DA6d7A0"];

function validateAddresses(arr) {
    return arr.filter(addr => web3.utils.isAddress(addr));
}

async function send50kDailyRewards() {
    const validA = validateAddresses(poolAWallets).slice(0, 100);
    const validB = validateAddresses(poolBWallets).slice(0, 100);

    console.log("🚀 Sending daily rewards...");
    console.log("Pool A:", validA);
    console.log("Pool B:", validB);

    const tx = contract.methods.distribute50kDailyDistribution(validA, validB);

    try {
        const gas = await tx.estimateGas({ from: account.address });
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = BigInt(gas) * BigInt(12) / BigInt(10);

        const txData = {
            from: account.address,
            to: CONTRACT_ADDRESS,
            gas: Number(gasLimit),
            gasPrice,
            data: tx.encodeABI()
        };

        const signedTx = await web3.eth.accounts.signTransaction(txData, formattedPrivateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log("✅ Tx Successful! Hash:", receipt.transactionHash);
    } catch (error) {
        console.error("❌ Transaction Failed:", error.message);
    }
}

send50kDailyRewards();