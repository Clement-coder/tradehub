import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const TradeHubMultiToken = await ethers.getContractFactory("TradeHubMultiToken");
  const tradeHubMultiToken = await TradeHubMultiToken.deploy(deployer.address);

  await tradeHubMultiToken.waitForDeployment();

  const address = await tradeHubMultiToken.getAddress()

  console.log("TradeHubMultiToken deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
