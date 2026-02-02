import { expect } from "chai";
import hre from "hardhat";

describe("SocialRegistry Simple", function () {
  it("Should deploy successfully", async function () {
    const [owner] = await hre.ethers.getSigners();
    const SocialRegistryFactory = await hre.ethers.getContractFactory("SocialRegistry");
    const socialRegistry = await SocialRegistryFactory.deploy(owner.address);
    await socialRegistry.waitForDeployment();
    
    expect(await socialRegistry.totalUsers()).to.equal(0);
    expect(await socialRegistry.totalPosts()).to.equal(0);
  });
});
