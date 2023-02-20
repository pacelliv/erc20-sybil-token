const { task } = require("hardhat/config")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

task("transfer-ownership", "Transfer the ownership of the faucet")
    .addParam("owner", "The address of the new owner")
    .setAction(async (taskArgs, { ethers }) => {
        const owner = taskArgs.owner
        const sybilFaucet = await ethers.getContract("SybilFaucet")
        const blockConfirmations = developmentChains.includes(network.name)
            ? 1
            : VERIFICATION_BLOCK_CONFIRMATIONS

        console.log(`Setting ${owner} as the new owner of the faucet`)

        const transactionResponse = await sybilFaucet.transferOwnership(owner)

        console.log("Waiting for block confirmations, please wait...")

        await transactionResponse.wait(blockConfirmations)

        console.log("New owner set")
    })
