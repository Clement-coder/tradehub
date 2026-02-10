// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Treasury is Ownable {
    uint256 public platformFee = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    mapping(address => uint256) public balances;

    event FeeCollected(address indexed token, uint256 amount);
    event FeeWithdrawn(address indexed token, address indexed to, uint256 amount);
    event FeeUpdated(uint256 newFee);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function collectFee(address token, uint256 amount) external {
        require(amount > 0, "Invalid amount");
        balances[token] += amount;
        emit FeeCollected(token, amount);
    }

    function withdraw(address token, address to, uint256 amount) external onlyOwner {
        require(balances[token] >= amount, "Insufficient balance");
        balances[token] -= amount;
        
        if (token == address(0)) {
            payable(to).transfer(amount);
        } else {
            IERC20(token).transfer(to, amount);
        }
        
        emit FeeWithdrawn(token, to, amount);
    }

    function updateFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
        emit FeeUpdated(newFee);
    }

    function calculateFee(uint256 amount) external view returns (uint256) {
        return (amount * platformFee) / FEE_DENOMINATOR;
    }

    receive() external payable {
        balances[address(0)] += msg.value;
    }
}
