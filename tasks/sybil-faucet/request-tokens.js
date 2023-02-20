const { task } = require("hardhat/config")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

task("request-tokens", "Request tokens from the faucet")
    .addParam("petitioner", "The address of the account requesting for funds")
    .setAction(async (taskArgs, { ethers }) => {
        const petitioner = await ethers.getSigner(taskArgs.petitioner)
        const sybilFaucet = await ethers.getContract("SybilFaucet")
        const petitionerConnected = sybilFaucet.connect(petitioner)
        const blockConfirmations = developmentChains.includes(network.name)
            ? 1
            : VERIFICATION_BLOCK_CONFIRMATIONS

        const isPaused = await petitionerConnected.s_paused()
        const hasPassedTime = await petitionerConnected.isAllowedToWithdraw(petitioner.address)
        const allocationAmount = await petitionerConnected.s_tokenAmount()

        if (!isPaused) {
            if (hasPassedTime) {
                console.log(
                    `Requesting ${ethers.utils.formatEther(
                        allocationAmount
                    )} tokens from the faucet`
                )

                const transactionResponse = await petitionerConnected.requestTokens()

                console.log("Waiting for block confirmations, please wait...")

                await transactionResponse.wait(blockConfirmations)

                console.log("Transfer completed")
            } else {
                console.log("Not enough time has elapsed since last request")
            }
        } else {
            console.log("The withdrawals are paused")
        }
    })
