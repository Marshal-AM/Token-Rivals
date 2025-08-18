'use client'

import { useWallet } from '@/contexts/civic-wallet-context'
import { useUser } from "@civic/auth-web3/react"
import { userHasWallet } from "@civic/auth-web3"
import { Button } from '@/components/ui/button'
import { Wallet, LogOut } from 'lucide-react'
import Image from 'next/image'

export function GameHeader() {
  const { 
    isConnected, 
    address, 
    userBalance,
    connectWallet,
    signIn,
    signOut
  } = useWallet()
  
  const userContext = useUser()

  return (
    <div className="flex items-center justify-between p-3 bg-mobile-frame-dark text-white border-b border-gray-800">
      {/* Left side - App logo */}
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="RIVALS"
          width={100}
          height={30}
          className="h-10 w-auto"
        />
      </div>

      {/* Right side - Wallet connection */}
      <div className="flex items-center space-x-2">
        {isConnected && userHasWallet(userContext) ? (
          <>
            {/* Balance and Address */}
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400">Balance</span>
              <span className="text-sm font-semibold text-green-400">
                {parseFloat(userBalance).toFixed(4)} XTZ
              </span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400">Account</span>
              <span className="text-xs font-mono text-blue-400">
                {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'N/A'}
              </span>
            </div>

            {/* Logout Button */}
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="p-2 h-8 w-8 text-white bg-button-green hover:bg-green hover:text-white"
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </>
        ) : userContext.user && !userHasWallet(userContext) ? (
          /* User is logged in but needs to create wallet */
          <Button
            onClick={() => userContext.createWallet()}
            disabled={userContext.walletCreationInProgress}
            size="sm"
            className="bg-button-green hover:bg-green-600 px-3 py-1 text-xs"
          >
            <Wallet className="w-3 h-3 mr-1" />
            {userContext.walletCreationInProgress ? 'Creating...' : 'Create Wallet'}
          </Button>
        ) : userHasWallet(userContext) && !isConnected ? (
          /* User has wallet but not connected */
          <Button
            onClick={connectWallet}
            size="sm"
            className="bg-button-green hover:bg-green-600 px-3 py-1 text-xs"
          >
            <Wallet className="w-3 h-3 mr-1" />
            Connect
          </Button>
        ) : (
          /* Sign in button with green styling */
          <Button
            onClick={signIn}
            size="sm"
            className="bg-button-green hover:bg-green-600 px-3 py-1 text-xs"
          >
            <Wallet className="w-3 h-3 mr-1" />
            Connect
          </Button>
        )}
      </div>
    </div>
  )
}