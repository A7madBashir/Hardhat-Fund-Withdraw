const { network } = require("hardhat")
const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
   const { deploy, log } = deployments
   const { deployer } = await getNamedAccounts()
   const chainId = network.config.chainId
   let ethUsdPriceFeedAddress

   if (developmentChain.includes(network.name)) {
      const ethUsdAggregator = await deployments.get("MockV3Aggregator")
      ethUsdPriceFeedAddress = ethUsdAggregator.address
   } else {
      ethUsdPriceFeedAddress = networkConfig[chainId]["ethPriceFeed"]
   }
   const args = [ethUsdPriceFeedAddress]
   const fundme = await deploy("FundMe", {
      from: deployer,
      args: args,
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
   })
   if (
      !developmentChain.includes(network.name) &&
      process.env.ETHERSCAN_API_KEY
   ) {
      await verify(fundme.address, args)
   }
   log("____________________________________")
}
module.exports.tags = ["all", "fundme"]
