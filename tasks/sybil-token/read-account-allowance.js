const { task } = require("hardhat/config")

task("read-account-allowance", "Reads the remaining allowance of Sybil tokens of a spender")
    .addParam("account", "The address of the account you want to query")
    .addParam("owner", "The address of the owner of the tokens")
    .setAction(async (taskArgs, { ethers }) => {
        const account = taskArgs.account
        const owner = taskArgs.owner

        const sybilToken = await ethers.getContract("SybilToken")

        const allowance = await sybilToken._allowance(owner, account)

        console.log(
            `The remaining allowance for ${account} is ${ethers.utils.formatEther(
                allowance.toString()
            )} SYL tokens`
        )
    })
