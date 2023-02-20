const { task } = require("hardhat/config")

task("read-account-balance", "Reads the balance of Sybil tokens in an account")
    .addParam("account", "The address of the account you want to query")
    .setAction(async (taskArgs, { ethers }) => {
        const account = taskArgs.account

        const sybilToken = await ethers.getContract("SybilToken")

        const balance = await sybilToken.balanceOf(account)

        console.log(
            `The balance of ${account} is ${ethers.utils.formatEther(
                balance.toString()
            )} SYL tokens`
        )
    })
