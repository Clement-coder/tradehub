import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const TradeHubToken = await ethers.getContractFactory("TradeHubToken");
  const tradeHubToken = await TradeHubToken.deploy(deployer.address);

  await tradeHubToken.waitForDeployment();

  const address = await tradeHubToken.getAddress()

  console.log("TradeHubToken deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
