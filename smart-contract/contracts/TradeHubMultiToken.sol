// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/Errors.sol";
import "./lib/Events.sol";

contract TradeHubMultiToken is ERC1155, ERC1155Burnable, ERC1155Pausable, Ownable {
    constructor(address initialOwner)
        ERC1155("https://tradehub.com/api/token/{id}.json")
        Ownable(initialOwner)
    {
        if (initialOwner == address(0)) revert Errors.ZeroAddress();
    }

    function setURI(string memory newuri) public onlyOwner {
        if (bytes(newuri).length == 0) revert Errors.InvalidURI();
        
        _setURI(newuri);
        emit Events.URIUpdated(newuri);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        if (account == address(0)) revert Errors.ZeroAddress();
        if (amount == 0) revert Errors.InvalidAmount();
        
        _mint(account, id, amount, data);
        emit Events.MultiTokenMinted(account, id, amount);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        if (to == address(0)) revert Errors.ZeroAddress();
        if (ids.length != amounts.length) revert Errors.ArrayLengthMismatch();
        if (ids.length == 0) revert Errors.InvalidInput();
        
        for (uint256 i = 0; i < amounts.length; i++) {
            if (amounts[i] == 0) revert Errors.InvalidAmount();
        }
        
        _mintBatch(to, ids, amounts, data);
        emit Events.MultiTokenBatchMinted(to, ids, amounts);
    }

    function burn(address account, uint256 id, uint256 value) public override {
        if (account == address(0)) revert Errors.ZeroAddress();
        if (value == 0) revert Errors.InvalidAmount();
        if (balanceOf(account, id) < value) revert Errors.InsufficientTokenBalance();
        if (account != msg.sender && !isApprovedForAll(account, msg.sender)) {
            revert Errors.Unauthorized();
        }
        
        super.burn(account, id, value);
        emit Events.MultiTokenBurned(account, id, value);
    }

    function burnBatch(address account, uint256[] memory ids, uint256[] memory values) public override {
        if (account == address(0)) revert Errors.ZeroAddress();
        if (ids.length != values.length) revert Errors.ArrayLengthMismatch();
        if (ids.length == 0) revert Errors.InvalidInput();
        if (account != msg.sender && !isApprovedForAll(account, msg.sender)) {
            revert Errors.Unauthorized();
        }
        
        for (uint256 i = 0; i < ids.length; i++) {
            if (values[i] == 0) revert Errors.InvalidAmount();
            if (balanceOf(account, ids[i]) < values[i]) revert Errors.InsufficientTokenBalance();
        }
        
        super.burnBatch(account, ids, values);
        emit Events.MultiTokenBatchBurned(account, ids, values);
    }

    function pause() public onlyOwner {
        _pause();
        emit Events.ContractPaused(msg.sender);
    }

    function unpause() public onlyOwner {
        _unpause();
        emit Events.ContractUnpaused(msg.sender);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Pausable)
    {
        super._update(from, to, ids, values);
        
        if (from != address(0) && to != address(0)) {
            if (ids.length == 1) {
                emit Events.MultiTokenTransferred(from, to, ids[0], values[0]);
            } else {
                emit Events.MultiTokenBatchTransferred(from, to, ids, values);
            }
        }
    }
}
