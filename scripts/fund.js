const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
   const { deployer } = await getNamedAccounts()
   const fundMe = await ethers.getContract("FundMe", deployer)
   console.log("Funding Contract...")
   const transactionRespones = await fundMe.fund({
      value: ethers.utils.parseEther("0.08"),
   })
   await transactionRespones.wait(1)
}

main()
   .then(() => process.exit(0))
   .catch((err) => {
      console.error(err)
      process.exit(1)
   })
