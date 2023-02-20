const { task } = require("hardhat/config")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

task("set-token-allocation", "Transfer tokens the faucet")
    .addParam("amount", "The amount of tokens the faucet will allot")
    .setAction(async (taskArgs, { ethers }) => {
        const amount = taskArgs.amount
        const sybilFaucet = await ethers.getContract("SybilFaucet")
        const blockConfirmations = developmentChains.includes(network.name)
            ? 1
            : VERIFICATION_BLOCK_CONFIRMATIONS

        console.log(`Setting ${amount} tokens as the new allocation amount`)

        const transactionResponse = await sybilFaucet.setTokenAmount(
            ethers.utils.parseEther(amount)
        )

        console.log("Waiting for block confirmations, please wait...")

        await transactionResponse.wait(blockConfirmations)

        console.log("Allocation amount set")
    })
