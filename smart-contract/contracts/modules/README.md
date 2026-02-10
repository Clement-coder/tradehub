# TradeHub Smart Contract Modules

## Overview
Modular smart contract architecture for the TradeHub platform with 10 specialized modules.

## Modules

### 1. AccessControl
Role-based permission system with ADMIN, MINTER, BURNER, and PAUSER roles.

### 2. Treasury
Platform fee collection and management with configurable fee rates (max 10%).

### 3. Marketplace
NFT listing and trading with instant buy functionality.

### 4. Staking
Token staking with reward distribution based on time and stake amount.

### 5. Governance
Proposal creation and voting system using governance tokens.

### 6. RoyaltyManager
ERC2981 compliant royalty management for NFTs with per-token and default settings.

### 7. Auction
Time-based auction system for NFTs with automatic bid management.

### 8. Escrow
Secure transaction escrow with dispute resolution mechanism.

### 9. Whitelist
Address whitelisting with Merkle proof verification for gas-efficient allowlists.

### 10. VestingSchedule
Token vesting with cliff periods and linear release schedules.

## Architecture
Each module is independent and can be integrated into the main contracts as needed.

## Usage
Import modules into your contracts:
```solidity
import "./modules/Treasury.sol";
import "./modules/Marketplace.sol";
```

## Security
- ReentrancyGuard on all fund transfers
- Access control on privileged functions
- Input validation on all parameters
