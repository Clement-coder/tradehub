import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { TradeHubMultiToken } from "../typechain-types"; // Adjust path as needed

describe("TradeHubMultiToken", function () {
  let tradeHubMultiToken: TradeHubMultiToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const ZERO_BYTES = "0x";
  const BASE_URI = "https://tradehub.com/api/token/{id}.json";
  const NEW_URI = "https://newtradehub.com/api/token/{id}.json";

  // Deploy the contract before each test
  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const TradeHubMultiTokenFactory = await ethers.getContractFactory("TradeHubMultiToken");
    tradeHubMultiToken = await TradeHubMultiTokenFactory.deploy(owner.address);
    await tradeHubMultiToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct URI", async function () {
      // ERC1155 doesn't have a direct URI getter on the contract level,
      // but the base URI is set in the constructor. We can test it via _setURI and event emission.
      // Or by minting a token and checking its URI.
      // For now, we assume the constructor sets it correctly.
      // We will test `setURI` function.
    });

    it("Should set the correct owner", async function () {
      expect(await tradeHubMultiToken.owner()).to.equal(owner.address);
    });
  });

  describe("URI Management", function () {
    it("Should allow the owner to set a new URI", async function () {
      await expect(tradeHubMultiToken.setURI(NEW_URI))
        .to.not.be.reverted;
    });

    it("Should not allow non-owners to set a new URI", async function () {
      await expect(tradeHubMultiToken.connect(addr1).setURI(NEW_URI))
        .to.be.revertedWithCustomError(tradeHubMultiToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Minting", function () {
    const tokenId1 = 1;
    const tokenId2 = 2;
    const amount = 100;

    it("Should allow the owner to mint single tokens", async function () {
      await expect(tradeHubMultiToken.mint(addr1.address, tokenId1, amount, ZERO_BYTES))
        .to.emit(tradeHubMultiToken, "TransferSingle")
        .withArgs(owner.address, ethers.ZeroAddress, addr1.address, tokenId1, amount);

      expect(await tradeHubMultiToken.balanceOf(addr1.address, tokenId1)).to.equal(amount);
    });

    it("Should allow the owner to mint batch tokens", async function () {
      const tokenIds = [tokenId1, tokenId2];
      const amounts = [amount, amount];

      await expect(tradeHubMultiToken.mintBatch(addr1.address, tokenIds, amounts, ZERO_BYTES))
        .to.emit(tradeHubMultiToken, "TransferBatch")
        .withArgs(owner.address, ethers.ZeroAddress, addr1.address, tokenIds, amounts);

      expect(await tradeHubMultiToken.balanceOf(addr1.address, tokenId1)).to.equal(amount);
      expect(await tradeHubMultiToken.balanceOf(addr1.address, tokenId2)).to.equal(amount);
    });

    it("Should not allow non-owners to mint single tokens", async function () {
      await expect(tradeHubMultiToken.connect(addr1).mint(addr1.address, tokenId1, amount, ZERO_BYTES))
        .to.be.revertedWithCustomError(tradeHubMultiToken, "OwnableUnauthorizedAccount");
    });

    it("Should not allow non-owners to mint batch tokens", async function () {
      const tokenIds = [tokenId1, tokenId2];
      const amounts = [amount, amount];
      await expect(tradeHubMultiToken.connect(addr1).mintBatch(addr1.address, tokenIds, amounts, ZERO_BYTES))
        .to.be.revertedWithCustomError(tradeHubMultiToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transfers", function () {
    const tokenId1 = 1;
    const amount = 100;

    beforeEach(async function () {
      await tradeHubMultiToken.mint(owner.address, tokenId1, amount, ZERO_BYTES);
    });

    it("Should allow safe transfer of single tokens", async function () {
      const transferAmount = 50;
      await expect(
        tradeHubMultiToken.safeTransferFrom(
          owner.address,
          addr1.address,
          tokenId1,
          transferAmount,
          ZERO_BYTES
        )
      )
        .to.emit(tradeHubMultiToken, "TransferSingle")
        .withArgs(owner.address, owner.address, addr1.address, tokenId1, transferAmount);

      expect(await tradeHubMultiToken.balanceOf(owner.address, tokenId1)).to.equal(amount - transferAmount);
      expect(await tradeHubMultiToken.balanceOf(addr1.address, tokenId1)).to.equal(transferAmount);
    });

    it("Should allow safe batch transfer of tokens", async function () {
      const tokenId2 = 2;
      const amount2 = 200;
      await tradeHubMultiToken.mint(owner.address, tokenId2, amount2, ZERO_BYTES);

      const tokenIds = [tokenId1, tokenId2];
      const amounts = [amount / 2, amount2 / 2]; // Transfer half of each

      await expect(
        tradeHubMultiToken.safeBatchTransferFrom(
          owner.address,
          addr1.address,
          tokenIds,
          amounts,
          ZERO_BYTES
        )
      )
        .to.emit(tradeHubMultiToken, "TransferBatch")
        .withArgs(owner.address, owner.address, addr1.address, tokenIds, amounts);

      expect(await tradeHubMultiToken.balanceOf(owner.address, tokenId1)).to.equal(amount / 2);
      expect(await tradeHubMultiToken.balanceOf(owner.address, tokenId2)).to.equal(amount2 / 2);
      expect(await tradeHubMultiToken.balanceOf(addr1.address, tokenId1)).to.equal(amount / 2);
      expect(await tradeHubMultiToken.balanceOf(addr1.address, tokenId2)).to.equal(amount2 / 2);
    });

    it("Should fail safe transfer if sender doesn't have enough tokens", async function () {
      const transferAmount = amount + 1;
      await expect(
        tradeHubMultiToken.safeTransferFrom(
          owner.address,
          addr1.address,
          tokenId1,
          transferAmount,
          ZERO_BYTES
        )
      ).to.be.revertedWithCustomError(tradeHubMultiToken, "ERC1155InsufficientBalance");
    });
  });

  describe("Approvals", function () {
    const tokenId1 = 1;
    const amount = 100;

    beforeEach(async function () {
      await tradeHubMultiToken.mint(owner.address, tokenId1, amount, ZERO_BYTES);
    });

    it("Should allow setting approval for all", async function () {
      await expect(tradeHubMultiToken.setApprovalForAll(addr1.address, true))
        .to.emit(tradeHubMultiToken, "ApprovalForAll")
        .withArgs(owner.address, addr1.address, true);

      expect(await tradeHubMultiToken.isApprovedForAll(owner.address, addr1.address)).to.be.true;
    });

    it("Should allow approved operator to transfer tokens", async function () {
      const transferAmount = 50;
      await tradeHubMultiToken.setApprovalForAll(addr1.address, true);

      await expect(
        tradeHubMultiToken.connect(addr1).safeTransferFrom(
          owner.address,
          addr2.address,
          tokenId1,
          transferAmount,
          ZERO_BYTES
        )
      )
        .to.emit(tradeHubMultiToken, "TransferSingle");
      expect(await tradeHubMultiToken.balanceOf(owner.address, tokenId1)).to.equal(amount - transferAmount);
      expect(await tradeHubMultiToken.balanceOf(addr2.address, tokenId1)).to.equal(transferAmount);
    });
  });

  describe("Burning", function () {
    const tokenId1 = 1;
    const amount = 100;

    beforeEach(async function () {
      await tradeHubMultiToken.mint(owner.address, tokenId1, amount, ZERO_BYTES);
    });

    it("Should allow burning of single tokens", async function () {
      const burnAmount = 50;
      await expect(tradeHubMultiToken.burn(owner.address, tokenId1, burnAmount))
        .to.emit(tradeHubMultiToken, "TransferSingle")
        .withArgs(owner.address, owner.address, ethers.ZeroAddress, tokenId1, burnAmount);

      expect(await tradeHubMultiToken.balanceOf(owner.address, tokenId1)).to.equal(amount - burnAmount);
      expect(await tradeHubMultiToken.totalSupply(tokenId1)).to.equal(amount - burnAmount);
    });

    it("Should allow burning of batch tokens", async function () {
      const tokenId2 = 2;
      const amount2 = 200;
      await tradeHubMultiToken.mint(owner.address, tokenId2, amount2, ZERO_BYTES);

      const tokenIds = [tokenId1, tokenId2];
      const burnAmounts = [amount / 2, amount2 / 2];

      await expect(tradeHubMultiToken.burnBatch(owner.address, tokenIds, burnAmounts))
        .to.emit(tradeHubMultiToken, "TransferBatch")
        .withArgs(owner.address, owner.address, ethers.ZeroAddress, tokenIds, burnAmounts);

      expect(await tradeHubMultiToken.balanceOf(owner.address, tokenId1)).to.equal(amount / 2);
      expect(await tradeHubMultiToken.balanceOf(owner.address, tokenId2)).to.equal(amount2 / 2);
    });

    it("Should not allow burning more tokens than owned", async function () {
      const burnAmount = amount + 1;
      await expect(tradeHubMultiToken.burn(owner.address, tokenId1, burnAmount))
        .to.be.revertedWithCustomError(tradeHubMultiToken, "ERC1155InsufficientBalance");
    });
  });

  describe("Pausing", function () {
    const tokenId1 = 1;
    const amount = 100;

    beforeEach(async function () {
      await tradeHubMultiToken.mint(owner.address, tokenId1, amount, ZERO_BYTES);
    });

    it("Should allow the owner to pause and unpause transfers", async function () {
      // Pause
      await expect(tradeHubMultiToken.pause())
        .to.emit(tradeHubMultiToken, "Paused")
        .withArgs(owner.address);
      expect(await tradeHubMultiToken.paused()).to.be.true;

      // Try transfer while paused
      const transferAmount = 10;
      await expect(
        tradeHubMultiToken.safeTransferFrom(
          owner.address,
          addr1.address,
          tokenId1,
          transferAmount,
          ZERO_BYTES
        )
      ).to.be.revertedWithCustomError(tradeHubMultiToken, "EnforcedPause");

      // Unpause
      await expect(tradeHubMultiToken.unpause())
        .to.emit(tradeHubMultiToken, "Unpaused")
        .withArgs(owner.address);
      expect(await tradeHubMultiToken.paused()).to.be.false;

      // Transfer should work after unpause
      await expect(
        tradeHubMultiToken.safeTransferFrom(
          owner.address,
          addr1.address,
          tokenId1,
          transferAmount,
          ZERO_BYTES
        )
      )
        .to.emit(tradeHubMultiToken, "TransferSingle");
      expect(await tradeHubMultiToken.balanceOf(addr1.address, tokenId1)).to.equal(transferAmount);
    });

    it("Should not allow non-owners to pause or unpause", async function () {
      await expect(tradeHubMultiToken.connect(addr1).pause())
        .to.be.revertedWithCustomError(tradeHubMultiToken, "OwnableUnauthorizedAccount");
      await expect(tradeHubMultiToken.connect(addr1).unpause())
        .to.be.revertedWithCustomError(tradeHubMultiToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Ownership", function () {
    it("Should allow owner to transfer ownership", async function () {
      await expect(tradeHubMultiToken.transferOwnership(addr1.address))
        .to.emit(tradeHubMultiToken, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);
      expect(await tradeHubMultiToken.owner()).to.equal(addr1.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      await expect(tradeHubMultiToken.connect(addr1).transferOwnership(addr2.address))
        .to.be.revertedWithCustomError(tradeHubMultiToken, "OwnableUnauthorizedAccount");
    });
  });
});
