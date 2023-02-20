const { task } = require("hardhat/config")

task(
    "read-total-burnt",
    "Reads the amount tokens that have been removed from circulation"
).setAction(async (_, { ethers }) => {
    const sybilToken = await ethers.getContract("SybilToken")

    const burntAmount = await sybilToken.getBurntAmount()

    console.log(
        `The amount removed from circulation is ${ethers.utils.formatEther(
            burntAmount.toString()
        )} SYL tokens`
    )
})
