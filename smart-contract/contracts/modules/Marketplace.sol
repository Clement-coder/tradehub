// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    mapping(bytes32 => Listing) public listings;
    address public treasury;

    event Listed(bytes32 indexed listingId, address indexed seller, address nftContract, uint256 tokenId, uint256 price);
    event Sold(bytes32 indexed listingId, address indexed buyer, uint256 price);
    event Cancelled(bytes32 indexed listingId);

    constructor(address _treasury) {
        treasury = _treasury;
    }

    function list(address nftContract, uint256 tokenId, uint256 price) external returns (bytes32) {
        require(price > 0, "Invalid price");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not owner");
        
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId, msg.sender, block.timestamp));
        
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });

        emit Listed(listingId, msg.sender, nftContract, tokenId, price);
        return listingId;
    }

    function buy(bytes32 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Not active");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.active = false;
        
        IERC721(listing.nftContract).transferFrom(listing.seller, msg.sender, listing.tokenId);
        payable(listing.seller).transfer(listing.price);

        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }

        emit Sold(listingId, msg.sender, listing.price);
    }

    function cancel(bytes32 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Not active");
        
        listing.active = false;
        emit Cancelled(listingId);
    }
}
