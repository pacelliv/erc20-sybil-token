const { expect, assert } = require("chai")
const { getNamedAccounts, ethers, deployments, network } = require("hardhat")
const {
    developmentChains,
    INITIAL_SUPPLY,
    TOKEN_NAME,
    TOKEN_SYMBOL,
    TARGET_SUPPLY,
} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Sybil Unit Tests", () => {
          const multiplier = 1e18
          let sybilToken, deployer, user1, sybilTokenUser1
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              user1 = (await getNamedAccounts()).user1
              await deployments.fixture(["all"])
              sybilToken = await ethers.getContract("SybilToken", deployer)
          })

          describe("constructor", () => {
              it("Mints the correct amount of tokens", async () => {
                  const totalSupply = await sybilToken.totalSupply()
                  const supply = parseInt(INITIAL_SUPPLY) * multiplier
                  assert.equal(parseInt(totalSupply.toString()), Number(supply.toString()))
              })
              it("Sets the name and the symbol correctly", async () => {
                  expect(await sybilToken.name()).to.equal(TOKEN_NAME)
                  expect(await sybilToken.symbol()).to.equal(TOKEN_SYMBOL)
              })
              it("Allocates the total supply to the creator", async () => {
                  assert.equal(
                      (await sybilToken.totalSupply()).toString(),
                      (await sybilToken.balanceOf(deployer)).toString()
                  )
              })
          })

          describe("transfers", () => {
              it("Should allow to transfer tokens", async () => {
                  const value = ethers.utils.parseEther("10")
                  const transactionResponse = await sybilToken.transfer(user1, value.toString())
                  await transactionResponse.wait(1)
                  expect((await sybilToken.balanceOf(user1)).toString()).to.equal(value.toString())
              })
              it("Should emit event on transfering tokens", async () => {
                  const value = ethers.utils.parseEther("10")
                  await expect(sybilToken.transfer(user1, value.toString()))
                      .to.emit(sybilToken, "Transfer")
                      .withArgs(deployer, user1, value)
              })
          })

          describe("allowances", () => {
              const value = (20 * multiplier).toString()
              beforeEach(async () => {
                  sybilTokenUser1 = await ethers.getContract("SybilToken", user1)
              })
              it("Should approve other addresses to spend tokens", async () => {
                  const tokensToSpend = ethers.utils.parseEther("10")
                  await sybilToken.approve(user1, tokensToSpend)
                  const tokenUser1 = await ethers.getContract("SybilToken", user1)
                  await tokenUser1.transferFrom(deployer, user1, tokensToSpend)
                  expect((await tokenUser1.balanceOf(user1)).toString()).to.equal(
                      tokensToSpend.toString()
                  )
              })
              it("Should emit event on approval", async () => {
                  const tokensToSpend = ethers.utils.parseEther("10")
                  await expect(sybilToken.approve(user1, tokensToSpend))
                      .to.emit(sybilToken, "Approval")
                      .withArgs(deployer, user1, tokensToSpend)
              })
              it("Set the allowance correctly", async () => {
                  await sybilToken.approve(user1, value)
                  const allowance = await sybilToken._allowance(deployer, user1)
                  assert.equal(allowance.toString(), value)
              })
              it("Won't allow spender to go over the allowance", async () => {
                  await sybilToken.approve(user1, value)
                  await expect(
                      sybilTokenUser1.transferFrom(deployer, user1, (40 * multiplier).toString())
                  ).to.be.revertedWith("SYL: Value exceeds the remaining allowance")
              })
          })

          describe("increaseAllowance", () => {
              const allowance = ethers.utils.parseEther("10")
              beforeEach(async () => {
                  const transactionResponse = await sybilToken.approve(user1, allowance)
                  await transactionResponse.wait(1)
              })
              it("Increases the allowance granted by the caller to the spender", async () => {
                  const transactionResponse = await sybilToken.increaseAllowance(user1, allowance)
                  await transactionResponse.wait(1)
                  const user1Allowance = await sybilToken._allowance(deployer, user1)
                  assert.equal(user1Allowance.toString(), ethers.utils.parseEther("20").toString())
              })

              it("Emits event on increasing the allowance", async () => {
                  await expect(sybilToken.increaseAllowance(user1, allowance))
                      .to.emit(sybilToken, "Approval")
                      .withArgs(deployer, user1, ethers.utils.parseEther("20").toString())
              })
          })

          describe("decreaseAllowance", () => {
              const allowance = ethers.utils.parseEther("20")
              const substractedValue = ethers.utils.parseEther("5")
              beforeEach(async () => {
                  const transactionResponse = await sybilToken.approve(user1, allowance)
                  await transactionResponse.wait(1)
              })
              it("Decreases the allowance granted by the caller to the spender", async () => {
                  const transactionResponse = await sybilToken.decreaseAllowance(
                      user1,
                      substractedValue
                  )
                  await transactionResponse.wait(1)
                  const user1Allowance = await sybilToken._allowance(deployer, user1)
                  assert.equal(user1Allowance.toString(), ethers.utils.parseEther("15").toString())
              })
              it("Emits event on decreasing the allowance", async () => {
                  await expect(sybilToken.decreaseAllowance(user1, substractedValue))
                      .to.emit(sybilToken, "Approval")
                      .withArgs(deployer, user1, ethers.utils.parseEther("15").toString())
              })
              it("Should revert if the substracted value exceeds the allowance", async () => {
                  await expect(
                      sybilToken.decreaseAllowance(user1, ethers.utils.parseEther("50"))
                  ).to.be.revertedWith("SYL: Value exceeds the remaining allowance")
              })
          })

          describe("burn", () => {
              it("Allows to burn", async () => {
                  const amount = ethers.utils.parseEther("20")
                  const initialTotalSupply = await sybilToken.totalSupply()
                  await sybilToken.burn(amount)
                  const endingTotalSupply = await sybilToken.totalSupply()
                  expect(endingTotalSupply.toString()).to.equal(
                      initialTotalSupply.sub(amount).toString()
                  )
              })
              it("Emits event on burn", async () => {
                  const amount = ethers.utils.parseEther("20")
                  await expect(sybilToken.burn(amount))
                      .to.emit(sybilToken, "Burn")
                      .withArgs(deployer, amount)
              })
              it("Should revert is the target supply has been reached", async () => {
                  await sybilToken.burn(ethers.utils.parseEther("500000000"))
                  await expect(sybilToken.burn(ethers.utils.parseEther("500"))).to.be.revertedWith(
                      "SYL: Cannot burn more tokens"
                  )
              })
          })

          describe("BurnFrom", () => {
              let sybilTokenUser1, tokensToSpend
              beforeEach(async () => {
                  tokensToSpend = ethers.utils.parseEther("100")
                  await sybilToken.approve(user1, tokensToSpend)
                  sybilTokenUser1 = await ethers.getContract("SybilToken", user1)
              })
              it("Allows to burn from another account", async () => {
                  const initialTotalSupply = await sybilToken.totalSupply()
                  await sybilTokenUser1.burnFrom(deployer, tokensToSpend)
                  const endingTotalSupply = await sybilToken.totalSupply()
                  assert.equal(
                      endingTotalSupply.toString(),
                      initialTotalSupply.sub(tokensToSpend).toString()
                  )
              })
              it("Won't allow to burn more than the allowance", async () => {
                  await expect(
                      sybilTokenUser1.burnFrom(deployer, ethers.utils.parseEther("200"))
                  ).to.be.revertedWith("SYL: Value exceeds the remaining allowance")
              })
              it("Should revert if the target supply has been reached", async () => {
                  await sybilToken.burn(ethers.utils.parseEther("500000000"))
                  await expect(
                      sybilTokenUser1.burnFrom(deployer, tokensToSpend)
                  ).to.be.revertedWith("SYL: Cannot burn more tokens")
              })
          })

          describe("decimals", () => {
              it("Fetch the amount of decimals of the token", async () => {
                  const decimals = await sybilToken.decimals()
                  assert.equal(decimals, 18)
              })
          })

          describe("getBurntAmount", () => {
              it("Should returns the correct circulation of tokens", async () => {
                  const tokensToBurn = ethers.utils.parseEther("10000")
                  await sybilToken.burn(tokensToBurn)
                  const currentCirculation = await sybilToken.getBurntAmount()
                  const initialSupply = await sybilToken.getInitialSupply()
                  const totalSupply = await sybilToken.totalSupply()
                  assert.equal(
                      currentCirculation.toString(),
                      initialSupply.sub(totalSupply).toString()
                  )
              })
          })

          describe("getTargetSupply", () => {
              it("Should return the target supply of tokens", async () => {
                  const targetSupply = await sybilToken.getTargetSupply()
                  assert.equal(targetSupply.toString(), ethers.utils.parseEther(TARGET_SUPPLY))
              })
          })
      })
