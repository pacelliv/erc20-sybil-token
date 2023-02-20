const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, BURN_AMOUNT, BURNING_INTERVAL } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("SybilBurner Unit Tests", () => {
          const multiplier = 1e18
          let sybilBurner, deployer, interval, burnAmount
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              sybilToken = await ethers.getContract("SybilToken", deployer)
              sybilBurner = await ethers.getContract("SybilBurner", deployer)
              interval = await sybilBurner._burningInterval()
              burnAmount = await sybilBurner._dailyBurnAmount()
              tokenAddress = await sybilBurner._sybilToken()
              tokenOwner = await sybilBurner._tokenOwner()
          })
          describe("constructor", () => {
              it("Sets the interval correctly", async () => {
                  assert.equal(interval.toString(), BURNING_INTERVAL)
              })
              it("Initializes the amount of tokens to burn correctly", async () => {
                  const amount = parseInt(BURN_AMOUNT) * multiplier
                  assert.equal(parseInt(burnAmount.toString()), Number(amount.toString()))
              })
              it("Sets the SybilToken address correctly", async () => {
                  assert.equal(tokenAddress, sybilToken.address)
              })
              it("Sets the owner correctly", async () => {
                  assert.equal(tokenOwner, deployer)
              })
          })

          describe("setBurningAmount", () => {
              it("Sets a new burning rate", async () => {
                  const transactionResponse = await sybilBurner.setBurningAmount("300000")
                  await transactionResponse.wait(1)
                  const burningAmount = await sybilBurner._dailyBurnAmount()
                  assert.equal(burningAmount.toString(), ethers.utils.parseEther("300000"))
              })
              it("Should revert if an attacker tries to set a new burning rate", async () => {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnected = sybilBurner.connect(attacker)
                  await expect(
                      attackerConnected.setBurningAmount("300000")
                  ).to.be.revertedWithCustomError(sybilBurner, "SybilBurner__NotOwner")
              })
          })

          describe("setBurningInterval", () => {
              it("Sets a new burning interval", async () => {
                  const transactionResponse = await sybilBurner.setBurningInterval("600")
                  await transactionResponse.wait(1)
                  const newBurningInterval = await sybilBurner._burningInterval()
                  assert.equal(newBurningInterval.toString(), "600")
              })
              it("Should revert if an attacker tries to set a new burning interval", async () => {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnected = sybilBurner.connect(attacker)
                  await expect(
                      attackerConnected.setBurningInterval("600")
                  ).to.be.revertedWithCustomError(sybilBurner, "SybilBurner__NotOwner")
              })
          })

          describe("checkUpkeep", () => {
              it("Should return false if both hasTimeElapsed and isTargetSupply are false", async () => {
                  const transactionResponse = await sybilToken.burn(
                      ethers.utils.parseEther("500000000")
                  )
                  await transactionResponse.wait(1)
                  const { upkeepNeeded } = await sybilBurner.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded)
              })
              it("Should return false if hasTimeElapsed is false and isTargetSupply is true", async () => {
                  const { upkeepNeeded } = await sybilBurner.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded)
              })
              it("Should return false if hasTimeElapsed is true and isTargetSupply is false", async () => {
                  const transactionResponse = await sybilToken.burn(
                      ethers.utils.parseEther("500000000")
                  )
                  await transactionResponse.wait(1)
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = await sybilBurner.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded)
              })
              it("Should return true if hasTimeElapsed is true and isTargetSupply is true", async () => {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = await sybilBurner.callStatic.checkUpkeep([])
                  assert(upkeepNeeded)
              })
          })

          describe("performUpkeep", () => {
              beforeEach(async () => {
                  const amount = ethers.utils.parseEther("500000")
                  const transactionResponse = await sybilToken.approve(sybilBurner.address, amount)
                  await transactionResponse.wait(1)
              })
              it("Can only run if upkeepNeeded is true", async () => {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const tx = await sybilBurner.performUpkeep([])
                  assert(tx)
              })
              it("Runs and updates the total supply", async () => {
                  const initialSupply = await sybilToken.totalSupply()
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const tx = await sybilBurner.performUpkeep([])
                  await tx.wait(1)
                  const endingSupply = await sybilToken.totalSupply()
                  const burntAmount = await sybilToken.getBurntAmount()
                  assert.equal(initialSupply.sub(burntAmount).toString(), endingSupply.toString())
              })
              it("Should revert is upkeepNeeded is false", async () => {
                  await expect(sybilBurner.performUpkeep([])).to.be.revertedWithCustomError(
                      sybilBurner,
                      "SybilToken__UpkeepNotNeeded"
                  )
              })

              it("Runs and resets the timestamp", async () => {
                  const startingTimestamp = await sybilBurner._lastTimestamp()
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const tx = await sybilBurner.performUpkeep([])
                  await tx.wait(1)
                  const endingTimestamp = await sybilBurner._lastTimestamp()
                  assert(endingTimestamp > startingTimestamp)
              })
          })
      })
