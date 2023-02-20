const { ethers, network } = require("hardhat")
const fs = require("fs")
const {
    FRONTEND_TOKEN_ABI,
    FRONTEND_TOKEN_ADDRESSES,
    FRONTEND_FAUCET_ABI,
    FRONTEND_FAUCET_ADDRESSES,
    FRONTEND_BURNER_ABI,
    FRONTEND_BURNER_ADDRESSES,
} = require("../helper-hardhat-config")

module.exports = async () => {
    const UPDATE_FRONTEND = true
    let sybilFaucet, sybilToken, sybilBurner, chainId

    if (UPDATE_FRONTEND) {
        console.log("Updating frontend folders...")

        sybilToken = await ethers.getContract("SybilToken")
        sybilFaucet = await ethers.getContract("SybilFaucet")
        sybilBurner = await ethers.getContract("SybilBurner")
        chainId = network.config.chainId

        updateAbiFiles()
        updateTokenAddressesFile()
        updateFaucetAddressesFile()
        updateBurnerAddressesFile()

        console.log("Frontend folders updated!")
    }

    async function updateAbiFiles() {
        fs.writeFileSync(
            FRONTEND_TOKEN_ABI,
            sybilToken.interface.format(ethers.utils.FormatTypes.json)
        )
        fs.writeFileSync(
            FRONTEND_FAUCET_ABI,
            sybilFaucet.interface.format(ethers.utils.FormatTypes.json)
        )
        fs.writeFileSync(
            FRONTEND_BURNER_ABI,
            sybilBurner.interface.format(ethers.utils.FormatTypes.json)
        )
    }

    function updateTokenAddressesFile() {
        const currentTokenAddresses = JSON.parse(fs.readFileSync(FRONTEND_TOKEN_ADDRESSES, "utf8"))

        if (chainId in currentTokenAddresses) {
            if (!currentTokenAddresses[chainId].includes(sybilToken.address)) {
                currentTokenAddresses[chainId].push(sybilToken.address)
            }
        } else {
            currentTokenAddresses[chainId] = [sybilToken.address]
        }

        fs.writeFileSync(FRONTEND_TOKEN_ADDRESSES, JSON.stringify(currentTokenAddresses))
    }

    function updateFaucetAddressesFile() {
        const currentFaucetAddresses = JSON.parse(
            fs.readFileSync(FRONTEND_FAUCET_ADDRESSES, "utf8")
        )

        if (chainId in currentFaucetAddresses) {
            if (!currentFaucetAddresses[chainId].includes(sybilFaucet.address)) {
                currentFaucetAddresses[chainId].push(sybilFaucet.address)
            }
        } else {
            currentFaucetAddresses[chainId] = [sybilFaucet.address]
        }

        fs.writeFileSync(FRONTEND_FAUCET_ADDRESSES, JSON.stringify(currentFaucetAddresses))
    }

    function updateBurnerAddressesFile() {
        const currentBurnerAddresses = JSON.parse(
            fs.readFileSync(FRONTEND_BURNER_ADDRESSES, "utf8")
        )

        if (chainId in currentBurnerAddresses) {
            if (!currentBurnerAddresses[chainId].includes(sybilBurner.address)) {
                currentBurnerAddresses[chainId].push(sybilBurner.address)
            }
        } else {
            currentBurnerAddresses[chainId] = [sybilBurner.address]
        }

        fs.writeFileSync(FRONTEND_BURNER_ADDRESSES, JSON.stringify(currentBurnerAddresses))
    }
}

module.exports.tags = ["all", "frontend"]
