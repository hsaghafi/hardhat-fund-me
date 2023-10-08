// SPDX-License-Identifier: MIT
// 1. Pragma
pragma solidity ^0.8.7;
// 2. Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// 3. Interfaces, Libraries, Contracts
error FundMe__NotOwner();

/**@title A sample Funding Contract
 * @author Patrick Collins, Hadi Saghafi
 * @notice This contract is for creating a sample funding contract
 * @dev This implements price feeds as our library
 */

abstract contract USDT {
    function transfer(address _to, uint _value) public virtual;
    function transferFrom(address _from, address _to, uint _value) public virtual;
}

contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    // State variables
    uint256 public constant MINIMUM_USD = 50 * 10**18;
    uint256 public constant MINIMUM_USDT = 50 * 10**6;
    uint256 public balance_usdt;
    address private immutable i_owner;
    address constant usdt_contract_address = 0x7169D38820dfd117C3FA1f22a697dBA58d90BA06;
    USDT constant usdt_contract = USDT(usdt_contract_address);
    address[] private s_funders;
    address[] private s_funders_usdt;
    mapping(address => uint256) private s_addressToAmountFunded;
    mapping(address => uint256) private s_addressToAmountFunded_usdt;
    AggregatorV3Interface private s_priceFeed;

    // Events
    event Fund(address indexed from, uint value);
    event Withdraw(address indexed owner, uint value);
    event Fund_USDT(address indexed from, uint value);
    event Withdraw_USDT(address indexed owner, uint value);

    // Modifiers
    modifier onlyOwner() {
        // require(msg.sender == i_owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // Functions Order:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
        i_owner = msg.sender;
    }

    /// @notice Funds our contract based on the ETH/USD price
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
        emit Fund(msg.sender, msg.value);
    }

    function fund_USDT(uint256 value) public payable {
        require(
            value >= MINIMUM_USDT,
            "You need to spend more USDT!"
        );
        usdt_contract.transferFrom(msg.sender,address(this),value);
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded_usdt[msg.sender] += value;
        balance_usdt += value;
        s_funders_usdt.push(msg.sender);
        emit Fund_USDT(msg.sender, value);
    }

    function withdraw() public onlyOwner {
        uint256 _balance = address(this).balance;
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // Transfer vs call vs Send
        // payable(msg.sender).transfer(address(this).balance);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
        emit Withdraw(i_owner, _balance);
    }

    function withdraw_usdt() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders_usdt.length;
            funderIndex++
        ) {
            address funder = s_funders_usdt[funderIndex];
            s_addressToAmountFunded_usdt[funder] = 0;
        }
        s_funders_usdt = new address[](0);
        usdt_contract.transfer(i_owner,balance_usdt);
        emit Withdraw_USDT(i_owner, balance_usdt);
        balance_usdt = 0;
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        uint256 _balance = address(this).balance;
        // mappings can't be in memory, sorry!
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // payable(msg.sender).transfer(address(this).balance);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
        emit Withdraw(i_owner, _balance);
    }

    /** @notice Gets the amount that an address has funded
     *  @param fundingAddress the address of the funder
     *  @return the amount funded
     */
    function getAddressToAmountFunded(address fundingAddress)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[fundingAddress];
    }

    function getAddressToAmountFunded_usdt(address fundingAddress)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded_usdt[fundingAddress];
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getFunder_usdt(uint256 index) public view returns (address) {
        return s_funders_usdt[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
