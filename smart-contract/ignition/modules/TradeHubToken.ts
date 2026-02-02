import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TradeHubTokenModule = buildModule("TradeHubTokenModule", (m) => {
  const initialOwner = m.getParameter("initialOwner", m.getAccount(0));
  const token = m.contract("TradeHubToken", [initialOwner]);
  return { token };
});

export default TradeHubTokenModule;
