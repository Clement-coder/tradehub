// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/Errors.sol";
import "./lib/Events.sol";

contract TradeHubNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    constructor(address initialOwner)
        ERC721("TradeHubNFT", "THNFT")
        Ownable(initialOwner)
    {
        if (initialOwner == address(0)) revert Errors.ZeroAddress();
        _baseTokenURI = "ipfs://";
        _nextTokenId = 1; // Start token IDs from 1
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        if (bytes(newBaseURI).length == 0) revert Errors.InvalidURI();
        
        _baseTokenURI = newBaseURI;
        emit Events.BaseURIUpdated(newBaseURI);
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        if (to == address(0)) revert Errors.ZeroAddress();
        if (bytes(uri).length == 0) revert Errors.InvalidURI();
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit Events.NFTMinted(to, tokenId, uri);
    }

    function burn(uint256 tokenId) public {
        if (_ownerOf(tokenId) == address(0)) revert Errors.TokenNotExists();
        if (ownerOf(tokenId) != msg.sender && getApproved(tokenId) != msg.sender && !isApprovedForAll(ownerOf(tokenId), msg.sender)) {
            revert Errors.NotTokenOwner();
        }
        
        _burn(tokenId);
        emit Events.NFTBurned(tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory uri) public onlyOwner {
        if (_ownerOf(tokenId) == address(0)) revert Errors.TokenNotExists();
        if (bytes(uri).length == 0) revert Errors.InvalidURI();
        
        _setTokenURI(tokenId, uri);
        emit Events.TokenURIUpdated(tokenId, uri);
    }

    function getCurrentTokenId() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    // The following functions are overrides required by Solidity.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        address result = super._update(to, tokenId, auth);
        
        if (from != address(0) && to != address(0)) {
            emit Events.NFTTransferred(from, to, tokenId);
        }
        
        return result;
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        if (_ownerOf(tokenId) == address(0)) revert Errors.TokenNotExists();
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
