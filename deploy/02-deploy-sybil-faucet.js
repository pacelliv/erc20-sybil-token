const {
    developmentChains,
    INITIAL_LOCK_TIME,
    INITIAL_TOKEN_AMOUNT,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    const sybilToken = await ethers.getContract("SybilToken", deployer)
    const blockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const sybilFaucet = await deploy("SybilFaucet", {
        from: deployer,
        args: [sybilToken.address, INITIAL_TOKEN_AMOUNT, INITIAL_LOCK_TIME],
        log: true,
        waitConfirmations: blockConfirmations,
    })

    log("--------------------------------------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(sybilFaucet.address, [
            sybilToken.address,
            INITIAL_TOKEN_AMOUNT,
            INITIAL_LOCK_TIME,
        ])
        log("--------------------------------------------------------------------")
    }
}

module.exports.tags = ["all", "faucet"]
