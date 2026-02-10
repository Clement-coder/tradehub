// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Whitelist is Ownable {
    bytes32 public merkleRoot;
    mapping(address => bool) public whitelisted;
    mapping(address => bool) public claimed;
    
    bool public useWhitelist = true;

    event AddressWhitelisted(address indexed account);
    event AddressRemoved(address indexed account);
    event MerkleRootUpdated(bytes32 newRoot);
    event WhitelistToggled(bool enabled);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function addToWhitelist(address account) external onlyOwner {
        require(account != address(0), "Invalid address");
        whitelisted[account] = true;
        emit AddressWhitelisted(account);
    }

    function addBatchToWhitelist(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelisted[accounts[i]] = true;
            emit AddressWhitelisted(accounts[i]);
        }
    }

    function removeFromWhitelist(address account) external onlyOwner {
        whitelisted[account] = false;
        emit AddressRemoved(account);
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }

    function toggleWhitelist(bool enabled) external onlyOwner {
        useWhitelist = enabled;
        emit WhitelistToggled(enabled);
    }

    function isWhitelisted(address account) external view returns (bool) {
        if (!useWhitelist) return true;
        return whitelisted[account];
    }

    function verifyProof(bytes32[] calldata proof, address account) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(account));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    function claim(bytes32[] calldata proof) external {
        require(!claimed[msg.sender], "Already claimed");
        require(verifyProof(proof, msg.sender), "Invalid proof");
        
        claimed[msg.sender] = true;
        whitelisted[msg.sender] = true;
        
        emit AddressWhitelisted(msg.sender);
    }
}
