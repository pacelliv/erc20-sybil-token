const { task } = require("hardhat/config")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

task("withdraw", "Withdraws the entire balance from the faucet").setAction(
    async (_, { ethers }) => {
        const sybilFaucet = await ethers.getContract("SybilFaucet")
        const balance = await sybilFaucet.getBalance()

        const blockConfirmations = developmentChains.includes(network.name)
            ? 1
            : VERIFICATION_BLOCK_CONFIRMATIONS

        console.log(`Withdrawing the entire balance from the faucet`)

        const transactionRespone = await sybilFaucet.withdraw()

        console.log("Waiting for block confirmations, please wait...")

        await transactionRespone.wait(blockConfirmations)

        console.log(`${ethers.utils.formatEther(balance.toString())} tokens withdrawn`)
    }
)
