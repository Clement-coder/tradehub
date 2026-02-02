// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/Errors.sol";
import "./lib/Events.sol";

contract TradeHubToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    constructor(address initialOwner)
        ERC20("TradeHub Token", "THT")
        Ownable(initialOwner)
    {
        if (initialOwner == address(0)) revert Errors.ZeroAddress();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        if (to == address(0)) revert Errors.ZeroAddress();
        if (amount == 0) revert Errors.InvalidAmount();
        
        _mint(to, amount);
        emit Events.TokensMinted(to, amount);
    }

    function burn(uint256 amount) public override {
        if (amount == 0) revert Errors.InvalidAmount();
        if (balanceOf(msg.sender) < amount) revert Errors.InsufficientBalance();
        
        super.burn(amount);
        emit Events.TokensBurned(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) public override {
        if (account == address(0)) revert Errors.ZeroAddress();
        if (amount == 0) revert Errors.InvalidAmount();
        if (balanceOf(account) < amount) revert Errors.InsufficientBalance();
        
        super.burnFrom(account, amount);
        emit Events.TokensBurned(account, amount);
    }

    function pause() public onlyOwner {
        _pause();
        emit Events.ContractPaused(msg.sender);
    }

    function unpause() public onlyOwner {
        _unpause();
        emit Events.ContractUnpaused(msg.sender);
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
        
        if (from != address(0) && to != address(0)) {
            emit Events.TokensTransferred(from, to, value);
        }
    }
}
