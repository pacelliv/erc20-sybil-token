const networkConfig = {
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    31337: {
        name: "localhost",
    },
    80001: {
        name: "polygonMumbai",
        ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6

// SybilToken constructor arguments:
TOKEN_NAME = "Sybil"
TOKEN_SYMBOL = "SYL"
INITIAL_SUPPLY = "1000000000"
TARGET_SUPPLY = "500000000"

// SybilFaucet constructor arguments:
const INITIAL_TOKEN_AMOUNT = "10000000000000000000" // 10 SYL
const INITIAL_LOCK_TIME = "600"

// SybilBurner constructor arguments:
const BURN_AMOUNT = "137000"
const BURNING_INTERVAL = "86400"

// Frontend files paths:
const FRONTEND_TOKEN_ABI = "../sybil-explorer/constants/sybilTokenAbi.json"
const FRONTEND_TOKEN_ADDRESSES = "../sybil-explorer/constants/sybilTokenContractAddresses.json"
const FRONTEND_FAUCET_ABI = "../sybil-explorer/constants/sybilFaucetAbi.json"
const FRONTEND_FAUCET_ADDRESSES = "../sybil-explorer/constants/sybilFaucetContractAddresses.json"
const FRONTEND_BURNER_ABI = "../sybil-explorer/constants/sybilBurnerAbi.json"
const FRONTEND_BURNER_ADDRESSES = "../sybil-explorer/constants/sybilBurnerContractAddresses.json"

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    TOKEN_NAME,
    TOKEN_SYMBOL,
    INITIAL_SUPPLY,
    BURN_AMOUNT,
    BURNING_INTERVAL,
    TARGET_SUPPLY,
    INITIAL_TOKEN_AMOUNT,
    INITIAL_LOCK_TIME,
    FRONTEND_FAUCET_ABI,
    FRONTEND_FAUCET_ADDRESSES,
    FRONTEND_TOKEN_ABI,
    FRONTEND_TOKEN_ADDRESSES,
    FRONTEND_BURNER_ABI,
    FRONTEND_BURNER_ADDRESSES,
}
