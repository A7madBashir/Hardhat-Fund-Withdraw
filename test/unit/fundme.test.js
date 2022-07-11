const { assert, expect } = require("chai")
const {
   deployments,
   ethers,
   getNamedAccounts,
   web3,
   network,
} = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

!developmentChain.includes(network.name)
   ? describe.skip
   : describe("Fund Me", async () => {
        let fundMe
        let deployer
        let mockV3Aggregator
        let sendValue = ethers.utils.parseEther("1") // set 1000000000000000000 wei or 1 ETH
        beforeEach(async () => {
           //    const account=await ethers.getSigner()
           //    const firstAccount=account[0]
           deployer = (await getNamedAccounts()).deployer
           await deployments.fixture(["all"])
           fundMe = await ethers.getContract("FundMe", deployer)
           mockV3Aggregator = await ethers.getContract(
              "MockV3Aggregator",
              deployer
           )
        })
        describe("contructor", async () => {
           it("sets the aggregator address correctly", async () => {
              const response = await fundMe.getPriceFeed()
              assert.equal(response, mockV3Aggregator.address)
           })
        })
        describe("fund", async () => {
           it("fails if you don't send enough ETH", async () => {
              await expect(fundMe.fund()).to.be.revertedWith(
                 "You need to spend more ETH!"
              )
           })
           it("update the amount funded data structure", async () => {
              await fundMe.fund({ value: sendValue })
              const response = await fundMe.getAddressToAmountFunded(deployer)
              assert.equal(response.toString(), sendValue.toString())
           })
           it("Add funders to array of funders", async () => {
              await fundMe.fund({ value: sendValue })
              const funder = await fundMe.getFunder(0)
              assert.equal(funder, deployer)
           })
        })
        describe("withdraw", async () => {
           beforeEach(async () => {
              await fundMe.fund({ value: sendValue })
           })
           it("withdraw ETH from a single funder", async () => {
              //arrange
              const startingFundMeBalance = await fundMe.provider.getBalance(
                 fundMe.address
              )
              const startingDeployerBalance = await fundMe.provider.getBalance(
                 deployer
              )

              //Act
              const tranasctionRespones = await fundMe.withdraw()
              const tranasctionReceipt = await tranasctionRespones.wait(1)

              const { gasUsed, effectiveGasPrice } = tranasctionReceipt
              const gasCost = gasUsed.mul(effectiveGasPrice)
              //  const gasCost = await fundMe.provider.estimateGas(tranasctionReceipt)

              const endingFundMeBalance = await fundMe.provider.getBalance(
                 fundMe.address
              )
              const endingDeployerBalance = await fundMe.provider.getBalance(
                 deployer
              )
              //Assert
              assert.equal(
                 startingDeployerBalance.add(startingFundMeBalance).toString(),
                 endingDeployerBalance.add(gasCost).toString()
              )

              assert.equal(endingFundMeBalance, 0)
           })

           it("Allows to withdraw with multiple funders", async () => {
              const accounts = await ethers.getSigners()
              for (i = 1; i < accounts.length; i++) {
                 const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                 )
                 await fundMeConnectedContract.fund({ value: sendValue })
              }
              const startingFundMeBalance = await fundMe.provider.getBalance(
                 fundMe.address
              )
              const startingDeployerBalance = await fundMe.provider.getBalance(
                 deployer
              )
              const tranasctionRespones = await fundMe.withdraw()
              const tranasctionReceipt = await tranasctionRespones.wait(1)

              const { gasUsed, effectiveGasPrice } = tranasctionReceipt
              const gasCost = gasUsed.mul(effectiveGasPrice)

              const endingFundMeBalance = await fundMe.provider.getBalance(
                 fundMe.address
              )
              const endingDeployerBalance = await fundMe.provider.getBalance(
                 deployer
              )
              assert.equal(
                 startingDeployerBalance.add(startingFundMeBalance).toString(),
                 endingDeployerBalance.add(gasCost).toString()
              )

              assert.equal(endingFundMeBalance, 0)

              await expect(fundMe.getFunder(0)).to.be.reverted

              for (i = 1; i < accounts.length; i++) {
                 assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                 )
              }
           })
           it("Only Allow the owner to withdraw", async () => {
              const accounts = await ethers.getSigners()
              const attacker = accounts[1]
              const attackerConnectedContract = await fundMe.connect(attacker)
              await expect(
                 attackerConnectedContract.withdraw()
              ).to.be.revertedWith("FundMe__NotOwner")
           })
        })
     })
