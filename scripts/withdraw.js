const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
   const { deployer } = await getNamedAccounts()
   const fundMe = await ethers.getContract("FundMe", deployer)
   console.log("Funding Contract...")
   const transactionRespones = await fundMe.withdraw()
   await transactionRespones.wait(1)
   console.log("Got it back!")
}

main()
   .then(() => process.exit(0))
   .catch((err) => {
      console.error(err)
      process.exit(1)
   })
