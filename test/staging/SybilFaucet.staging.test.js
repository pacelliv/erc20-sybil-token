const { assert } = require("chai")
const { getNamedAccounts, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("SybilFaucet Staging Test", () => {
          let sybilToken, sybilFaucet, deployer, petitioner, petitionerConnected
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              petitioner = (await getNamedAccounts()).user1
              sybilToken = await ethers.getContract("SybilToken", deployer)
              sybilFaucet = await ethers.getContract("SybilFaucet", deployer)
              petitionerConnected = sybilFaucet.connect(await ethers.getSigner(petitioner))
          })

          describe("requestTokens", () => {
              it("Send tokens to the petitioner", async () => {
                  const initialPetitionerBalance = await sybilToken.balanceOf(petitioner)
                  const transactionResponse = await petitionerConnected.requestTokens()
                  await transactionResponse.wait(1)
                  const endingPetitionerBalance = await sybilToken.balanceOf(petitioner)
                  const allocationAmount = await sybilFaucet.s_tokenAmount()

                  assert.equal(
                      initialPetitionerBalance.add(allocationAmount).toString(),
                      endingPetitionerBalance.toString()
                  )
              })
          })
      })
