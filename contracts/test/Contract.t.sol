// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/SwellScopeVault.sol";
import "../src/RiskOracle.sol";
import "../src/SwellChainIntegration.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract SwellScopeVaultTest is Test {
    SwellScopeVault public vault;
    RiskOracle public riskOracle;
    SwellChainIntegration public swellChainIntegration;
    MockERC20 public mockToken;
    
    address public admin = address(0x1);
    address public user = address(0x2);
    address public oracle = address(0x3);

    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy mock token
        mockToken = new MockERC20();
        
        // Deploy risk oracle
        riskOracle = new RiskOracle(admin, oracle);
        
        // Deploy Swellchain integration
        swellChainIntegration = new SwellChainIntegration(
            admin,
            address(mockToken), // swETH
            address(0), // rswETH (optional)
            address(0x4200000000000000000000000000000000000010), // standard bridge
            address(0x289Dbe6573D6a1dAF00110b5B1b2D8F0a34099C2), // MACH service manager
            address(0x9Ed15383940CC380fAEF0a75edacE507cC775f22), // Nucleus boring vault
            address(0x69FC700226E9e12D8c5E46a4b50A78efB64F50C0)  // Nucleus manager
        );
        
        // Deploy vault
        vault = new SwellScopeVault(
            IERC20(address(mockToken)),
            "SwellScope Vault",
            "ssVault",
            address(riskOracle),
            address(swellChainIntegration)
        );
        
        // Setup tokens for user
        mockToken.mint(user, 1000 * 10**18);
        
        vm.stopPrank();
    }

    function testVaultDeployment() public {
        assertEq(vault.name(), "SwellScope Vault");
        assertEq(vault.symbol(), "ssVault");
        assertEq(address(vault.asset()), address(mockToken));
        assertEq(address(vault.riskOracle()), address(riskOracle));
        assertEq(address(vault.swellChainIntegration()), address(swellChainIntegration));
    }

    function testRiskOracleDeployment() public {
        assertTrue(riskOracle.hasRole(riskOracle.ORACLE_ROLE(), oracle));
        assertTrue(riskOracle.hasRole(riskOracle.DEFAULT_ADMIN_ROLE(), admin));
    }

    function testSwellChainIntegrationDeployment() public {
        assertEq(address(swellChainIntegration.swETH()), address(mockToken));
        assertEq(swellChainIntegration.standardBridge(), address(0x4200000000000000000000000000000000000010));
        assertEq(swellChainIntegration.machServiceManager(), address(0x289Dbe6573D6a1dAF00110b5B1b2D8F0a34099C2));
    }

    function testBasicVaultOperations() public {
        vm.startPrank(user);
        
        // Approve vault to spend tokens
        mockToken.approve(address(vault), 100 * 10**18);
        
        // Deposit tokens
        uint256 shares = vault.deposit(100 * 10**18, user);
        
        assertEq(vault.balanceOf(user), shares);
        assertEq(vault.totalSupply(), shares);
        assertTrue(shares > 0);
        
        vm.stopPrank();
    }
}
