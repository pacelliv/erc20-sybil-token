require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("dotenv").config()
require("./tasks")

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-goerli.alchemyapi.io/v2/api-key"
const MUMBAI_RPC_URL =
    process.env.MUMBAI_RPC_URL || "https://polygon-mumbai.g.alchemy.com/v2/api-key"

const PRIVATE_KEY_A = process.env.PRIVATE_KEY_A || "0x"
const PRIVATE_KEY_B = process.env.PRIVATE_KEY_B || "0x"

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "etherscan API key"
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "polygonscan API key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "coinmarketcap API key"

const REPORT_GAS = process.env.REPORT_GAS || false

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [{ version: "0.8.17" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: PRIVATE_KEY_A !== undefined ? [PRIVATE_KEY_A, PRIVATE_KEY_B] : [],
            chainId: 5,
        },
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        polygonMumbai: {
            url: MUMBAI_RPC_URL,
            accounts: PRIVATE_KEY_B !== undefined ? [PRIVATE_KEY_B] : [],
            chainId: 80001,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user1: {
            default: 1,
        },
        user2: {
            default: 2,
        },
    },
    etherscan: {
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: {
            polygonMumbai: POLYGONSCAN_API_KEY,
            goerli: ETHERSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: COINMARKETCAP_API_KEY,
    },
    mocha: {
        timeout: 300000, // 300 seconds max for running tests
    },
}
