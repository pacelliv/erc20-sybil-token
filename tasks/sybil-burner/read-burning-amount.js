const { task } = require("hardhat/config")

task("read-burning-amount", "Reads the amount tokens that are being burned").setAction(
    async (_, { ethers }) => {
        const sybilBurner = await ethers.getContract("SybilBurner")

        const burningAmount = await sybilBurner._dailyBurnAmount()

        console.log(`The burning ${ethers.utils.formatEther(burningAmount.toString())} SYL tokens`)
    }
)
