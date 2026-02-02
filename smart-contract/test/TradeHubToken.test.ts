import { expect } from "chai";
import hre from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { TradeHubToken } from "../typechain-types";

describe("TradeHubToken", function () {
  let tradeHubToken: TradeHubToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  // Deploy the contract before each test
  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await hre.ethers.getSigners();
    const TradeHubTokenFactory = await hre.ethers.getContractFactory("TradeHubToken");
    tradeHubToken = await TradeHubTokenFactory.deploy(owner.address);
    await tradeHubToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await tradeHubToken.name()).to.equal("TradeHub Token");
      expect(await tradeHubToken.symbol()).to.equal("THT");
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      // Our token starts with 0 supply and tokens are minted later.
      expect(await tradeHubToken.totalSupply()).to.equal(0);
      expect(await tradeHubToken.balanceOf(owner.address)).to.equal(0);
    });

    it("Should set the correct owner", async function () {
      expect(await tradeHubToken.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow the owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 18); // 1000 tokens
      await expect(tradeHubToken.mint(addr1.address, mintAmount))
        .to.emit(tradeHubToken, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, mintAmount);

      expect(await tradeHubToken.totalSupply()).to.equal(mintAmount);
      expect(await tradeHubToken.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-owners to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 18);
      await expect(tradeHubToken.connect(addr1).mint(addr1.address, mintAmount))
        .to.be.revertedWithCustomError(tradeHubToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      // Mint some tokens to the owner for testing transfers
      const initialMint = ethers.parseUnits("10000", 18);
      await tradeHubToken.mint(owner.address, initialMint);
    });

    it("Should allow token transfers", async function () {
      const transferAmount = ethers.parseUnits("100", 18);
      await expect(tradeHubToken.transfer(addr1.address, transferAmount))
        .to.emit(tradeHubToken, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);

      expect(await tradeHubToken.balanceOf(owner.address)).to.equal(
        ethers.parseUnits("9900", 18)
      );
      expect(await tradeHubToken.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const transferAmount = ethers.parseUnits("10001", 18); // More than owner's balance
      await expect(tradeHubToken.transfer(addr1.address, transferAmount))
        .to.be.revertedWithCustomError(tradeHubToken, "ERC20InsufficientBalance");
    });

    it("Should fail if transferring to the zero address", async function () {
      const transferAmount = ethers.parseUnits("10", 18);
      await expect(tradeHubToken.transfer(ethers.ZeroAddress, transferAmount))
        .to.be.revertedWithCustomError(tradeHubToken, "ERC20InvalidReceiver");
    });
  });

  describe("Approvals and transferFrom", function () {
    beforeEach(async function () {
      // Mint some tokens to the owner for testing approvals
      const initialMint = ethers.parseUnits("10000", 18);
      await tradeHubToken.mint(owner.address, initialMint);
    });

    it("Should allow approval of tokens", async function () {
      const approveAmount = ethers.parseUnits("500", 18);
      await expect(tradeHubToken.approve(addr1.address, approveAmount))
        .to.emit(tradeHubToken, "Approval")
        .withArgs(owner.address, addr1.address, approveAmount);

      expect(await tradeHubToken.allowance(owner.address, addr1.address)).to.equal(
        approveAmount
      );
    });

    it("Should allow transferFrom after approval", async function () {
      const approveAmount = ethers.parseUnits("500", 18);
      const transferAmount = ethers.parseUnits("100", 18);

      await tradeHubToken.approve(addr1.address, approveAmount);
      await expect(
        tradeHubToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
      )
        .to.emit(tradeHubToken, "Transfer")
        .withArgs(owner.address, addr2.address, transferAmount);

      expect(await tradeHubToken.balanceOf(owner.address)).to.equal(
        ethers.parseUnits("9900", 18)
      );
      expect(await tradeHubToken.balanceOf(addr2.address)).to.equal(transferAmount);
      expect(await tradeHubToken.allowance(owner.address, addr1.address)).to.equal(
        ethers.parseUnits("400", 18)
      );
    });

    it("Should fail transferFrom if not enough allowance", async function () {
      const approveAmount = ethers.parseUnits("50", 18);
      const transferAmount = ethers.parseUnits("100", 18);

      await tradeHubToken.approve(addr1.address, approveAmount);
      await expect(
        tradeHubToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
      )
        .to.be.revertedWithCustomError(tradeHubToken, "ERC20InsufficientAllowance");
    });

    it("Should fail transferFrom if sender has insufficient balance", async function () {
      const approveAmount = ethers.parseUnits("5000", 18);
      const transferAmount = ethers.parseUnits("10001", 18); // More than owner's balance

      await tradeHubToken.approve(addr1.address, approveAmount);
      await expect(
        tradeHubToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
      )
        .to.be.revertedWithCustomError(tradeHubToken, "ERC20InsufficientBalance");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      const initialMint = ethers.parseUnits("1000", 18);
      await tradeHubToken.mint(owner.address, initialMint);
    });

    it("Should allow burning of tokens by the token holder", async function () {
      const burnAmount = ethers.parseUnits("100", 18);
      await expect(tradeHubToken.burn(burnAmount))
        .to.emit(tradeHubToken, "Transfer")
        .withArgs(owner.address, ethers.ZeroAddress, burnAmount);

      expect(await tradeHubToken.totalSupply()).to.equal(ethers.parseUnits("900", 18));
      expect(await tradeHubToken.balanceOf(owner.address)).to.equal(
        ethers.parseUnits("900", 18)
      );
    });

    it("Should not allow burning more tokens than owned", async function () {
      const burnAmount = ethers.parseUnits("1001", 18);
      await expect(tradeHubToken.burn(burnAmount))
        .to.be.revertedWithCustomError(tradeHubToken, "ERC20InsufficientBalance");
    });
  });

  describe("Pausing", function () {
    beforeEach(async function () {
      const initialMint = ethers.parseUnits("1000", 18);
      await tradeHubToken.mint(owner.address, initialMint);
    });

    it("Should allow the owner to pause and unpause transfers", async function () {
      // Pause
      await expect(tradeHubToken.pause())
        .to.emit(tradeHubToken, "Paused")
        .withArgs(owner.address);
      expect(await tradeHubToken.paused()).to.be.true;

      // Try transfer while paused
      const transferAmount = ethers.parseUnits("10", 18);
      await expect(tradeHubToken.transfer(addr1.address, transferAmount))
        .to.be.revertedWithCustomError(tradeHubToken, "EnforcedPause");

      // Unpause
      await expect(tradeHubToken.unpause())
        .to.emit(tradeHubToken, "Unpaused")
        .withArgs(owner.address);
      expect(await tradeHubToken.paused()).to.be.false;

      // Transfer should work after unpause
      await expect(tradeHubToken.transfer(addr1.address, transferAmount))
        .to.emit(tradeHubToken, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);
      expect(await tradeHubToken.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should not allow non-owners to pause or unpause", async function () {
      await expect(tradeHubToken.connect(addr1).pause())
        .to.be.revertedWithCustomError(tradeHubToken, "OwnableUnauthorizedAccount");
      await expect(tradeHubToken.connect(addr1).unpause())
        .to.be.revertedWithCustomError(tradeHubToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Ownership", function () {
    it("Should allow owner to transfer ownership", async function () {
      await expect(tradeHubToken.transferOwnership(addr1.address))
        .to.emit(tradeHubToken, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);
      expect(await tradeHubToken.owner()).to.equal(addr1.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      await expect(tradeHubToken.connect(addr1).transferOwnership(addr2.address))
        .to.be.revertedWithCustomError(tradeHubToken, "OwnableUnauthorizedAccount");
    });
  });
});
