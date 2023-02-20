const { task } = require("hardhat/config")

task("read-token-supply", "Reads the current supply of tokens").setAction(async (_, { ethers }) => {
    const sybilToken = await ethers.getContract("SybilToken")

    const totalSupply = await sybilToken.totalSupply()

    console.log(
        `The current supply of tokens is ${ethers.utils.formatEther(
            totalSupply.toString()
        )} SYL tokens`
    )
})
