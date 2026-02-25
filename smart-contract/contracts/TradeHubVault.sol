// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/Errors.sol";
import "./lib/Events.sol";

contract TradeHubVault is Ownable {
    mapping(address => uint256) public deposits;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {
        if (initialOwner == address(0)) revert Errors.ZeroAddress();
    }

    function deposit() public payable {
        if (msg.value == 0) revert Errors.InvalidAmount();
        deposits[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        if (amount == 0) revert Errors.InvalidAmount();
        if (deposits[msg.sender] < amount) revert Errors.InsufficientBalance();

        deposits[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) {
            deposits[msg.sender] += amount; // Revert state if transfer fails
            revert Errors.TransferFailed();
        }
        emit Withdrawal(msg.sender, amount);
    }

    // Function to allow the owner to retrieve any accidental ETH sent to the contract
    function rescueETH(uint256 amount) public onlyOwner {
        if (amount == 0) revert Errors.InvalidAmount();
        if (address(this).balance < amount) revert Errors.InsufficientBalance();

        (bool success, ) = owner().call{value: amount}("");
        if (!success) {
            revert Errors.TransferFailed();
        }
    }
}
