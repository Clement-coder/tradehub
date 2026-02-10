// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract RoyaltyManager is IERC2981 {
    struct RoyaltyInfo {
        address receiver;
        uint96 royaltyFraction;
    }

    mapping(uint256 => RoyaltyInfo) private _tokenRoyalties;
    RoyaltyInfo private _defaultRoyalty;
    
    uint96 private constant _DENOMINATOR = 10000;

    event DefaultRoyaltySet(address indexed receiver, uint96 feeNumerator);
    event TokenRoyaltySet(uint256 indexed tokenId, address indexed receiver, uint96 feeNumerator);

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external {
        require(feeNumerator <= _DENOMINATOR, "Royalty too high");
        require(receiver != address(0), "Invalid receiver");
        
        _defaultRoyalty = RoyaltyInfo(receiver, feeNumerator);
        emit DefaultRoyaltySet(receiver, feeNumerator);
    }

    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external {
        require(feeNumerator <= _DENOMINATOR, "Royalty too high");
        require(receiver != address(0), "Invalid receiver");
        
        _tokenRoyalties[tokenId] = RoyaltyInfo(receiver, feeNumerator);
        emit TokenRoyaltySet(tokenId, receiver, feeNumerator);
    }

    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external 
        view 
        override 
        returns (address, uint256) 
    {
        RoyaltyInfo memory royalty = _tokenRoyalties[tokenId];
        
        if (royalty.receiver == address(0)) {
            royalty = _defaultRoyalty;
        }
        
        uint256 royaltyAmount = (salePrice * royalty.royaltyFraction) / _DENOMINATOR;
        return (royalty.receiver, royaltyAmount);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC2981).interfaceId;
    }
}
