// wagmiConfig.ts
import { createConfig } from "@privy-io/wagmi";
import { base, baseSepolia } from "viem/chains";
import { http } from "wagmi";

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia], // or whatever chains you support
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
