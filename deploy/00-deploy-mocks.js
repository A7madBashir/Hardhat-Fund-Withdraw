// I can make mock deploy function by MockV3Aggregator docs from the ChainLink Docs
// so just review the library to see what args are take and what function are do

const { network } = require("hardhat")
const {
   developmentChain,
   DECIMALS,
   INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
   const { deploy, log } = deployments
   const { deployer } = await getNamedAccounts()

   if (developmentChain.includes(network.name)) {
      log("Local Network detected! deploing mocks...")
      await deploy("MockV3Aggregator", {
         contract: "MockV3Aggregator",
         from: deployer,
         log: true,
         args: [DECIMALS, INITIAL_ANSWER],
      })
      log("Mocks Deployed!")
      log("________________________________________________")
   }
}
module.exports.tags = ["all", "mocks"] // for just make it easy to call it on terminal for only this file of deploy files
