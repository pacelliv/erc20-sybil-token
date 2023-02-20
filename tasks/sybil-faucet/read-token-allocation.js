const { task } = require("hardhat/config")

task("read-token-allocation", "Reads the amount of tokens the faucet allots").setAction(
    async (_, { ethers }) => {
        const sybilFaucet = await ethers.getContract("SybilFaucet")

        const allotAmount = await sybilFaucet.s_tokenAmount()

        console.log(
            `The allot amount is ${ethers.utils.formatEther(allotAmount.toString())} SYL tokens`
        )
    }
)
