const { task } = require("hardhat/config")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

task("approve-burner", "Sets the allowance of tokens SybilBurner will periodically burn")
    .addParam("allowance", "The amount of tokens allow to burn")
    .setAction(async (taskArgs, { ethers }) => {
        const value = ethers.utils.parseEther(taskArgs.allowance)
        const sybilToken = await ethers.getContract("SybilToken")
        const sybilBurner = await ethers.getContract("SybilBurner")

        const blockConfirmations = developmentChains.includes(network.name)
            ? 1
            : VERIFICATION_BLOCK_CONFIRMATIONS

        console.log(
            `Approving ${ethers.utils.formatEther(value)} tokens as allowance for ${
                sybilBurner.address
            }`
        )

        const transactionRespone = await sybilToken.approve(sybilBurner.address, value)

        console.log("Waiting for block confirmations, please wait...")

        await transactionRespone.wait(blockConfirmations)

        console.log("Allowance for SybilBurner set")
    })
