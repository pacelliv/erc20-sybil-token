const { task } = require("hardhat/config")

task(
    "read-lock-time",
    "Reads the time users must wait between withdrawals in seconds"
).setAction(async (_, { ethers }) => {
    const sybilFaucet = await ethers.getContract("SybilFaucet")

    const lockTime = await sybilFaucet.s_lockTime()

    console.log(`The lock time is ${lockTime.toString()} seconds`)
})
