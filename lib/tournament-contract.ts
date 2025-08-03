import { ethers } from 'ethers'
import { useAppKitProvider, useAppKitAccount } from '@reown/appkit/react'

// Contract configuration
const CONTRACT_CONFIG = {
  CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL!,
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '128123'),
}

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
]

export interface TournamentData {
  tournamentId: bigint
  participant1: string
  participant2: string
  token1: string
  token2: string
  winner: string
  amount1: bigint
  amount2: bigint
  isCompleted: boolean
  timestamp: bigint
}

export interface EscrowData {
  participant: string
  token: string
  amount: bigint
  isDeposited: boolean
  isWithdrawn: boolean
}

export class TournamentContract {
  private contract: ethers.Contract | null = null
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null

  constructor() {
    this.initializeContract()
  }

  private async initializeContract() {
    try {
      // Initialize with read-only provider for viewing
      const readOnlyProvider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.RPC_URL)
      this.contract = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_ABI,
        readOnlyProvider
      )
    } catch (error) {
      console.error('Failed to initialize contract:', error)
    }
  }

  async connectWallet() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.BrowserProvider(window.ethereum)
        this.signer = await this.provider.getSigner()
        
        // Create contract instance with signer for write operations
        this.contract = new ethers.Contract(
          CONTRACT_CONFIG.CONTRACT_ADDRESS,
          CONTRACT_ABI,
          this.signer
        )
        
        return true
      }
      throw new Error('No wallet found')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      return false
    }
  }

  // Generate a unique tournament ID
  generateTournamentId(): number {
    return Math.floor(Math.random() * 90000) + 10000 // 5-digit random number
  }

  // Create a new tournament
  async createTournament(participant1: string, participant2: string): Promise<{ success: boolean, tournamentId?: number, txHash?: string }> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or wallet not connected')
      }

      const tournamentId = this.generateTournamentId()
      
      console.log(`Creating tournament ${tournamentId} with participants:`, { participant1, participant2 })
      
      const tx = await this.contract.createTournament(tournamentId, participant1, participant2)
      console.log('Tournament creation transaction:', tx.hash)
      
      const receipt = await tx.wait()
      console.log('Tournament created successfully:', receipt)
      
      return {
        success: true,
        tournamentId,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('Error creating tournament:', error)
      return { success: false }
    }
  }

  // Deposit XTZ stake for tournament
  async depositStake(tournamentId: number, amountInXtz: string): Promise<{ success: boolean, txHash?: string }> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or wallet not connected')
      }

      const amountWei = ethers.parseEther(amountInXtz)
      
      console.log(`Depositing ${amountInXtz} XTZ for tournament ${tournamentId}`)
      
      const tx = await this.contract.depositEscrow(
        tournamentId,
        ethers.ZeroAddress, // Native currency (XTZ) deposit
        0,
        { value: amountWei }
      )
      
      console.log('Deposit transaction:', tx.hash)
      
      const receipt = await tx.wait()
      console.log('Deposit successful:', receipt)
      
      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('Error depositing stake:', error)
      return { success: false }
    }
  }

  // Check if user has deposited for tournament
  async checkDeposit(tournamentId: number, userAddress: string): Promise<EscrowData | null> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized')
      }

      const escrow = await this.contract.getEscrow(tournamentId, userAddress)
      
      return {
        participant: escrow.participant,
        token: escrow.token,
        amount: escrow.amount,
        isDeposited: escrow.isDeposited,
        isWithdrawn: escrow.isWithdrawn
      }
    } catch (error) {
      console.error('Error checking deposit:', error)
      return null
    }
  }

  // Get tournament details
  async getTournament(tournamentId: number): Promise<TournamentData | null> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized')
      }

      const tournament = await this.contract.getTournament(tournamentId)
      
      return {
        tournamentId: tournament.tournamentId,
        participant1: tournament.participant1,
        participant2: tournament.participant2,
        token1: tournament.token1,
        token2: tournament.token2,
        winner: tournament.winner,
        amount1: tournament.amount1,
        amount2: tournament.amount2,
        isCompleted: tournament.isCompleted,
        timestamp: tournament.timestamp
      }
    } catch (error) {
      console.error('Error getting tournament:', error)
      return null
    }
  }

  // Check if both participants have deposited
  async checkBothDeposited(tournamentId: number): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized')
      }

      return await this.contract.bothParticipantsDeposited(tournamentId)
    } catch (error) {
      console.error('Error checking deposits:', error)
      return false
    }
  }

  // Announce tournament winner
  async announceWinner(tournamentId: number, winnerAddress: string): Promise<{ success: boolean, txHash?: string }> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or wallet not connected')
      }

      console.log(`Announcing winner ${winnerAddress} for tournament ${tournamentId}`)
      
      const tx = await this.contract.announceWinner(tournamentId, winnerAddress)
      console.log('Winner announcement transaction:', tx.hash)
      
      const receipt = await tx.wait()
      console.log('Winner announced successfully:', receipt)
      
      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('Error announcing winner:', error)
      return { success: false }
    }
  }

  // Emergency withdraw
  async emergencyWithdraw(tournamentId: number): Promise<{ success: boolean, txHash?: string }> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or wallet not connected')
      }

      console.log(`Emergency withdraw for tournament ${tournamentId}`)
      
      const tx = await this.contract.emergencyWithdraw(tournamentId)
      console.log('Emergency withdraw transaction:', tx.hash)
      
      const receipt = await tx.wait()
      console.log('Emergency withdraw successful:', receipt)
      
      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('Error in emergency withdraw:', error)
      return { success: false }
    }
  }

  // Listen to contract events
  setupEventListeners(callbacks: {
    onTournamentCreated?: (tournamentId: number, participant1: string, participant2: string) => void
    onEscrowDeposited?: (tournamentId: number, participant: string, amount: bigint) => void
    onTournamentCompleted?: (tournamentId: number, winner: string, totalPayout: bigint) => void
    onEmergencyWithdraw?: (tournamentId: number, participant: string, amount: bigint) => void
  }) {
    if (!this.contract) return

    // Listen for TournamentCreated events
    if (callbacks.onTournamentCreated) {
      this.contract.on('TournamentCreated', (tournamentId, participant1, participant2) => {
        console.log('Tournament Created Event:', { tournamentId: Number(tournamentId), participant1, participant2 })
        callbacks.onTournamentCreated!(Number(tournamentId), participant1, participant2)
      })
    }

    // Listen for EscrowDeposited events
    if (callbacks.onEscrowDeposited) {
      this.contract.on('EscrowDeposited', (tournamentId, participant, token, amount) => {
        console.log('Escrow Deposited Event:', { tournamentId: Number(tournamentId), participant, amount })
        callbacks.onEscrowDeposited!(Number(tournamentId), participant, amount)
      })
    }

    // Listen for TournamentCompleted events
    if (callbacks.onTournamentCompleted) {
      this.contract.on('TournamentCompleted', (tournamentId, winner, totalPayout) => {
        console.log('Tournament Completed Event:', { tournamentId: Number(tournamentId), winner, totalPayout })
        callbacks.onTournamentCompleted!(Number(tournamentId), winner, totalPayout)
      })
    }

    // Listen for EmergencyWithdraw events
    if (callbacks.onEmergencyWithdraw) {
      this.contract.on('EmergencyWithdraw', (tournamentId, participant, amount) => {
        console.log('Emergency Withdraw Event:', { tournamentId: Number(tournamentId), participant, amount })
        callbacks.onEmergencyWithdraw!(Number(tournamentId), participant, amount)
      })
    }
  }

  // Remove all event listeners
  removeEventListeners() {
    if (this.contract) {
      this.contract.removeAllListeners()
    }
  }

  // Get current network info
  async getNetworkInfo() {
    try {
      if (!this.provider) return null
      
      const network = await this.provider.getNetwork()
      return {
        chainId: Number(network.chainId),
        name: network.name
      }
    } catch (error) {
      console.error('Error getting network info:', error)
      return null
    }
  }

  // Get user XTZ balance
  async getUserBalance(address: string): Promise<string> {
    try {
      if (!this.provider) return '0'
      
      const balance = await this.provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error('Error getting user balance:', error)
      return '0'
    }
  }
}

// Singleton instance
export const tournamentContract = new TournamentContract()