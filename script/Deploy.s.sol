// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/SwellScopeVault.sol";
import "../src/RiskOracle.sol";
import "../src/SwellChainIntegration.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SwellScope Deployment Script
 * @dev Deploys all SwellScope contracts to Swellchain
 * @dev Run with: forge script script/Deploy.s.sol --rpc-url $SWELLCHAIN_RPC_URL --broadcast
 */
contract DeployScript is Script {
    // Deployment configuration
    struct DeploymentConfig {
        address deployer;
        address swETH;
        address rswETH;
        address standardBridge;
        address machAVS;
        address vitalAVS;
        address squadAVS;
        bool isTestnet;
    }

    // Contract instances
    SwellScopeVault public swellScopeVault;
    RiskOracle public riskOracle;
    SwellChainIntegration public swellChainIntegration;

    // Known contract addresses on Swellchain
    address constant SWELLCHAIN_SWETH = 0x0000000000000000000000000000000000000000; // To be updated
    address constant SWELLCHAIN_RSWETH = 0x0000000000000000000000000000000000000000; // To be updated
    address constant SWELLCHAIN_BRIDGE = 0x0000000000000000000000000000000000000000; // To be updated
    
    // AVS contract addresses (to be updated with actual addresses)
    address constant MACH_AVS = 0x0000000000000000000000000000000000000000;
    address constant VITAL_AVS = 0x0000000000000000000000000000000000000000;
    address constant SQUAD_AVS = 0x0000000000000000000000000000000000000000;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying SwellScope contracts...");
        console.log("Deployer address:", deployer);
        console.log("Chain ID:", block.chainid);
        
        // Determine if this is testnet or mainnet
        bool isTestnet = block.chainid == 1924; // Swellchain testnet
        
        DeploymentConfig memory config = DeploymentConfig({
            deployer: deployer,
            swETH: isTestnet ? vm.envAddress("TESTNET_SWETH_ADDRESS") : SWELLCHAIN_SWETH,
            rswETH: isTestnet ? vm.envAddress("TESTNET_RSWETH_ADDRESS") : SWELLCHAIN_RSWETH,
            standardBridge: isTestnet ? vm.envAddress("TESTNET_BRIDGE_ADDRESS") : SWELLCHAIN_BRIDGE,
            machAVS: MACH_AVS,
            vitalAVS: VITAL_AVS,
            squadAVS: SQUAD_AVS,
            isTestnet: isTestnet
        });

        vm.startBroadcast(deployerPrivateKey);

        // Deploy contracts in correct order
        deployRiskOracle(config);
        deploySwellChainIntegration(config);
        deploySwellScopeVault(config);
        
        // Initialize contracts
        initializeContracts(config);

        vm.stopBroadcast();

        // Log deployment addresses
        logDeploymentInfo(config);
        
        // Verify contracts if not on testnet
        if (!isTestnet) {
            verifyContracts(config);
        }
    }

    function deployRiskOracle(DeploymentConfig memory config) internal {
        console.log("\n=== Deploying RiskOracle ===");
        
        riskOracle = new RiskOracle(
            config.deployer, // admin
            config.deployer  // oracle updater
        );
        
        console.log("RiskOracle deployed at:", address(riskOracle));
    }

    function deploySwellChainIntegration(DeploymentConfig memory config) internal {
        console.log("\n=== Deploying SwellChainIntegration ===");
        
        swellChainIntegration = new SwellChainIntegration(
            config.deployer,     // admin
            config.swETH,        // swETH token
            config.rswETH,       // rswETH token
            config.standardBridge, // bridge contract
            config.machAVS,      // MACH AVS
            config.vitalAVS,     // VITAL AVS
            config.squadAVS      // SQUAD AVS
        );
        
        console.log("SwellChainIntegration deployed at:", address(swellChainIntegration));
    }

    function deploySwellScopeVault(DeploymentConfig memory config) internal {
        console.log("\n=== Deploying SwellScopeVault ===");
        
        // Use swETH as the underlying asset for the vault
        IERC20 asset = IERC20(config.swETH);
        
        swellScopeVault = new SwellScopeVault(
            asset,
            "SwellScope Restaking Vault",
            "ssVault",
            address(riskOracle),
            address(swellChainIntegration)
        );
        
        console.log("SwellScopeVault deployed at:", address(swellScopeVault));
    }

    function initializeContracts(DeploymentConfig memory config) internal {
        console.log("\n=== Initializing Contracts ===");
        
        // Grant necessary roles
        bytes32 ORACLE_ROLE = riskOracle.ORACLE_ROLE();
        bytes32 STRATEGIST_ROLE = swellScopeVault.STRATEGIST_ROLE();
        bytes32 RISK_MANAGER_ROLE = swellScopeVault.RISK_MANAGER_ROLE();
        
        // Grant oracle role to SwellChainIntegration for risk updates
        riskOracle.grantRole(ORACLE_ROLE, address(swellChainIntegration));
        
        // Set up initial risk thresholds
        riskOracle.setRiskThreshold(config.swETH, 75); // 75% risk threshold for swETH
        riskOracle.setRiskThreshold(config.rswETH, 80); // 80% risk threshold for rswETH
        
        // Initialize AVS metrics in SwellChainIntegration
        if (config.machAVS != address(0)) {
            swellChainIntegration.initializeAVS(
                config.machAVS,
                "MACH",
                100, // Initial performance score
                0    // Initial slashing events
            );
        }
        
        if (config.vitalAVS != address(0)) {
            swellChainIntegration.initializeAVS(
                config.vitalAVS,
                "VITAL",
                100, // Initial performance score
                0    // Initial slashing events
            );
        }
        
        if (config.squadAVS != address(0)) {
            swellChainIntegration.initializeAVS(
                config.squadAVS,
                "SQUAD",
                100, // Initial performance score
                0    // Initial slashing events
            );
        }
        
        console.log("Contracts initialized successfully");
    }

    function logDeploymentInfo(DeploymentConfig memory config) internal view {
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("Network:", config.isTestnet ? "Swellchain Testnet" : "Swellchain Mainnet");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", config.deployer);
        console.log("");
        console.log("Contract Addresses:");
        console.log("RiskOracle:", address(riskOracle));
        console.log("SwellChainIntegration:", address(swellChainIntegration));
        console.log("SwellScopeVault:", address(swellScopeVault));
        console.log("");
        console.log("Configuration:");
        console.log("swETH Token:", config.swETH);
        console.log("rswETH Token:", config.rswETH);
        console.log("Standard Bridge:", config.standardBridge);
        console.log("MACH AVS:", config.machAVS);
        console.log("VITAL AVS:", config.vitalAVS);
        console.log("SQUAD AVS:", config.squadAVS);
        
        // Save deployment info to file
        string memory deploymentInfo = string(abi.encodePacked(
            "# SwellScope Deployment Information\n\n",
            "Network: ", config.isTestnet ? "Swellchain Testnet" : "Swellchain Mainnet", "\n",
            "Chain ID: ", vm.toString(block.chainid), "\n",
            "Block Number: ", vm.toString(block.number), "\n",
            "Timestamp: ", vm.toString(block.timestamp), "\n\n",
            "## Contract Addresses\n\n",
            "RiskOracle: ", vm.toString(address(riskOracle)), "\n",
            "SwellChainIntegration: ", vm.toString(address(swellChainIntegration)), "\n",
            "SwellScopeVault: ", vm.toString(address(swellScopeVault)), "\n\n",
            "## Configuration\n\n",
            "swETH Token: ", vm.toString(config.swETH), "\n",
            "rswETH Token: ", vm.toString(config.rswETH), "\n",
            "Standard Bridge: ", vm.toString(config.standardBridge), "\n",
            "MACH AVS: ", vm.toString(config.machAVS), "\n",
            "VITAL AVS: ", vm.toString(config.vitalAVS), "\n",
            "SQUAD AVS: ", vm.toString(config.squadAVS), "\n"
        ));
        
        vm.writeFile("deployment-info.md", deploymentInfo);
        console.log("Deployment info saved to deployment-info.md");
    }

    function verifyContracts(DeploymentConfig memory config) internal {
        console.log("\n=== Contract Verification Commands ===");
        console.log("Run these commands to verify contracts on block explorer:");
        console.log("");
        
        console.log("forge verify-contract", address(riskOracle), "src/RiskOracle.sol:RiskOracle");
        console.log("  --chain-id", block.chainid);
        console.log("  --constructor-args", abi.encode(config.deployer, config.deployer));
        console.log("");
        
        console.log("forge verify-contract", address(swellChainIntegration), "src/SwellChainIntegration.sol:SwellChainIntegration");
        console.log("  --chain-id", block.chainid);
        console.log("  --constructor-args", abi.encode(
            config.deployer, config.swETH, config.rswETH, config.standardBridge,
            config.machAVS, config.vitalAVS, config.squadAVS
        ));
        console.log("");
        
        console.log("forge verify-contract", address(swellScopeVault), "src/SwellScopeVault.sol:SwellScopeVault");
        console.log("  --chain-id", block.chainid);
        console.log("  --constructor-args", abi.encode(
            config.swETH, "SwellScope Restaking Vault", "ssVault",
            address(riskOracle), address(swellChainIntegration)
        ));
    }
} 