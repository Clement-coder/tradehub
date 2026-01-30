#!/bin/bash

# Deploy all TradeHub contracts to Base Sepolia testnet

echo "🚀 Deploying TradeHub contracts to Base Sepolia..."

# Deploy TradeHubToken
echo "📄 Deploying TradeHubToken..."
npx hardhat ignition deploy --network baseSepolia ignition/modules/TradeHubToken.ts

# Deploy TradeHubNFT
echo "🖼️ Deploying TradeHubNFT..."
npx hardhat ignition deploy --network baseSepolia ignition/modules/TradeHubNFT.ts

# Deploy TradeHubMultiToken
echo "🎨 Deploying TradeHubMultiToken..."
npx hardhat ignition deploy --network baseSepolia ignition/modules/TradeHubMultiToken.ts

# Deploy SocialRegistry
echo "👥 Deploying SocialRegistry..."
npx hardhat ignition deploy --network baseSepolia ignition/modules/SocialRegistry.ts

# Deploy TradeHubFactory
echo "🏭 Deploying TradeHubFactory..."
npx hardhat ignition deploy --network baseSepolia ignition/modules/TradeHubFactory.ts

echo "✅ All contracts deployed to Base Sepolia!"
