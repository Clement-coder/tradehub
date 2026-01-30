import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TradeHubNFTModule = buildModule("TradeHubNFTModule", (m) => {
  const initialOwner = m.getParameter("initialOwner", m.getAccount(0));
  const nft = m.contract("TradeHubNFT", [initialOwner]);
  return { nft };
});

export default TradeHubNFTModule;
