// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Escrow is ReentrancyGuard {
    enum Status { PENDING, COMPLETED, CANCELLED, DISPUTED }

    struct EscrowData {
        address buyer;
        address seller;
        uint256 amount;
        Status status;
        uint256 createdAt;
    }

    mapping(bytes32 => EscrowData) public escrows;
    address public arbiter;

    event EscrowCreated(bytes32 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount);
    event EscrowCompleted(bytes32 indexed escrowId);
    event EscrowCancelled(bytes32 indexed escrowId);
    event EscrowDisputed(bytes32 indexed escrowId);

    constructor(address _arbiter) {
        arbiter = _arbiter;
    }

    function createEscrow(address seller) external payable returns (bytes32) {
        require(msg.value > 0, "Invalid amount");
        require(seller != address(0), "Invalid seller");
        
        bytes32 escrowId = keccak256(abi.encodePacked(msg.sender, seller, block.timestamp));
        
        escrows[escrowId] = EscrowData({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            status: Status.PENDING,
            createdAt: block.timestamp
        });

        emit EscrowCreated(escrowId, msg.sender, seller, msg.value);
        return escrowId;
    }

    function completeEscrow(bytes32 escrowId) external nonReentrant {
        EscrowData storage escrow = escrows[escrowId];
        require(escrow.buyer == msg.sender, "Not buyer");
        require(escrow.status == Status.PENDING, "Invalid status");

        escrow.status = Status.COMPLETED;
        payable(escrow.seller).transfer(escrow.amount);

        emit EscrowCompleted(escrowId);
    }

    function cancelEscrow(bytes32 escrowId) external nonReentrant {
        EscrowData storage escrow = escrows[escrowId];
        require(escrow.seller == msg.sender, "Not seller");
        require(escrow.status == Status.PENDING, "Invalid status");

        escrow.status = Status.CANCELLED;
        payable(escrow.buyer).transfer(escrow.amount);

        emit EscrowCancelled(escrowId);
    }

    function disputeEscrow(bytes32 escrowId) external {
        EscrowData storage escrow = escrows[escrowId];
        require(escrow.buyer == msg.sender || escrow.seller == msg.sender, "Not authorized");
        require(escrow.status == Status.PENDING, "Invalid status");

        escrow.status = Status.DISPUTED;
        emit EscrowDisputed(escrowId);
    }

    function resolveDispute(bytes32 escrowId, bool favorBuyer) external nonReentrant {
        require(msg.sender == arbiter, "Not arbiter");
        EscrowData storage escrow = escrows[escrowId];
        require(escrow.status == Status.DISPUTED, "Not disputed");

        escrow.status = Status.COMPLETED;
        
        if (favorBuyer) {
            payable(escrow.buyer).transfer(escrow.amount);
        } else {
            payable(escrow.seller).transfer(escrow.amount);
        }
    }
}
