const { task } = require("hardhat/config")

task("read-faucet-balance", "Reads the balance of tokens in the faucet").setAction(
    async (_, { ethers }) => {
        const sybilFaucet = await ethers.getContract("SybilFaucet")

        const balance = await sybilFaucet.getBalance()

        console.log(
            `The balance of the faucet is ${ethers.utils.formatEther(
                balance.toString()
            )} SYL tokens`
        )
    }
)
