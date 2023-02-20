const { task } = require("hardhat/config")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

task("set-lock-time", "Set the lock time between withdrawals")
    .addParam("time", "The amount of time to wait in seconds")
    .setAction(async (taskArgs, { ethers }) => {
        const time = taskArgs.time
        const sybilFaucet = await ethers.getContract("SybilFaucet")
        const blockConfirmations = developmentChains.includes(network.name)
            ? 1
            : VERIFICATION_BLOCK_CONFIRMATIONS

        console.log(`Setting ${time} seconds as the new lock time`)

        const transactionResponse = await sybilFaucet.setLockTime(time)

        console.log("Waiting for block confirmations, please wait...")

        await transactionResponse.wait(blockConfirmations)

        console.log("Lock time set")
    })
