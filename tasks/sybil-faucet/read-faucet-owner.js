const { task } = require("hardhat/config")

task("read-faucet-owner", "Reads the owner of the faucet").setAction(async (_, { ethers }) => {
    const sybilFaucet = await ethers.getContract("SybilFaucet")

    const owner = await sybilFaucet.s_owner()

    console.log(`The current owner of the faucet is is ${owner}`)
})
