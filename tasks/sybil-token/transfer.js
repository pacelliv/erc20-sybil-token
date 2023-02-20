const { task } = require("hardhat/config")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

task("transfer", "Calls the transfer method to send tokens to an account")
    .addParam("to", "The address of the account to send Sybil tokens")
    .addParam("value", "The amount of tokens to transfer")
    .setAction(async (taskArgs, { ethers }) => {
        const account = taskArgs.to
        const value = ethers.utils.parseEther(taskArgs.value)
        const sybilToken = await ethers.getContract("SybilToken")

        const blockConfirmations = developmentChains.includes(network.name)
            ? 1
            : VERIFICATION_BLOCK_CONFIRMATIONS

        console.log(`Transfering ${ethers.utils.formatEther(value)} Sybil tokens to ${account}`)

        const transactionRespone = await sybilToken.transfer(account, value)

        console.log("Waiting for block confirmations, please wait...")

        await transactionRespone.wait(blockConfirmations)

        console.log("Tokens transfered")
    })
