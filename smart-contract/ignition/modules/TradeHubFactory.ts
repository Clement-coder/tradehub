import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TradeHubFactoryModule = buildModule("TradeHubFactoryModule", (m) => {
  const factory = m.contract("TradeHubFactory");
  return { factory };
});

export default TradeHubFactoryModule;
