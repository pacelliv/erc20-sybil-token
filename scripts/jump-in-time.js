const { ethers, network } = require("hardhat")

const jumpInTime = async () => {
    const sybilFaucet = await ethers.getContract("SybilFaucet")
    const lockTime = await sybilFaucet.s_lockTime()
    await network.provider.send("evm_increaseTime", [lockTime.toNumber() + 1])
    await network.provider.send("evm_mine", [])
}

jumpInTime()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
