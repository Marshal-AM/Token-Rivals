'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { tournamentContract } from '@/lib/tournament-contract'
import { useUser } from "@civic/auth-web3/react"
import { useAutoConnect } from "@civic/auth-web3/wagmi"
import { userHasWallet } from "@civic/auth-web3"
import { useAccount, useBalance, useConnect } from 'wagmi'

interface WalletContextType {
  // Wallet connection state
  isConnected: boolean
  address: string | undefined
  isConnecting: boolean
  
  // Contract interaction state
  isContractReady: boolean
  userBalance: string
  networkInfo: { chainId: number; name: string } | null
  
  // Tournament state
  pendingStakes: Map<number, { amount: string; status: 'pending' | 'confirmed' | 'failed' }>
  
  // Functions
  connectWallet: () => Promise<boolean>
  disconnectWallet: () => void
  refreshBalance: () => Promise<void>
  createTournament: (participant1: string, participant2: string) => Promise<{ success: boolean, tournamentId?: number, txHash?: string }>
  depositStake: (tournamentId: number, amountInXtz: string) => Promise<{ success: boolean, txHash?: string }>
  checkUserDeposit: (tournamentId: number) => Promise<boolean>
  announceWinner: (tournamentId: number, winnerAddress: string) => Promise<{ success: boolean, txHash?: string }>
  getTournament: (tournamentId: number) => Promise<any>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const userContext = useUser()
  const { isConnected: wagmiConnected, address: wagmiAddress } = useAccount()
  const { connect, connectors } = useConnect()
  
  // Auto-connect to Civic embedded wallet
  useAutoConnect()
  
  // Get address from Civic Auth Web3 context
  const address = userHasWallet(userContext) ? userContext.ethereum.address : undefined
  const isConnected = !!userContext.user && !!address && wagmiConnected
  
  // Get balance using Wagmi
  const { data: balanceData } = useBalance({ 
    address: address as `0x${string}` | undefined 
  })
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [isContractReady, setIsContractReady] = useState(false)
  const [networkInfo, setNetworkInfo] = useState<{ chainId: number; name: string } | null>(null)
  const [pendingStakes, setPendingStakes] = useState(new Map())
  
  // Calculate balance from Wagmi data
  const userBalance = balanceData ? (Number(balanceData.value) / 1e18).toString() : '0'

  // Initialize contract when wallet connects
  useEffect(() => {
    const initializeContract = async () => {
      if (isConnected && address) {
        console.log('Wallet connected, initializing contract...')
        const success = await tournamentContract.connectWallet()
        setIsContractReady(success)
        
        if (success) {
          await refreshBalance()
          const network = await tournamentContract.getNetworkInfo()
          setNetworkInfo(network)
          
          // Setup event listeners
          tournamentContract.setupEventListeners({
            onEscrowDeposited: (tournamentId, participant, amount) => {
              if (participant.toLowerCase() === address.toLowerCase()) {
                console.log(`Stake confirmed for tournament ${tournamentId}`)
                setPendingStakes(prev => {
                  const updated = new Map(prev)
                  const existing = updated.get(tournamentId)
                  if (existing) {
                    updated.set(tournamentId, { ...existing, status: 'confirmed' })
                  }
                  return updated
                })
              }
            },
            onTournamentCompleted: (tournamentId, winner, totalPayout) => {
              console.log(`Tournament ${tournamentId} completed. Winner: ${winner}`)
              // Handle tournament completion
            }
          })
        }
      } else {
        setIsContractReady(false)
        setNetworkInfo(null)
        tournamentContract.removeEventListeners()
      }
    }

    initializeContract()
    
    return () => {
      if (!isConnected) {
        tournamentContract.removeEventListeners()
      }
    }
  }, [isConnected, address])

  // Periodic balance refresh when connected
  useEffect(() => {
    if (isConnected && address && isContractReady) {
      // Initial balance fetch
      refreshBalance()
      
      // Set up periodic balance refresh every 10 seconds
      const balanceInterval = setInterval(() => {
        refreshBalance()
      }, 10000)
      
      return () => clearInterval(balanceInterval)
    }
  }, [isConnected, address, isContractReady])

  // Handle disconnection state properly
  useEffect(() => {
    if (!isConnected) {
      // Clean up state when disconnected via Civic Auth
      console.log('User disconnected via Civic Auth, cleaning up state')
      setIsContractReady(false)
      setNetworkInfo(null)
      setPendingStakes(new Map())
      tournamentContract.removeEventListeners()
    }
  }, [isConnected])

  const connectWallet = async (): Promise<boolean> => {
    setIsConnecting(true)
    try {
      // If user doesn't have a wallet yet, create one
      if (userContext.user && !userHasWallet(userContext)) {
        console.log('Creating wallet for new user...')
        await userContext.createWallet()
      }
      
      // Connect to Civic embedded wallet using Wagmi
      if (connectors.length > 0) {
        connect({ connector: connectors[0] })
      }
      
      return true
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    // Civic Auth handles disconnection via UserButton component
    console.log('Use UserButton component for wallet disconnection')
  }

  const refreshBalance = async () => {
    // Balance is now automatically managed by Wagmi's useBalance hook
    // This function is kept for compatibility but no longer needs to do anything
    console.log('Balance is automatically updated by Wagmi')
  }

  const createTournament = async (participant1: string, participant2: string) => {
    if (!isContractReady) {
      return { success: false }
    }
    
    return await tournamentContract.createTournament(participant1, participant2)
  }

  const depositStake = async (tournamentId: number, amountInXtz: string) => {
    if (!isContractReady || !address) {
      return { success: false }
    }

    // Mark as pending
    setPendingStakes(prev => {
      const updated = new Map(prev)
      updated.set(tournamentId, { amount: amountInXtz, status: 'pending' })
      return updated
    })

    try {
      const result = await tournamentContract.depositStake(tournamentId, amountInXtz)
      
      if (!result.success) {
        // Mark as failed
        setPendingStakes(prev => {
          const updated = new Map(prev)
          const existing = updated.get(tournamentId)
          if (existing) {
            updated.set(tournamentId, { ...existing, status: 'failed' })
          }
          return updated
        })
      }
      
      // Update balance after transaction
      await refreshBalance()
      
      return result
    } catch (error) {
      console.error('Error depositing stake:', error)
      setPendingStakes(prev => {
        const updated = new Map(prev)
        const existing = updated.get(tournamentId)
        if (existing) {
          updated.set(tournamentId, { ...existing, status: 'failed' })
        }
        return updated
      })
      return { success: false }
    }
  }

  const checkUserDeposit = async (tournamentId: number): Promise<boolean> => {
    if (!isContractReady || !address) {
      return false
    }

    const escrow = await tournamentContract.checkDeposit(tournamentId, address)
    return escrow?.isDeposited || false
  }

  const announceWinner = async (tournamentId: number, winnerAddress: string) => {
    if (!isContractReady) {
      return { success: false }
    }
    
    return await tournamentContract.announceWinner(tournamentId, winnerAddress)
  }

  const getTournament = async (tournamentId: number) => {
    if (!isContractReady) {
      return null
    }
    
    return await tournamentContract.getTournament(tournamentId)
  }

  const value: WalletContextType = {
    // Wallet connection state
    isConnected,
    address,
    isConnecting,
    
    // Contract interaction state
    isContractReady,
    userBalance,
    networkInfo,
    
    // Tournament state
    pendingStakes,
    
    // Functions
    connectWallet,
    disconnectWallet,
    refreshBalance,
    createTournament,
    depositStake,
    checkUserDeposit,
    announceWinner,
    getTournament
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export { WalletContext }