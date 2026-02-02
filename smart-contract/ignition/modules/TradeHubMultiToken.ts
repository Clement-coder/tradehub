import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TradeHubMultiTokenModule = buildModule("TradeHubMultiTokenModule", (m) => {
  const initialOwner = m.getParameter("initialOwner", m.getAccount(0));
  const multiToken = m.contract("TradeHubMultiToken", [initialOwner]);
  return { multiToken };
});

export default TradeHubMultiTokenModule;
