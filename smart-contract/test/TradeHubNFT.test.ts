import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { TradeHubNFT } from "../typechain-types"; // Adjust path as needed

describe("TradeHubNFT", function () {
  let tradeHubNFT: TradeHubNFT;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const BASE_URI = "ipfs://";

  // Deploy the contract before each test
  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const TradeHubNFTFactory = await ethers.getContractFactory("TradeHubNFT");
    tradeHubNFT = await TradeHubNFTFactory.deploy(owner.address);
    await tradeHubNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await tradeHubNFT.name()).to.equal("TradeHubNFT");
      expect(await tradeHubNFT.symbol()).to.equal("THNFT");
    });

    it("Should set the correct owner", async function () {
      expect(await tradeHubNFT.owner()).to.equal(owner.address);
    });

    it("Should have the correct base URI", async function () {
        // Since _baseURI is internal and tokenURI combines it with token-specific URI,
        // we can't directly test _baseURI. We'll rely on tokenURI for verification.
        // Or we can check if it concatenates as expected later with a minted token.
    });
  });

  describe("Minting", function () {
    const tokenId1 = 0; // First token ID is 0 due to Counters.Counter starting from 0
    const tokenURI1 = "mytokenuri1";
    const fullTokenURI1 = BASE_URI + tokenURI1;

    it("Should allow the owner to mint NFTs", async function () {
      await expect(tradeHubNFT.safeMint(addr1.address, tokenURI1))
        .to.emit(tradeHubNFT, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, tokenId1);

      expect(await tradeHubNFT.ownerOf(tokenId1)).to.equal(addr1.address);
      expect(await tradeHubNFT.tokenURI(tokenId1)).to.equal(fullTokenURI1);
      expect(await tradeHubNFT.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should increment token ID for subsequent mints", async function () {
      const tokenId2 = 1;
      const tokenURI2 = "mytokenuri2";
      const fullTokenURI2 = BASE_URI + tokenURI2;

      await tradeHubNFT.safeMint(addr1.address, tokenURI1); // tokenId 0
      await tradeHubNFT.safeMint(addr2.address, tokenURI2); // tokenId 1

      expect(await tradeHubNFT.ownerOf(tokenId2)).to.equal(addr2.address);
      expect(await tradeHubNFT.tokenURI(tokenId2)).to.equal(fullTokenURI2);
    });

    it("Should not allow non-owners to mint NFTs", async function () {
      await expect(tradeHubNFT.connect(addr1).safeMint(addr1.address, tokenURI1))
        .to.be.revertedWithCustomError(tradeHubNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transfers", function () {
    const tokenId1 = 0;
    const tokenURI1 = "mytokenuri1";

    beforeEach(async function () {
      await tradeHubNFT.safeMint(owner.address, tokenURI1); // Mint to owner for transfer tests
    });

    it("Should allow safe transfer of NFTs", async function () {
      await expect(tradeHubNFT.transferFrom(owner.address, addr1.address, tokenId1))
        .to.emit(tradeHubNFT, "Transfer")
        .withArgs(owner.address, addr1.address, tokenId1);

      expect(await tradeHubNFT.ownerOf(tokenId1)).to.equal(addr1.address);
      expect(await tradeHubNFT.balanceOf(owner.address)).to.equal(0);
      expect(await tradeHubNFT.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should fail transfer if sender is not owner or approved", async function () {
      await expect(tradeHubNFT.connect(addr1).transferFrom(owner.address, addr2.address, tokenId1))
        .to.be.revertedWithCustomError(tradeHubNFT, "ERC721InsufficientApproval");
    });

    it("Should fail transfer to zero address", async function () {
      await expect(tradeHubNFT.transferFrom(owner.address, ethers.ZeroAddress, tokenId1))
        .to.be.revertedWithCustomError(tradeHubNFT, "ERC721InvalidRecipient");
    });
  });

  describe("Approvals", function () {
    const tokenId1 = 0;
    const tokenURI1 = "mytokenuri1";

    beforeEach(async function () {
      await tradeHubNFT.safeMint(owner.address, tokenURI1);
    });

    it("Should allow approving another address to manage token", async function () {
      await expect(tradeHubNFT.approve(addr1.address, tokenId1))
        .to.emit(tradeHubNFT, "Approval")
        .withArgs(owner.address, addr1.address, tokenId1);

      expect(await tradeHubNFT.getApproved(tokenId1)).to.equal(addr1.address);
    });

    it("Should allow operator to transfer token after approval", async function () {
      await tradeHubNFT.approve(addr1.address, tokenId1);
      await expect(tradeHubNFT.connect(addr1).transferFrom(owner.address, addr2.address, tokenId1))
        .to.emit(tradeHubNFT, "Transfer");

      expect(await tradeHubNFT.ownerOf(tokenId1)).to.equal(addr2.address);
    });

    it("Should allow setting approval for all tokens", async function () {
      await expect(tradeHubNFT.setApprovalForAll(addr1.address, true))
        .to.emit(tradeHubNFT, "ApprovalForAll")
        .withArgs(owner.address, addr1.address, true);

      expect(await tradeHubNFT.isApprovedForAll(owner.address, addr1.address)).to.be.true;
    });

    it("Should allow approved for all operator to transfer token", async function () {
      const tokenId2 = 1;
      const tokenURI2 = "mytokenuri2";
      await tradeHubNFT.safeMint(owner.address, tokenURI2);

      await tradeHubNFT.setApprovalForAll(addr1.address, true);
      await expect(tradeHubNFT.connect(addr1).transferFrom(owner.address, addr2.address, tokenId2))
        .to.emit(tradeHubNFT, "Transfer");

      expect(await tradeHubNFT.ownerOf(tokenId2)).to.equal(addr2.address);
    });
  });

  describe("Burning", function () {
    const tokenId1 = 0;
    const tokenURI1 = "mytokenuri1";

    beforeEach(async function () {
      await tradeHubNFT.safeMint(owner.address, tokenURI1);
    });

    it("Should allow owner to burn NFTs", async function () {
      await expect(tradeHubNFT.burn(tokenId1))
        .to.emit(tradeHubNFT, "Transfer")
        .withArgs(owner.address, ethers.ZeroAddress, tokenId1);

      expect(await tradeHubNFT.balanceOf(owner.address)).to.equal(0);
      await expect(tradeHubNFT.ownerOf(tokenId1)).to.be.revertedWith("ERC721: invalid token ID");
    });

    it("Should not allow non-owner to burn NFTs", async function () {
      await expect(tradeHubNFT.connect(addr1).burn(tokenId1))
        .to.be.revertedWithCustomError(tradeHubNFT, "ERC721InsufficientApproval");
    });

    it("Should not allow burning a non-existent token", async function () {
      const nonExistentTokenId = 999;
      await expect(tradeHubNFT.burn(nonExistentTokenId))
        .to.be.revertedWith("ERC721: invalid token ID");
    });
  });

  describe("Ownership", function () {
    it("Should allow owner to transfer ownership", async function () {
      await expect(tradeHubNFT.transferOwnership(addr1.address))
        .to.emit(tradeHubNFT, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);
      expect(await tradeHubNFT.owner()).to.equal(addr1.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      await expect(tradeHubNFT.connect(addr1).transferOwnership(addr2.address))
        .to.be.revertedWithCustomError(tradeHubNFT, "OwnableUnauthorizedAccount");
    });
  });
});
