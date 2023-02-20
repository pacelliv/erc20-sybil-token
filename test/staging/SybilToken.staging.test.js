const { assert } = require("chai")
const {
    developmentChains,
    TOKEN_NAME,
    TOKEN_SYMBOL,
    INITIAL_SUPPLY,
} = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("SybilToken Staging Test", () => {
          const multiplier = 1e18
          let sybilToken, deployer, value
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              sybilToken = await ethers.getContract("SybilToken", deployer)
              value = ethers.utils.parseEther("20")
          })

          describe("constructor", () => {
              it("Gets the correct name, symbol and totalSupply", async () => {
                  const name = await sybilToken.name()
                  const symbol = await sybilToken.symbol()
                  const totalSupply = await sybilToken.totalSupply()
                  const supply = parseInt(INITIAL_SUPPLY) * multiplier
                  assert.equal(TOKEN_NAME, name)
                  assert.equal(TOKEN_SYMBOL, symbol)
                  assert.equal(parseInt(totalSupply.toString()), Number(supply.toString()))
              })
          })

          describe("transfer and get the balance", () => {
              it("Transfer tokens to a new account and updates the balances", async () => {
                  const initialDeployerBalance = await sybilToken.balanceOf(deployer)
                  const initialRecipientBalance = await sybilToken.balanceOf(
                      "0xa4D65B468642BA258238a2d5175e8d9807eebc84"
                  )
                  const transactionResponse = await sybilToken.transfer(
                      "0xa4D65B468642BA258238a2d5175e8d9807eebc84",
                      value
                  )
                  await transactionResponse.wait(1)
                  const endingDeployerBalance = await sybilToken.balanceOf(deployer)
                  const endingRecipientBalance = await sybilToken.balanceOf(
                      "0xa4D65B468642BA258238a2d5175e8d9807eebc84"
                  )

                  assert.equal(
                      endingRecipientBalance.toString(),
                      initialRecipientBalance.add(value).toString()
                  )
                  assert.equal(
                      endingDeployerBalance.toString(),
                      initialDeployerBalance.sub(value).toString()
                  )
              })
          })
      })
