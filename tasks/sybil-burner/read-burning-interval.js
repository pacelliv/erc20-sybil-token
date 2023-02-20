const { task } = require("hardhat/config")

task(
    "read-burning-interval",
    "Reads the interval in seconds in which tokens are being burned by the burner contract"
).setAction(async (_, { ethers }) => {
    const sybilBurner = await ethers.getContract("SybilBurner")

    const burningAmount = await sybilBurner._burningInterval()

    console.log(`Tokens are burned by the burner contract every ${burningAmount} seconds`)
})
