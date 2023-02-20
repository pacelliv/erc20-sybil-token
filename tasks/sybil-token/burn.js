const { task } = require("hardhat/config")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

task("burn", "Calls the burn method to remove tokens from circulation")
    .addParam("value", "The amount of tokens to burn")
    .setAction(async (taskArgs, { ethers }) => {
        const value = ethers.utils.parseEther(taskArgs.value)
        const sybilToken = await ethers.getContract("SybilToken")

        const blockConfirmations = developmentChains.includes(network.name)
            ? 1
            : VERIFICATION_BLOCK_CONFIRMATIONS

        console.log(`Burning ${ethers.utils.formatEther(value)} tokens`)

        const transactionRespone = await sybilToken.burn(value)

        console.log("Waiting for block confirmations, please wait...")

        await transactionRespone.wait(blockConfirmations)

        console.log("Burn completed")
    })
