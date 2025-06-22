// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/RiskOracle.sol";
import "../src/SwellChainIntegration.sol";
import "../src/SwellScopeVault.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Deploy
 * @dev Production deployment script for SwellScope contracts on Swellchain
 * @dev Uses real contract addresses and proper initialization
 */
contract Deploy is Script {
    
    struct DeploymentConfig {
        address deployer;
        address swETH;
        address rswETH;
        address standardBridge;
        address machServiceManager;
        address nucleusBoringVault;
        address nucleusManager;
        bool isTestnet;
    }
    
    // Deployed contract instances
    RiskOracle public riskOracle;
    SwellChainIntegration public swellChainIntegration;
    SwellScopeVault public swellScopeVault;
    
    // Real Swellchain addresses (from official documentation)
    address constant SWELLCHAIN_SWETH = 0xf951E335afb289353dc249e82926178EaC7DEd78; // swETH on Swellchain
    address constant SWELLCHAIN_RSWETH = 0x0000000000000000000000000000000000000000; // rswETH (may not exist yet)
    
    // Standard L2 bridge address (common across all OP Stack chains)
    address constant SWELLCHAIN_L2_BRIDGE = 0x4200000000000000000000000000000000000010; // Standard L2 Bridge
    
    // Real MACH AVS Service Manager on Ethereum (operators would bridge/interact cross-chain)
    address constant MACH_SERVICE_MANAGER = 0x289Dbe6573D6a1dAF00110b5B1b2D8F0a34099C2;
    
    // Real Nucleus contracts on Swellchain
    address constant NUCLEUS_BORING_VAULT = 0x9Ed15383940CC380fAEF0a75edacE507cC775f22;
    address constant NUCLEUS_MANAGER = 0x69FC700226E9e12D8c5E46a4b50A78efB64F50C0;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying SwellScope contracts to Swellchain...");
        console.log("Deployer address:", deployer);
        console.log("Chain ID:", block.chainid);
        
        // Determine if this is testnet or mainnet
        bool isTestnet = block.chainid == 1924; // Swellchain testnet
        
        // Validate we're on Swellchain
        require(
            block.chainid == 1923 || block.chainid == 1924, 
            "This script only works on Swellchain (1923) or Swellchain Testnet (1924)"
        );
        
        DeploymentConfig memory config = DeploymentConfig({
            deployer: deployer,
            swETH: isTestnet ? vm.envAddress("TESTNET_SWETH_ADDRESS") : SWELLCHAIN_SWETH,
            rswETH: isTestnet ? vm.envAddress("TESTNET_RSWETH_ADDRESS") : SWELLCHAIN_RSWETH,
            standardBridge: SWELLCHAIN_L2_BRIDGE,
            machServiceManager: MACH_SERVICE_MANAGER,
            nucleusBoringVault: NUCLEUS_BORING_VAULT,
            nucleusManager: NUCLEUS_MANAGER,
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
            config.deployer,           // admin
            config.swETH,              // swETH token
            config.rswETH,             // rswETH token
            config.standardBridge,     // bridge contract
            config.machServiceManager, // MACH AVS Service Manager (cross-chain reference)
            config.nucleusBoringVault, // Nucleus Boring Vault
            config.nucleusManager      // Nucleus Manager
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
        
        // Set up initial risk thresholds based on real risk analysis
        riskOracle.setRiskThreshold(config.swETH, 75); // 75% risk threshold for swETH
        riskOracle.setRiskThreshold(config.rswETH, 80); // 80% risk threshold for rswETH
        
        // Initialize MACH AVS integration (cross-chain reference)
        if (config.machServiceManager != address(0)) {
            swellChainIntegration.initializeAVS(
                config.machServiceManager,
                "MACH",
                100, // Initial performance score
                0    // Initial slashing events
            );
        }
        
        // Initialize Nucleus integration (on-chain)
        if (config.nucleusBoringVault != address(0)) {
            swellChainIntegration.initializeProtocol(
                config.nucleusBoringVault,
                "Nucleus earnETH",
                true // Is active
            );
        }
        
        console.log("Contracts initialized successfully");
    }

    function logDeploymentInfo(DeploymentConfig memory config) internal {
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
        console.log("MACH Service Manager (Ethereum):", config.machServiceManager);
        console.log("Nucleus Boring Vault:", config.nucleusBoringVault);
        console.log("Nucleus Manager:", config.nucleusManager);
        
        // Save deployment info to file (commented out for simulation compatibility)
        // vm.writeFile("deployment-info.md", deploymentInfo);
    }

    function verifyContracts(DeploymentConfig memory config) internal {
        console.log("\n=== Contract Verification Commands ===");
        console.log("Run these commands to verify contracts on Swellchain block explorer:");
        console.log("");
        
        console.log("forge verify-contract");
        console.log(string(abi.encodePacked("  ", vm.toString(address(riskOracle)))));
        console.log("  src/RiskOracle.sol:RiskOracle");
        console.log(string(abi.encodePacked("  --chain-id ", vm.toString(block.chainid))));
        console.log(string(abi.encodePacked("  --constructor-args ", vm.toString(abi.encode(config.deployer, config.deployer)))));
        console.log("");
        
        console.log("forge verify-contract");
        console.log(string(abi.encodePacked("  ", vm.toString(address(swellChainIntegration)))));
        console.log("  src/SwellChainIntegration.sol:SwellChainIntegration");
        console.log(string(abi.encodePacked("  --chain-id ", vm.toString(block.chainid))));
        console.log(string(abi.encodePacked("  --constructor-args ", vm.toString(abi.encode(
            config.deployer, config.swETH, config.rswETH, config.standardBridge,
            config.machServiceManager, config.nucleusBoringVault, config.nucleusManager
        )))));
        console.log("");
        
        console.log("forge verify-contract");
        console.log(string(abi.encodePacked("  ", vm.toString(address(swellScopeVault)))));
        console.log("  src/SwellScopeVault.sol:SwellScopeVault");
        console.log(string(abi.encodePacked("  --chain-id ", vm.toString(block.chainid))));
        console.log(string(abi.encodePacked("  --constructor-args ", vm.toString(abi.encode(
            config.swETH, "SwellScope Restaking Vault", "ssVault",
            address(riskOracle), address(swellChainIntegration)
        )))));
    }
} 