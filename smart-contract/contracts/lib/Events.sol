// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TradeHub Events Library
 * @dev Centralized event definitions for all TradeHub contracts
 */
library Events {
    // Common events
    event ContractPaused(address indexed account);
    event ContractUnpaused(address indexed account);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // ERC20 specific events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event TokensTransferred(address indexed from, address indexed to, uint256 amount);
    
    // ERC721 specific events
    event NFTMinted(address indexed to, uint256 indexed tokenId, string uri);
    event NFTBurned(uint256 indexed tokenId);
    event NFTTransferred(address indexed from, address indexed to, uint256 indexed tokenId);
    event BaseURIUpdated(string newBaseURI);
    event TokenURIUpdated(uint256 indexed tokenId, string newURI);
    
    // ERC1155 specific events
    event MultiTokenMinted(address indexed to, uint256 indexed id, uint256 amount);
    event MultiTokenBatchMinted(address indexed to, uint256[] ids, uint256[] amounts);
    event MultiTokenBurned(address indexed from, uint256 indexed id, uint256 amount);
    event MultiTokenBatchBurned(address indexed from, uint256[] ids, uint256[] amounts);
    event MultiTokenTransferred(address indexed from, address indexed to, uint256 indexed id, uint256 amount);
    event MultiTokenBatchTransferred(address indexed from, address indexed to, uint256[] ids, uint256[] amounts);
    event URIUpdated(string newURI);
    
    // Access control events
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);
    event BurnerAdded(address indexed account);
    event BurnerRemoved(address indexed account);
    
    // Marketplace events (for future use)
    event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ItemSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ItemDelisted(uint256 indexed tokenId, address indexed seller);
    event PriceUpdated(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);
}
