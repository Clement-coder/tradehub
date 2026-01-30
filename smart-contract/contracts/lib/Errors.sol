// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TradeHub Errors Library
 * @dev Centralized error definitions for all TradeHub contracts
 */
library Errors {
    // Common errors
    error ZeroAddress();
    error InvalidAmount();
    error InsufficientBalance();
    error Unauthorized();
    error ContractPaused();
    error InvalidInput();
    
    // ERC20 specific errors
    error TransferFailed();
    error MintingFailed();
    error BurningFailed();
    error AllowanceExceeded();
    
    // ERC721 specific errors
    error TokenNotExists();
    error NotTokenOwner();
    error TokenAlreadyExists();
    error InvalidTokenId();
    error TransferToNonERC721Receiver();
    
    // ERC1155 specific errors
    error ArrayLengthMismatch();
    error InsufficientTokenBalance();
    error TransferToNonERC1155Receiver();
    error InvalidTokenType();
    
    // Access control errors
    error NotOwner();
    error NotMinter();
    error NotBurner();
    error RoleNotGranted();
    
    // URI and metadata errors
    error InvalidURI();
    error MetadataFrozen();
    error URINotSet();
}
// Commit 2
// Commit 3
// Commit 4
// Commit 5
// Commit 6
// Commit 7
// Commit 8
// Commit 9
// Commit 10
// Commit 11
// Commit 12
// Commit 13
// Commit 14
// Commit 15
// Commit 16
// Commit 17
// Commit 18
// Commit 19
// Commit 20
