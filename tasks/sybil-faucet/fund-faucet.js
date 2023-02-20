const { task } = require("hardhat/config")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

task("fund-faucet", "Transfer tokens the faucet")
    .addParam("amount", "The amount of token to fund the faucet")
    .setAction(async (taskArgs, { ethers }) => {
        const amount = taskArgs.amount
        const sybilToken = await ethers.getContract("SybilToken")
        const sybilFaucet = await ethers.getContract("SybilFaucet")
        const blockConfirmations = developmentChains.includes(network.name)
            ? 1
            : VERIFICATION_BLOCK_CONFIRMATIONS

        console.log(`Funding the faucet with ${amount} tokens`)

        const transactionResponse = await sybilToken.transfer(
            sybilFaucet.address,
            ethers.utils.parseEther(amount)
        )

        console.log("Waiting for block confirmations, please wait...")

        await transactionResponse.wait(blockConfirmations)

        console.log("Faucet funded")
    })
