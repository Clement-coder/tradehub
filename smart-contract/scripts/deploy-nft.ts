import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const TradeHubNFT = await ethers.getContractFactory("TradeHubNFT");
  const tradeHubNFT = await TradeHubNFT.deploy(deployer.address);

  await tradeHubNFT.waitForDeployment();

  const address = await tradeHubNFT.getAddress()

  console.log("TradeHubNFT deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
