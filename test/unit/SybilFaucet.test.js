const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const {
    developmentChains,
    INITIAL_TOKEN_AMOUNT,
    INITIAL_LOCK_TIME,
} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("SybilFaucet Unit Tests", () => {
          let sybilFaucet, tokenAmount, lockTime, owner, paused, deployer, sybilToken, tokenAddress
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              sybilToken = await ethers.getContract("SybilToken")
              sybilFaucet = await ethers.getContract("SybilFaucet")
              tokenAmount = await sybilFaucet.s_tokenAmount()
              tokenAddress = await sybilFaucet.i_sybilToken()
              lockTime = await sybilFaucet.s_lockTime()
              owner = await sybilFaucet.s_owner()
              paused = await sybilFaucet.s_paused()
          })

          describe("constructor", () => {
              it("Sets the token amount correctly", async () => {
                  assert.equal(tokenAmount.toString(), INITIAL_TOKEN_AMOUNT)
              })
              it("Sets the lock time correctly", async () => {
                  assert.equal(lockTime.toString(), INITIAL_LOCK_TIME)
              })
              it("Sets the sybil token address correctly", async () => {
                  assert.equal(sybilToken.address, tokenAddress)
              })
              it("Sets the owner correctly", async () => {
                  assert.equal(deployer, owner)
              })
          })

          describe("receive", () => {
              it("Emit event on receiving tokens", async () => {
                  const signer = await ethers.getSigner(deployer)
                  await expect(
                      signer.sendTransaction({
                          to: sybilFaucet.address,
                          value: ethers.utils.parseEther("100"),
                          gasLimit: 1000000,
                      })
                  )
                      .to.emit(sybilFaucet, "Deposit")
                      .withArgs(owner, ethers.utils.parseEther("100"))
              })
          })

          describe("setLockTime", () => {
              it("Only allows the owner to set a new lock time", async () => {
                  const transactionResponse = await sybilFaucet.setLockTime("100")
                  await transactionResponse.wait(1)
                  const lockTime = await sybilFaucet.s_lockTime()
                  assert.equal(lockTime.toString(), "100")
              })
              it("Reverts if an attacker tries to set a new lock time", async () => {
                  const accounts = await ethers.getSigners()
                  const attackerConnected = sybilFaucet.connect(accounts[1])
                  await expect(attackerConnected.setLockTime("100")).to.be.revertedWithCustomError(
                      sybilFaucet,
                      "SybilFaucet__NotOwner"
                  )
              })
          })

          describe("setTokenAmount", () => {
              it("Only allows the owner to set a new token amount", async () => {
                  const transactionResponse = await sybilFaucet.setTokenAmount(
                      "11000000000000000000"
                  )
                  await transactionResponse.wait(1)
                  const tokenAmount = await sybilFaucet.s_tokenAmount()
                  assert.equal(tokenAmount.toString(), "11000000000000000000")
              })
              it("Reverts if an attacker tries to set a new token amount", async () => {
                  const accounts = await ethers.getSigners()
                  const attackerConnected = sybilFaucet.connect(accounts[1])
                  await expect(
                      attackerConnected.setTokenAmount("11000000000000000000")
                  ).to.be.revertedWithCustomError(sybilFaucet, "SybilFaucet__NotOwner")
              })
          })

          describe("transferOwnership", () => {
              it("Only allows the owner to set a new owner", async () => {
                  const accounts = await ethers.getSigners()
                  const transactionResponse = await sybilFaucet.transferOwnership(
                      accounts[1].address
                  )
                  await transactionResponse.wait(1)
                  const newOwner = await sybilFaucet.s_owner()
                  assert.equal(newOwner, accounts[1].address)
              })
              it("Reverts if an attacker tries to set a new owner", async () => {
                  const accounts = await ethers.getSigners()
                  const attackerConnected = sybilFaucet.connect(accounts[1])
                  await expect(
                      attackerConnected.transferOwnership(accounts[1].address)
                  ).to.be.revertedWithCustomError(sybilFaucet, "SybilFaucet__NotOwner")
              })
          })

          describe("getLastTime", () => {
              it("Read the last time a petitioner requested for funds", async () => {
                  const accounts = await ethers.getSigners()
                  const lastRequestTime = await sybilFaucet.getLastTime(accounts[1].address)
                  assert.equal(lastRequestTime.toString(), "0")
              })
          })

          describe("pause", () => {
              it("Only allows the owner to pause the transfers", async () => {
                  const transactionResponse = await sybilFaucet.pause()
                  await transactionResponse.wait(1)
                  assert.equal(await sybilFaucet.s_paused(), true)
              })
              it("Reverts if an attacker tries to pause the transfers", async () => {
                  const accounts = await ethers.getSigners()
                  const attackerConnected = sybilFaucet.connect(accounts[1])
                  await expect(attackerConnected.pause()).to.be.revertedWithCustomError(
                      sybilFaucet,
                      "SybilFaucet__NotOwner"
                  )
              })
              it("Emits an event on pausing the withdrawals", async () => {
                  await expect(sybilFaucet.pause()).to.emit(sybilFaucet, "Paused")
              })
          })

          describe("unpause", () => {
              beforeEach(async () => {
                  const transactionResponse = await sybilFaucet.pause()
                  await transactionResponse.wait(1)
              })
              it("Only allows the owner to unpause the contract", async () => {
                  const transactionResponse = await sybilFaucet.unpause()
                  await transactionResponse.wait(1)
                  assert.equal(await sybilFaucet.s_paused(), false)
              })
              it("Reverts if an attacker tries to unpause the contract", async () => {
                  const accounts = await ethers.getSigners()
                  const attackerConnected = sybilFaucet.connect(accounts[1])
                  await expect(attackerConnected.unpause()).to.be.revertedWithCustomError(
                      sybilFaucet,
                      "SybilFaucet__NotOwner"
                  )
              })
              it("Emits an event on resuming the withdrawals", async () => {
                  await expect(sybilFaucet.unpause()).to.emit(sybilFaucet, "Unpaused")
              })
          })

          describe("withdraw", () => {
              it("The onwer can withdraw the funds from the faucet and emit event", async () => {
                  const initialFaucetBalance = await sybilFaucet.getBalance()
                  const transactionFundFaucet = await sybilToken.transfer(
                      sybilFaucet.address,
                      ethers.utils.parseEther("100")
                  )
                  await transactionFundFaucet.wait(1)
                  await expect(sybilFaucet.withdraw())
                      .to.emit(sybilFaucet, "Withdraw")
                      .withArgs(owner, initialFaucetBalance)
                  assert.equal((await sybilFaucet.getBalance()).toString(), "0")
              })
          })

          describe("isAllowedToWithdraw", () => {
              it("Returns true if the account has never withdraw before", async () => {
                  const accounts = await ethers.getSigners()
                  const canWithdraw = await sybilFaucet.isAllowedToWithdraw(accounts[1].address)
                  assert(canWithdraw, true)
              })
          })

          describe("requestTokens", () => {
              let petitioner, amount, accounts
              beforeEach(async () => {
                  accounts = await ethers.getSigners()
                  petitioner = sybilFaucet.connect(accounts[1])
                  amount = ethers.utils.parseEther("1000")
                  const transactionResponse = await sybilToken.transfer(sybilFaucet.address, amount)
                  await transactionResponse.wait(1)
              })
              it("User can request tokens for the first time", async () => {
                  const initialPetitionerBalance = await sybilToken.balanceOf(petitioner.address)
                  const transactionResponse = await petitioner.requestTokens()
                  await transactionResponse.wait(1)
                  const endingPetitionerBalance = await sybilToken.balanceOf(petitioner.address)

                  assert.equal(
                      initialPetitionerBalance.sub(tokenAmount).toString(),
                      endingPetitionerBalance.toString()
                  )
              })
              it("Reverts if not enough time has passed between requests", async () => {
                  const transactionResponse = await petitioner.requestTokens()
                  await transactionResponse.wait(1)
                  await expect(petitioner.requestTokens()).to.be.revertedWith(
                      "SybilFaucet: Not sufficient time elapsed since last request"
                  )
              })
              it("Allows to withdraw after enough elapsed time has pass since last request", async () => {
                  const transactionResponse = await petitioner.requestTokens()
                  await transactionResponse.wait(1)
                  await network.provider.send("evm_increaseTime", [lockTime.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  await expect(petitioner.requestTokens()).to.not.be.reverted
                  assert.equal(
                      (await sybilFaucet.getBalance()).toString(),
                      ethers.utils.parseEther("980").toString()
                  )
              })
              it("Reverts if the requests are paused", async () => {
                  const transactionResponse = await sybilFaucet.pause()
                  await transactionResponse.wait(1)
                  await expect(petitioner.requestTokens()).to.be.revertedWithCustomError(
                      sybilFaucet,
                      "SybilFaucet__RequestsPaused"
                  )
              })
              it("Emits an event on requesting tokens", async () => {
                  await expect(petitioner.requestTokens())
                      .to.emit(sybilFaucet, "TokensRequested")
                      .withArgs(accounts[1].address, tokenAmount)
              })
          })
      })
