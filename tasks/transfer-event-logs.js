const { task } = require("hardhat/config")
require("dotenv").config()

task("transfer-logs", "Collects all the logs for the Transfer event of an ERC20").setAction(
    async (_, { ethers }) => {
        const sybilToken = await ethers.getContract("SybilToken")
        const currentBlock = await ethers.provider.getBlockNumber()
        const provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_RPC_URL)
        const filter = {
            address: sybilToken.address,
            topics: [ethers.utils.id("Transfer(address,address,uint256)")],
            fromBlock: currentBlock - 1000000,
            toBlock: currentBlock,
        }

        const logs = await provider.getLogs(filter)

        const parsedLogs = logs.map((log) => sybilToken.interface.parseLog(log))

        console.log(parsedLogs[0])
    }
)
