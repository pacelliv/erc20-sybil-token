const {
    developmentChains,
    BURN_AMOUNT,
    BURNING_INTERVAL,
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

    const sybilBurner = await deploy("SybilBurner", {
        from: deployer,
        args: [BURN_AMOUNT, BURNING_INTERVAL, sybilToken.address],
        log: true,
        waitConfirmations: blockConfirmations,
    })

    log("--------------------------------------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(sybilBurner.address, [BURN_AMOUNT, BURNING_INTERVAL, sybilToken.address])
        log("--------------------------------------------------------------------")
    }
}

module.exports.tags = ["all", "burner"]
