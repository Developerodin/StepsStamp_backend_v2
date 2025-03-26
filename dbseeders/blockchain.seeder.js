import mongoose from 'mongoose';
import { Blockchain, GlobalSupply, Phase } from '../src/models/blockchain.model.js';
import Discount from '../src/models/discount.model.js';
import { Faq } from '../src/models/info.model.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), "../.env");

dotenv.config({ path: envPath });

console.log(process.env.GREEN_NFT);

const blockchainData = [
  {
    name: "Green SS",
    nftTypes: [
      { name: "Fresh", blocks: 450 },
      { name: "mini", blocks: 150 },
      { name: "micro", blocks: 75 }
    ],
    phaseWiseBonuses: [
      { phaseName: "A", phaseBonus: 40000, investorBonus: { days: 30, dailyBonusToken: 500 }, watchBonus: { days: 730, dailyBonusToken: 100 }, totalWithdrawalLimit: 1000 },
      { phaseName: "B", phaseBonus: 30000, investorBonus: { days: 30, dailyBonusToken: 500 }, watchBonus: { days: 730, dailyBonusToken: 100 }, totalWithdrawalLimit: 2000 },
      { phaseName: "C", phaseBonus: 20000, investorBonus: { days: 30, dailyBonusToken: 500 }, watchBonus: { days: 730, dailyBonusToken: 100 }, totalWithdrawalLimit: 3000 },
      { phaseName: "D", phaseBonus: 15000, investorBonus: { days: 30, dailyBonusToken: 500 }, watchBonus: { days: 730, dailyBonusToken: 100 }, totalWithdrawalLimit: 4000 },
      { phaseName: "E", phaseBonus: 10000, investorBonus: { days: 30, dailyBonusToken: 500 }, watchBonus: { days: 730, dailyBonusToken: 100 }, totalWithdrawalLimit: 5000 }
    ],
    dailyMineCap: 2299,
    contractAddress: "0x123456789abcdef",
    nftAddress:process.env.GREEN_NFT,
    tokenUri:"https://teal-obvious-tahr-119.mypinata.cloud/ipfs/bafkreibjyr4bcacbnkrvqxgrvjl3yutyiaife3wv4udvfbxowamzwgng7u",
    icon: "../../assets/icons/Green_Icon.png",
    gradient: "../../assets/images/CardTopGreen.png",
  
    styles: {
      gradient: {
        width: "width * 0.73",
        height: "height * 0.18",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: 20,
      },
      title: {
        color: "#fff",
        fontSize: 18,
        textAlign: "center",
        fontFamily: "Lexend",
      },
      price: {
        color: "#fff",
        fontSize: 24,
        marginTop: 4,
        textAlign: "center",
        fontFamily: "Lexend-Bold",
      },
    },
    mainNftPrice: 10000,
    referPercentage: 15
  },
  {
    name: "Gold SS",
    nftTypes: [
      { name: "Fresh", blocks: 450 },
      { name: "mini", blocks: 150 },
      { name: "micro", blocks: 75 }
    ],
    phaseWiseBonuses: [
      { phaseName: "A", phaseBonus: 20000, investorBonus: { days: 30, dailyBonusToken: 167 }, watchBonus: { days: 450, dailyBonusToken: 50 }, totalWithdrawalLimit: 500 },
      { phaseName: "B", phaseBonus: 15000, investorBonus: { days: 30, dailyBonusToken: 167 }, watchBonus: { days: 450, dailyBonusToken: 50 }, totalWithdrawalLimit: 1000 },
      { phaseName: "C", phaseBonus: 10000, investorBonus: { days: 30, dailyBonusToken: 167 }, watchBonus: { days: 450, dailyBonusToken: 50 }, totalWithdrawalLimit: 1500 },
      { phaseName: "D", phaseBonus: 7500, investorBonus: { days: 30, dailyBonusToken: 167 }, watchBonus: { days: 450, dailyBonusToken: 50 }, totalWithdrawalLimit: 2000 },
      { phaseName: "E", phaseBonus: 10000, investorBonus: { days: 30, dailyBonusToken: 167 }, watchBonus: { days: 450, dailyBonusToken: 50 }, totalWithdrawalLimit: 2500 }
    ],
    nftAddress:process.env.GOLD_NFT,
    dailyMineCap: 1919,
    contractAddress: "0x123456789abcdef",
    icon: "../../assets/icons/Gold_Icon.png",
    gradient: "../../assets/images/CardTopGold.png",
    tokenUri:"https://teal-obvious-tahr-119.mypinata.cloud/ipfs/bafkreia5si2ltnjep6tuajiumy4xhb2uokxaffzpc4j6nw2sjgzizwwvoa",
     
    mainNftPrice: 5000,
    referPercentage: 10
  },
  {
    name: "Silver SS",
    nftTypes: [
      { name: "Fresh", blocks: 450 },
      { name: "mini", blocks: 150 },
      { name: "micro", blocks: 75 }
    ],
    phaseWiseBonuses: [
      { phaseName: "A", phaseBonus: 4000, investorBonus: { days: 30, dailyBonusToken: 16 }, watchBonus: { days: 300, dailyBonusToken: 10 }, totalWithdrawalLimit: 100 },
      { phaseName: "B", phaseBonus: 3000, investorBonus: { days: 30, dailyBonusToken: 16 }, watchBonus: { days: 300, dailyBonusToken: 10 }, totalWithdrawalLimit: 200 },
      { phaseName: "C", phaseBonus: 2000, investorBonus: { days: 30, dailyBonusToken: 16 }, watchBonus: { days: 300, dailyBonusToken: 10 }, totalWithdrawalLimit: 300 },
      { phaseName: "D", phaseBonus: 1500, investorBonus: { days: 30, dailyBonusToken: 16 }, watchBonus: { days: 300, dailyBonusToken: 10 }, totalWithdrawalLimit: 400 },
      { phaseName: "E", phaseBonus: 1000, investorBonus: { days: 30, dailyBonusToken: 16 }, watchBonus: { days: 300, dailyBonusToken: 10 }, totalWithdrawalLimit: 500 }
    ],
    dailyMineCap: 1534,
    nftAddress:process.env.SILVER_NFT,
    contractAddress: "0x123456789abcdef",
    icon: "../../assets/icons/Silver_Icon_Big.png",
    gradient: "../../assets/images/CardTopSilver.png",
    tokenUri:"https://teal-obvious-tahr-119.mypinata.cloud/ipfs/bafkreidy44jpxtbpp6bkarqg3fujfd5hvfbi3cn6t22uqc5cmk2bowabxu",
     
    styles: {
      gradient: {
        width: "width * 0.73",
        height: "height * 0.18",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: 20,
      },
      title: {
        color: "#200745",
        fontSize: 20,
        textAlign: "center",
        fontFamily: "Lexend-Bold",
      },
      price: {
        color: "#200745",
        fontSize: 26,
        marginTop: 4,
        textAlign: "center",
        fontFamily: "Lexend-Bold",
      },
    },
    mainNftPrice: 1000,
    referPercentage: 8
  },
  {
    name: "Black SS",
    nftTypes: [
      { name: "Fresh", blocks: 450 },
      { name: "mini", blocks: 150 },
      { name: "micro", blocks: 75 }
    ],
    phaseWiseBonuses: [
      { phaseName: "A", phaseBonus: 2000, investorBonus: { days: 30, dailyBonusToken: 5 }, totalWithdrawalLimit: 50 },
      { phaseName: "B", phaseBonus: 1500, investorBonus: { days: 30, dailyBonusToken: 5 }, totalWithdrawalLimit: 100 },
      { phaseName: "C", phaseBonus: 1000, investorBonus: { days: 30, dailyBonusToken: 5 }, totalWithdrawalLimit: 150 },
      { phaseName: "D", phaseBonus: 750, investorBonus: { days: 30, dailyBonusToken: 5 }, totalWithdrawalLimit: 300 },
      { phaseName: "E", phaseBonus: 500, investorBonus: { days: 30, dailyBonusToken: 5 }, totalWithdrawalLimit: 250 }
    ],
    nftAddress:process.env.BLACK_NFT,
    dailyMineCap: 1150,
    contractAddress: "0x123456789abcdef",
    icon: "../../assets/icons/Black_Icon.png",
    gradient: "../../assets/images/CardTopBlack.png",
    tokenUri:"https://teal-obvious-tahr-119.mypinata.cloud/ipfs/bafkreigct22g3bgtrfgbyzzaqhjxqvmzzy7x3vqtzyx5w6bpnuawymcbmi",
    styles: {
      gradient: {
        width: "width * 0.73",
        height: "height * 0.18",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: 20,
      },
      title: {
        color: "#FFFFFF",
        fontSize: 18,
        textAlign: "center",
        fontFamily: "Lexend",
      },
      price: {
        color: "#FFFFFF",
        fontSize: 24,
        marginTop: 4,
        textAlign: "center",
        fontFamily: "Lexend-Bold",
      },
    },
    mainNftPrice: 500,
    referPercentage: 7
  },
  {
    name: "White SS",
    nftTypes: [
      { name: "Fresh", blocks: 450 },
      { name: "mini", blocks: 150 },
      { name: "micro", blocks: 75 }
    ],
    phaseWiseBonuses: [
      { phaseName: "A", phaseBonus: 400, investorBonus: { days: 30, dailyBonusToken: 1 }, totalWithdrawalLimit: 10 },
      { phaseName: "B", phaseBonus: 300, investorBonus: { days: 30, dailyBonusToken: 1 }, totalWithdrawalLimit: 20 },
      { phaseName: "C", phaseBonus: 200, investorBonus: { days: 30, dailyBonusToken: 1 }, totalWithdrawalLimit: 30 },
      { phaseName: "D", phaseBonus: 150, investorBonus: { days: 30, dailyBonusToken: 1 }, totalWithdrawalLimit: 40 },
      { phaseName: "E", phaseBonus: 100, investorBonus: { days: 30, dailyBonusToken: 1 }, totalWithdrawalLimit: 50 }
    ],
    nftAddress:process.env.WHITE_NFT,
    dailyMineCap: 767,
    contractAddress: "0x123456789abcdef",
    tokenUri: "https://teal-obvious-tahr-119.mypinata.cloud/ipfs/bafkreibjyr4bcacbnkrvqxgrvjl3yutyiaife3wv4udvfbxowamzwgng7u",
    icon: "https://yourserver.com/assets/icons/White_Icon.png",
    gradient: "https://yourserver.com/assets/images/CardTop.png",
    mainNftPrice: 100,
    referPercentage: 7,
    styles: {
      gradient: {
        width: "width * 0.73",
        height: "height * 0.18",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
      },
      title: {
        color: "#200745",
        fontSize: 18,
        textAlign: "center",
        fontFamily: "Lexend",
      },
      price: {
        color: "#200745",
        fontSize: 24,
        marginTop: 4,
        textAlign: "center",
        fontFamily: "Lexend-Bold",
      },
    },
  }
];

const globalData = [
  {
    totalSupply: 840000000,
    totalValidatorSupply: 336000000,
    totalStakingSupply: 226800000,
    totalTeamSupply: 277200000,
    dailyValidatorSupply: 7669,
    dailyStakingSupply: 5173,
    totalInvestorSupply: null,
    totalFounderSupply: null,
    totalCMESupply: null,
    totalPartnershipSupply: null
  }
];

const phaseData = [
  { name: "A", totalSupply: 18000000, ssbtPrice: 0.05, isActive: true },
  { name: "B", totalSupply: 18000000, ssbtPrice: 0.06, isActive: false },
  { name: "C", totalSupply: 18000000, ssbtPrice: 0.07, isActive: false },
  { name: "D", totalSupply: 18000000, ssbtPrice: 0.08, isActive: false },
  { name: "E", totalSupply: 17468000, ssbtPrice: 0.09, isActive: false }
];

const discountData = [
  {
    code: "WELCOME50",
    amount: 50,
    type: "percentage",
    expiryDate: new Date("2025-12-31"),
    usageLimit: 100,
    usedCount: 0,
    isActive: true
  },
  {
    code: "FLAT100",
    amount: 100,
    type: "fixed",
    expiryDate: new Date("2025-06-30"),
    usageLimit: 50,
    usedCount: 0,
    isActive: true
  },
  {
    code: "SUMMER20",
    amount: 20,
    type: "percentage",
    expiryDate: new Date("2024-08-31"),
    usageLimit: 200,
    usedCount: 5,
    isActive: true
  },
  {
    code: "BLACKFRIDAY",
    amount: 30,
    type: "percentage",
    expiryDate: new Date("2024-11-29"),
    usageLimit: 500,
    usedCount: 10,
    isActive: true
  },
  {
    code: "HOLIDAY150",
    amount: 150,
    type: "fixed",
    expiryDate: new Date("2024-12-31"),
    usageLimit: 300,
    usedCount: 20,
    isActive: true
  },
  {
    code: "NEWYEAR25",
    amount: 25,
    type: "percentage",
    expiryDate: new Date("2025-01-10"),
    usageLimit: 150,
    usedCount: 30,
    isActive: true
  },
  {
    code: "LOYAL500",
    amount: 500,
    type: "fixed",
    expiryDate: new Date("2026-12-31"),
    usageLimit: 1000,
    usedCount: 100,
    isActive: true
  }
];

const faqData = [
  {
    "category": "Steps Tracking",
    "questions": [
      { "question": "What is “Proof of movement”?", "answer": "Proof of Movement (PoM) is an innovative concept that leverages blockchain technology to incentivize physical movement. One Proof of Movement equals 1 Step taken by the user." },
      { "question": "Do I get any tokens for indoor workouts like treadmill running etc?", "answer": "No. Indoor workouts are reflected in your step count, but they don’t qualify as 'Normalized Steps' required to mint the SSB token. Tokens are only rewarded for natural steps taken to go from point A to Point B." },
      { "question": "How does the app track my steps?", "answer": "Our app uses the phone’s built-in sensors, such as the accelerometer and gyroscope, to detect movements that match a walking pattern. This data is then processed by our proprietary algorithm to provide an accurate step count." },
      { "question": "Why does my step count increase when I shake the phone?", "answer": "Phone sensors detect all motion, and shaking can sometimes mimic the pattern of walking steps. However, our algorithm eliminates artificial movements and displays only the normalised step count on the app." },
      { "question": "How can I get the most accurate step count?", "answer": "For the best accuracy, keep your phone in a stable position, like in a pocket or attached to your body. Avoid frequently moving it around or shaking it, as this can interfere with accurate step detection." },
      { "question": "Can the app tell the difference between walking and other activities like cycling?", "answer": "Yes, the app uses activity recognition APIs that can detect different activities, including walking, running, and cycling. These APIs help filter out non-walking activities so the step count remains accurate." },
      { "question": "Does the app work when it’s running in the background?", "answer": "Yes, our app can continue to count steps and track your activity even when it’s running in the background, provided you’ve granted the necessary permissions for background activity." },
      { "question": "Why is there a discrepancy between my steps on this app and other fitness apps?", "answer": "Each app may use slightly different algorithms and settings for step counting. Differences in sensor sensitivity, activity filtering, and distance thresholds can lead to minor variations in step counts across apps." }
    ]
  },
  {
    "category": "StepsStamp FAQs (Principles-Based)",
    "questions": [
      { "question": "Why is StepsStamp’s ecosystem unique?", "answer": "StepsStamp uniquely combines Health (rewarding movement), Finance (decentralized ownership), and Technology (blockchain security) to create a fair, empowering platform where your daily effort translates into lasting value." },
      { "question": "How does StepsStamp promote a healthy lifestyle?", "answer": "StepsStamp rewards you with crypto (SSBT) through Proof of Movement – your daily steps become 'health points' that unlock earnings. Move more, earn more!" },
      { "question": "How does StepsStamp ensure financial fairness?", "answer": "Built on decentralized finance, StepsStamp cuts out middlemen. You own your rewards (SSBT) and control how you earn, stake, or spend them." }
    ]
  },
  {
    "category": "StepsStamp Blockchain (NFT)",
    "questions": [
      { "question": "What is a StepsStamp Blockchain (NFT)?", "answer": "A StepsStamp Blockchain (NFT) is a unique digital asset that lets you mine SSBT by walking. Each Blockchain has 450 blocks, and activating a block requires 1,500 POM/day." },
      { "question": "How does mining work with Blockchains?", "answer": "Only Blockchain owners can mine SSBT. Mining rewards are decentralized and fixed, with different daily rewards for different Blockchain tiers." }
    ]
  },
  {
    "category": "DSSB (Decentralized StepsStamp Bank)",
    "questions": [
      { "question": "What is DSSB?", "answer": "DSSB is a decentralized bank where you become a shareholder by staking SSBT tokens. Stakeholders earn daily rewards from a fixed pool of 5,173 SSBT/day for 120 years." },
      { "question": "How does staking work?", "answer": "Daily staking rewards are distributed proportionally based on your stake. You can choose manual or auto staking to maximize your rewards." }
    ]
  },
  {
    "category": "Rewards",
    "questions": [
      { "question": "How do I earn referral rewards?", "answer": "Share your referral link. When someone buys any Blockchain (NFT) using your link, you earn SSBT tokens equal to a percentage of their purchase in BUSD, based on your Blockchain tier." },
      { "question": "Are there limits to referral rewards?", "answer": "No! Refer as many friends as you want." },
      { "question": "When do I receive referral rewards?", "answer": "Immediately after your referral purchases a Blockchain." }
    ]
  },
  {
    "category": "Payment",
    "questions": [
      { "question": "What payment methods are accepted?", "answer": "Only BUSD (Binance USD) is accepted for purchasing Blockchains." },
      { "question": "How do I buy BUSD?", "answer": "Purchase BUSD on crypto exchanges like Binance, then transfer it to your wallet." }
    ]
  },
  {
    "category": "New Additions for Clarity",
    "questions": [
      { "question": "How are mining and staking different?", "answer": "Mining involves earning SSBT by walking and requires a StepsStamp Blockchain (NFT), whereas staking involves earning SSBT by locking tokens in DSSB without needing to walk." },
      { "question": "Can I combine mining and staking rewards?", "answer": "Yes! Use mined SSBT to increase your staking pool and compound earnings." }
    ]
  }
];


const seedDatabase = async () => {
  await mongoose.connect('mongodb://localhost:27017/ssb-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await Blockchain.deleteMany({});
  await GlobalSupply.deleteMany({});
  await Phase.deleteMany({});
  await Discount.deleteMany(); // Clear existing data

  await Blockchain.insertMany(blockchainData);
  await GlobalSupply.insertMany(globalData);
  await Phase.insertMany(phaseData);
  await Discount.insertMany(discountData);
  await Faq.insertMany(faqData);

  console.log('✅ Blockchain, Global Supply, and Phase data seeded successfully!');
  mongoose.connection.close();
};

seedDatabase().catch(err => console.error('Error seeding database:', err));
