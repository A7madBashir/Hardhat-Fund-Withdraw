// SPDX-License-Identifier: MIT
// pragma
pragma solidity ^0.8.8;
// Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
// Error Codes
error FundMe__NotOwner();

// Interfaces,Library,Contracts
/** @title A contract for crowd funding
 *  @author A7mad Bashir
 *  @notice This contract is to demo a sample funding contract
 *  @dev This implements price feed as our library
 */
contract FundMe {
   // Type Declaration
   using PriceConverter for uint256;

   // State Variables!
   mapping(address => uint256) private s_addressToAmountFunded;
   address[] private s_funders;
   address private i_owner;
   uint256 public constant MINIMUM_USD = 0.1 * 10**18;
   AggregatorV3Interface private s_priceFeed;

   // Modifier
   modifier onlyOwner() {
      // require(msg.sender == owner);
      if (msg.sender != i_owner) revert FundMe__NotOwner();
      _; // this mean that run if statment then continue the rest of the function that use it
   }

   constructor(address priceFeedAddress) {
      i_owner = msg.sender;
      s_priceFeed = AggregatorV3Interface(priceFeedAddress);
   }

   // Functions
   function fund() public payable {
      // Want to be able to set a minimum fund amount in USD
      // 1.How do we send ETH to this contract?

      require(
         msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
         "You need to spend more ETH!"
      );
      // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
      s_addressToAmountFunded[msg.sender] += msg.value;
      s_funders.push(msg.sender);
   }

   function withdraw() public payable onlyOwner {
      address[] memory funders = s_funders;
      for (
         uint256 funderIndex = 0;
         funderIndex < funders.length;
         funderIndex++
      ) {
         address funder = funders[funderIndex];
         s_addressToAmountFunded[funder] = 0;
      }
      s_funders = new address[](0);
      (bool callSuccess, ) = payable(msg.sender).call{
         value: address(this).balance
      }(""); // returns 2 variable
      require(callSuccess, "Call failed");
   }

   // View , Pure
   function getAddressToAmountFunded(address funder)
      public
      view
      returns (uint256)
   {
      return s_addressToAmountFunded[funder];
   }

   function getPriceFeed() public view returns (AggregatorV3Interface) {
      return s_priceFeed;
   }

   function getFunder(uint256 index) public view returns (address) {
      return s_funders[index];
   }

   function getOwner() public view returns (address) {
      return i_owner;
   }
}
