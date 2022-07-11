const { assert } = require("chai")
const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

developmentChain.includes(network.name)
   ? describe.skip
   : describe("FundMe", async () => {
        let deployer
        let fundMe
        const sendValue = ethers.utils.parseEther("0.08")
        beforeEach(async () => {
           deployer = (await getNamedAccounts()).deployer
           fundMe = await ethers.getContract("FundMe", deployer)
        })
        it("Allows people to fund and withdraw", async () => {
           const transactionRespones = await fundMe.fund({ value: sendValue })
           await transactionRespones.wait(1)

           const transactionRespones2 = await fundMe.withdraw()
           await transactionRespones2.wait(1)

           const endingBalance = await fundMe.provider.getBalance(
              fundMe.address
           )
           assert.equal(endingBalance.toString(), 0)
        })
     })
