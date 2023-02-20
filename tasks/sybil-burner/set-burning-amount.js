const { task } = require("hardhat/config")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

task("set-burning-amount", "Sets a new amount of tokens to periodically burn")
    .addParam("amount", "The amount of tokens allow to burn")
    .setAction(async (taskArgs, { ethers }) => {
        const value = taskArgs.amount
        const sybilBurner = await ethers.getContract("SybilBurner")

        const blockConfirmations = developmentChains.includes(network.name)
            ? 1
            : VERIFICATION_BLOCK_CONFIRMATIONS

        console.log(`Setting ${value} tokens as the burning amount`)

        const transactionRespone = await sybilBurner.setBurningAmount(value)

        console.log("Waiting for block confirmations, please wait...")

        await transactionRespone.wait(blockConfirmations)

        console.log("Burning amount set")
    })
