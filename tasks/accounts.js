const { task } = require("hardhat/config")

task("accounts", "Prints the list of accounts").setAction(async (_, hre) => {
    const accounts = await hre.ethers.getSigners()

    accounts.forEach((account, i) => console.log(`Account ${i}: ${account.address}`))
})
