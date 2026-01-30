// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TradeHubToken.sol";
import "./TradeHubNFT.sol";
import "./TradeHubMultiToken.sol";
import "./SocialRegistry.sol";
import "./lib/Events.sol";

contract TradeHubFactory {
    address public owner;
    
    struct DeployedContracts {
        address token;
        address nft;
        address multiToken;
        address socialRegistry;
    }
    
    mapping(address => DeployedContracts) public deployments;
    address[] public deployers;
    
    event ContractsDeployed(
        address indexed deployer,
        address token,
        address nft,
        address multiToken,
        address socialRegistry
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    function deployAll() external returns (DeployedContracts memory) {
        TradeHubToken token = new TradeHubToken(msg.sender);
        TradeHubNFT nft = new TradeHubNFT(msg.sender);
        TradeHubMultiToken multiToken = new TradeHubMultiToken(msg.sender);
        SocialRegistry socialRegistry = new SocialRegistry(msg.sender);
        
        DeployedContracts memory contracts = DeployedContracts({
            token: address(token),
            nft: address(nft),
            multiToken: address(multiToken),
            socialRegistry: address(socialRegistry)
        });
        
        deployments[msg.sender] = contracts;
        deployers.push(msg.sender);
        
        emit ContractsDeployed(
            msg.sender,
            address(token),
            address(nft),
            address(multiToken),
            address(socialRegistry)
        );
        
        return contracts;
    }
    
    function getDeployment(address deployer) external view returns (DeployedContracts memory) {
        return deployments[deployer];
    }
    
    function getDeployersCount() external view returns (uint256) {
        return deployers.length;
    }
}
