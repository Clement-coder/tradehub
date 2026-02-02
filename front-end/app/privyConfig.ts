// privyConfig.ts
import type { PrivyClientConfig } from "@privy-io/react-auth";

export const privyConfig: PrivyClientConfig = {
  loginMethods: ["google", "email"],

  embeddedWallets: {
    ethereum: {
      // Automatically create EVM wallets when users first log in
      createOnLogin: "users-without-wallets",
    },
    showWalletUIs: true, // show built-in wallet UI modals
  },

  appearance: {
    showWalletLoginFirst: true,

    // ✅ Add your logo here (public URL or /public path)
    logo: "/tradeHub_logo.PNG",
  },
};
