const { task } = require("hardhat/config")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

task("pause-faucet", "Pause the withdrawals of tokens").setAction(async (_, { ethers }) => {
    const sybilFaucet = await ethers.getContract("SybilFaucet")
    const blockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const isPaused = await sybilFaucet.s_paused()

    if (!isPaused) {
        console.log(`Pausing the withdrawals`)

        const transactionResponse = await sybilFaucet.pause()

        console.log("Waiting for block confirmations, please wait...")

        await transactionResponse.wait(blockConfirmations)

        console.log("Withdrawals paused")
    } else {
        console.log("The withdrawals are already paused")
    }
})
