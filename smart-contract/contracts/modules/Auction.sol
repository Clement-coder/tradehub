// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Auction is ReentrancyGuard {
    struct AuctionData {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 startPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool ended;
    }

    mapping(bytes32 => AuctionData) public auctions;
    mapping(bytes32 => mapping(address => uint256)) public bids;

    event AuctionCreated(bytes32 indexed auctionId, address indexed seller, uint256 startPrice, uint256 duration);
    event BidPlaced(bytes32 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionEnded(bytes32 indexed auctionId, address indexed winner, uint256 amount);

    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startPrice,
        uint256 duration
    ) external returns (bytes32) {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not owner");
        require(duration >= 1 hours, "Duration too short");
        
        bytes32 auctionId = keccak256(abi.encodePacked(nftContract, tokenId, msg.sender, block.timestamp));
        
        auctions[auctionId] = AuctionData({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            startPrice: startPrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            ended: false
        });

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        
        emit AuctionCreated(auctionId, msg.sender, startPrice, duration);
        return auctionId;
    }

    function placeBid(bytes32 auctionId) external payable nonReentrant {
        AuctionData storage auction = auctions[auctionId];
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value >= auction.startPrice, "Bid too low");
        require(msg.value > auction.highestBid, "Bid not high enough");

        if (auction.highestBidder != address(0)) {
            bids[auctionId][auction.highestBidder] += auction.highestBid;
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    function endAuction(bytes32 auctionId) external nonReentrant {
        AuctionData storage auction = auctions[auctionId];
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.ended, "Already ended");

        auction.ended = true;

        if (auction.highestBidder != address(0)) {
            IERC721(auction.nftContract).transferFrom(address(this), auction.highestBidder, auction.tokenId);
            payable(auction.seller).transfer(auction.highestBid);
        } else {
            IERC721(auction.nftContract).transferFrom(address(this), auction.seller, auction.tokenId);
        }

        emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
    }

    function withdrawBid(bytes32 auctionId) external nonReentrant {
        uint256 amount = bids[auctionId][msg.sender];
        require(amount > 0, "No bid to withdraw");

        bids[auctionId][msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
