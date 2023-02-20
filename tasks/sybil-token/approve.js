const { task } = require("hardhat/config")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

task("approve", "Calls the approve method to set a spender and an allowance")
    .addParam("spender", "The address of the account to spend tokens on behalf of the owner")
    .addParam("allowance", "The amount of tokens allow to spend ")
    .setAction(async (taskArgs, { ethers }) => {
        const account = taskArgs.spender
        const value = ethers.utils.parseEther(taskArgs.allowance)
        const sybilToken = await ethers.getContract("SybilToken")

        const blockConfirmations = developmentChains.includes(network.name)
            ? 1
            : VERIFICATION_BLOCK_CONFIRMATIONS

        console.log(
            `Approving ${ethers.utils.formatEther(value)} tokens as allowance for ${account}`
        )

        const transactionRespone = await sybilToken.approve(account, value)

        console.log("Waiting for block confirmations, please wait...")

        await transactionRespone.wait(blockConfirmations)

        console.log("Spender and allowance set")
    })
