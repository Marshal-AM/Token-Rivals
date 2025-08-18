const { ethers } = require("ethers");

// Configuration
const CONFIG = {
    CONTRACT_ADDRESS: "0x26d215752f68bc2254186f9f6ff068b8c4bdfd37",
    // Replace with your RPC URL (e.g., Infura, Alchemy, or local node)
    RPC_URL: "https://128123.rpc.thirdweb.com", // Change this to your network RPC
    
    // Test parameters
    TOURNAMENT_ID: 84732, // Random 5-digit number
    TOURNAMENT_ID_2: 15689, // Random 5-digit number
    ETH_DEPOSIT_AMOUNT: ethers.parseEther("0.01"), // 0.01 ETH
    
    // Private keys for testing (DO NOT use these in production!)
    // Replace with your test account private keys
    OWNER_PRIVATE_KEY: "7a425200e31e8409c27abbc9aaae49a94c314426ef2e569d3a33ffc289a34e76", // Hardhat account #0
    PARTICIPANT1_PRIVATE_KEY: "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // Hardhat account #1
    PARTICIPANT2_PRIVATE_KEY: "5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // Hardhat account #2
};

// Contract ABI (only the functions we need)
const CONTRACT_ABI = [
    "function createTournament(uint256 _tournamentId, address _participant1, address _participant2) external",
    "function depositEscrow(uint256 _tournamentId, address _token, uint256 _amount) external payable",
    "function announceWinner(uint256 _tournamentId, address _winner) external",
    "function emergencyWithdraw(uint256 _tournamentId) external",
    "function getTournament(uint256 _tournamentId) external view returns (tuple(uint256 tournamentId, address participant1, address participant2, address token1, address token2, address winner, uint256 amount1, uint256 amount2, bool isCompleted, uint256 timestamp))",
    "function getEscrow(uint256 _tournamentId, address _participant) external view returns (tuple(address participant, address token, uint256 amount, bool isDeposited, bool isWithdrawn))",
    "function bothParticipantsDeposited(uint256 _tournamentId) external view returns (bool)",
    "function tournamentExists(uint256) external view returns (bool)",
    "function owner() external view returns (address)",
    
    // Events
    "event TournamentCreated(uint256 indexed tournamentId, address participant1, address participant2)",
    "event EscrowDeposited(uint256 indexed tournamentId, address indexed participant, address token, uint256 amount)",
    "event TournamentCompleted(uint256 indexed tournamentId, address indexed winner, uint256 totalPayout)",
    "event EmergencyWithdraw(uint256 indexed tournamentId, address indexed participant, uint256 amount)"
];

// ERC20 Token ABI for testing (if you want to test with tokens)
const ERC20_ABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
];

class TournamentTester {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        this.setupWallets();
        this.setupContracts();
    }

    setupWallets() {
        this.ownerWallet = new ethers.Wallet(CONFIG.OWNER_PRIVATE_KEY, this.provider);
        this.participant1Wallet = new ethers.Wallet(CONFIG.PARTICIPANT1_PRIVATE_KEY, this.provider);
        this.participant2Wallet = new ethers.Wallet(CONFIG.PARTICIPANT2_PRIVATE_KEY, this.provider);
        
        console.log("🔑 Wallets Setup:");
        console.log(`Owner: ${this.ownerWallet.address}`);
        console.log(`Participant 1: ${this.participant1Wallet.address}`);
        console.log(`Participant 2: ${this.participant2Wallet.address}`);
    }

    setupContracts() {
        this.contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, this.ownerWallet);
        this.contractAsParticipant1 = this.contract.connect(this.participant1Wallet);
        this.contractAsParticipant2 = this.contract.connect(this.participant2Wallet);
    }

    async checkBalances() {
        console.log("\n💰 Current Balances:");
        const ownerBalance = await this.provider.getBalance(this.ownerWallet.address);
        const p1Balance = await this.provider.getBalance(this.participant1Wallet.address);
        const p2Balance = await this.provider.getBalance(this.participant2Wallet.address);
        
        console.log(`Owner: ${ethers.formatEther(ownerBalance)} ETH`);
        console.log(`Participant 1: ${ethers.formatEther(p1Balance)} ETH`);
        console.log(`Participant 2: ${ethers.formatEther(p2Balance)} ETH`);
    }

    async verifyContractOwner() {
        console.log("\n🔍 Verifying Contract Owner:");
        try {
            const contractOwner = await this.contract.owner();
            console.log(`Contract Owner: ${contractOwner}`);
            console.log(`Our Owner Wallet: ${this.ownerWallet.address}`);
            console.log(`Matches: ${contractOwner.toLowerCase() === this.ownerWallet.address.toLowerCase()}`);
            return contractOwner.toLowerCase() === this.ownerWallet.address.toLowerCase();
        } catch (error) {
            console.error("❌ Error verifying owner:", error.message);
            return false;
        }
    }

    async createTournament(tournamentId = CONFIG.TOURNAMENT_ID) {
        console.log(`\n🏆 Creating Tournament ${tournamentId}:`);
        try {
            const tx = await this.contract.createTournament(
                tournamentId,
                this.participant1Wallet.address,
                this.participant2Wallet.address
            );
            
            console.log(`Transaction Hash: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`✅ Tournament ${tournamentId} created successfully!`);
            console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
            
            // Verify tournament was created
            const tournament = await this.contract.getTournament(tournamentId);
            console.log(`Participant 1: ${tournament.participant1}`);
            console.log(`Participant 2: ${tournament.participant2}`);
            console.log(`Is Completed: ${tournament.isCompleted}`);
            
            return true;
        } catch (error) {
            console.error(`❌ Error creating tournament ${tournamentId}:`, error.message);
            return false;
        }
    }

    async depositETH(tournamentId, participantNumber, amount = CONFIG.ETH_DEPOSIT_AMOUNT) {
        console.log(`\n💰 Participant ${participantNumber} depositing ${ethers.formatEther(amount)} ETH:`);
        try {
            const contract = participantNumber === 1 ? this.contractAsParticipant1 : this.contractAsParticipant2;
            const wallet = participantNumber === 1 ? this.participant1Wallet : this.participant2Wallet;
            
            const balanceBefore = await this.provider.getBalance(wallet.address);
            
            const tx = await contract.depositEscrow(
                tournamentId,
                ethers.ZeroAddress, // ETH
                0, // amount ignored for ETH
                { value: amount }
            );
            
            console.log(`Transaction Hash: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`✅ ETH deposit successful!`);
            console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
            
            const balanceAfter = await this.provider.getBalance(wallet.address);
            console.log(`Balance Change: ${ethers.formatEther(balanceBefore - balanceAfter)} ETH`);
            
            // Verify escrow
            const escrow = await this.contract.getEscrow(tournamentId, wallet.address);
            console.log(`Escrow Amount: ${ethers.formatEther(escrow.amount)} ETH`);
            console.log(`Is Deposited: ${escrow.isDeposited}`);
            
            return true;
        } catch (error) {
            console.error(`❌ Error depositing ETH for participant ${participantNumber}:`, error.message);
            return false;
        }
    }

    async checkTournamentStatus(tournamentId) {
        console.log(`\n📊 Tournament ${tournamentId} Status:`);
        try {
            const tournament = await this.contract.getTournament(tournamentId);
            const bothDeposited = await this.contract.bothParticipantsDeposited(tournamentId);
            
            console.log(`Tournament ID: ${tournament.tournamentId}`);
            console.log(`Participant 1: ${tournament.participant1}`);
            console.log(`Participant 2: ${tournament.participant2}`);
            console.log(`Amount 1: ${ethers.formatEther(tournament.amount1)} ETH`);
            console.log(`Amount 2: ${ethers.formatEther(tournament.amount2)} ETH`);
            console.log(`Winner: ${tournament.winner}`);
            console.log(`Is Completed: ${tournament.isCompleted}`);
            console.log(`Both Participants Deposited: ${bothDeposited}`);
            console.log(`Timestamp: ${new Date(Number(tournament.timestamp) * 1000).toLocaleString()}`);
            
            return tournament;
        } catch (error) {
            console.error(`❌ Error checking tournament ${tournamentId} status:`, error.message);
            return null;
        }
    }

    async announceWinner(tournamentId, winnerNumber) {
        console.log(`\n🎉 Announcing Participant ${winnerNumber} as Winner:`);
        try {
            const winnerAddress = winnerNumber === 1 ? this.participant1Wallet.address : this.participant2Wallet.address;
            const winnerWallet = winnerNumber === 1 ? this.participant1Wallet : this.participant2Wallet;
            
            const balanceBefore = await this.provider.getBalance(winnerAddress);
            
            const tx = await this.contract.announceWinner(tournamentId, winnerAddress);
            console.log(`Transaction Hash: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`✅ Winner announced successfully!`);
            console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
            
            const balanceAfter = await this.provider.getBalance(winnerAddress);
            console.log(`Winner's Balance Change: ${ethers.formatEther(balanceAfter - balanceBefore)} ETH`);
            
            // Check tournament completion
            const tournament = await this.contract.getTournament(tournamentId);
            console.log(`Tournament Completed: ${tournament.isCompleted}`);
            console.log(`Winner Address: ${tournament.winner}`);
            
            return true;
        } catch (error) {
            console.error(`❌ Error announcing winner:`, error.message);
            return false;
        }
    }

    async testEmergencyWithdraw(tournamentId, participantNumber) {
        console.log(`\n🚨 Testing Emergency Withdraw for Participant ${participantNumber}:`);
        try {
            const contract = participantNumber === 1 ? this.contractAsParticipant1 : this.contractAsParticipant2;
            const wallet = participantNumber === 1 ? this.participant1Wallet : this.participant2Wallet;
            
            const balanceBefore = await this.provider.getBalance(wallet.address);
            
            const tx = await contract.emergencyWithdraw(tournamentId);
            console.log(`Transaction Hash: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`✅ Emergency withdraw successful!`);
            console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
            
            const balanceAfter = await this.provider.getBalance(wallet.address);
            console.log(`Balance Change: ${ethers.formatEther(balanceAfter - balanceBefore)} ETH`);
            
            return true;
        } catch (error) {
            console.error(`❌ Error in emergency withdraw:`, error.message);
            return false;
        }
    }

    async runCompleteETHTest() {
        console.log("🚀 Starting Complete ETH Tournament Test");
        console.log("=" * 50);
        
        let success = true;
        
        // Step 1: Check initial setup
        await this.checkBalances();
        success &= await this.verifyContractOwner();
        
        // Step 2: Create tournament
        success &= await this.createTournament();
        
        // Step 3: Both participants deposit ETH
        success &= await this.depositETH(CONFIG.TOURNAMENT_ID, 1);
        success &= await this.depositETH(CONFIG.TOURNAMENT_ID, 2);
        
        // Step 4: Check tournament status
        await this.checkTournamentStatus(CONFIG.TOURNAMENT_ID);
        
        // Step 5: Announce winner
        success &= await this.announceWinner(CONFIG.TOURNAMENT_ID, 1); // Participant 1 wins
        
        // Step 6: Final status check
        await this.checkTournamentStatus(CONFIG.TOURNAMENT_ID);
        await this.checkBalances();
        
        console.log(`\n🏁 Complete ETH Test ${success ? '✅ PASSED' : '❌ FAILED'}`);
        return success;
    }

    async runEmergencyWithdrawTest() {
        console.log("\n🚨 Starting Emergency Withdraw Test");
        console.log("=" * 50);
        
        let success = true;
        
        // Create a separate tournament for emergency withdraw test
        const emergencyTournamentId = CONFIG.TOURNAMENT_ID_2;
        success &= await this.createTournament(emergencyTournamentId);
        
        // Only participant 1 deposits
        success &= await this.depositETH(emergencyTournamentId, 1);
        
        // Check status before emergency withdraw
        await this.checkTournamentStatus(emergencyTournamentId);
        
        // Test emergency withdraw
        success &= await this.testEmergencyWithdraw(emergencyTournamentId, 1);
        
        // Check final balances
        await this.checkBalances();
        
        console.log(`\n🏁 Emergency Withdraw Test ${success ? '✅ PASSED' : '❌ FAILED'}`);
        return success;
    }

    async runErrorTests() {
        console.log("\n⚠️ Starting Error Condition Tests");
        console.log("=" * 50);
        
        console.log("\n🔍 Testing duplicate tournament creation:");
        try {
            await this.contract.createTournament(
                CONFIG.TOURNAMENT_ID, // Same ID as before
                this.participant1Wallet.address,
                this.participant2Wallet.address
            );
            console.log("❌ Should have failed but didn't!");
        } catch (error) {
            console.log("✅ Correctly rejected duplicate tournament:", error.reason || error.message);
        }
        
        console.log("\n🔍 Testing non-participant deposit:");
        try {
            await this.contract.depositEscrow(
                CONFIG.TOURNAMENT_ID,
                ethers.ZeroAddress,
                0,
                { value: CONFIG.ETH_DEPOSIT_AMOUNT }
            );
            console.log("❌ Should have failed but didn't!");
        } catch (error) {
            console.log("✅ Correctly rejected non-participant deposit:", error.reason || error.message);
        }
        
        console.log("\n🔍 Testing invalid tournament query:");
        try {
            await this.contract.getTournament(999);
            console.log("❌ Should have failed but didn't!");
        } catch (error) {
            console.log("✅ Correctly rejected invalid tournament query:", error.reason || error.message);
        }
    }

    async runAllTests() {
        console.log("🎯 TOURNAMENT ESCROW CONTRACT TESTING");
        console.log("=" * 60);
        console.log(`Contract Address: ${CONFIG.CONTRACT_ADDRESS}`);
        console.log(`Network: ${CONFIG.RPC_URL}`);
        console.log("=" * 60);
        
        try {
            // Run main functionality test
            const mainTestSuccess = await this.runCompleteETHTest();
            
            // Run emergency withdraw test
            const emergencyTestSuccess = await this.runEmergencyWithdrawTest();
            
            // Run error condition tests
            await this.runErrorTests();
            
            console.log("\n" + "=" * 60);
            console.log("📊 FINAL TEST RESULTS:");
            console.log(`Main ETH Test: ${mainTestSuccess ? '✅ PASSED' : '❌ FAILED'}`);
            console.log(`Emergency Test: ${emergencyTestSuccess ? '✅ PASSED' : '❌ FAILED'}`);
            console.log(`Overall: ${mainTestSuccess && emergencyTestSuccess ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}`);
            console.log("=" * 60);
            
        } catch (error) {
            console.error("💥 Fatal error during testing:", error);
        }
    }
}

// Usage instructions and main execution
async function main() {
    console.log("🔧 SETUP INSTRUCTIONS:");
    console.log("1. Make sure you have the correct RPC_URL in CONFIG");
    console.log("2. Update private keys with your test accounts");
    console.log("3. Ensure accounts have sufficient ETH for testing");
    console.log("4. Run: node test-deployed-contract.js");
    console.log("");
    
    // Initialize and run tests
    const tester = new TournamentTester();
    await tester.runAllTests();
}

// Export for use as module or run directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { TournamentTester, CONFIG };