import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SocialRegistryModule = buildModule("SocialRegistryModule", (m) => {
  const initialOwner = m.getParameter("initialOwner", m.getAccount(0));
  const socialRegistry = m.contract("SocialRegistry", [initialOwner]);
  return { socialRegistry };
});

export default SocialRegistryModule;
