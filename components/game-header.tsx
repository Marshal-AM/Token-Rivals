'use client'

// Import the wagmi configuration to initialize AppKit
import '@/lib/wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useWallet } from '@/contexts/wallet-context'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut } from 'lucide-react'

export function GameHeader() {
  const { open } = useAppKit()
  const { 
    isConnected, 
    address, 
    userBalance,
    disconnectWallet,
    isConnecting 
  } = useWallet()

  const handleConnect = () => {
    open()
  }

  const handleDisconnect = async () => {
    await disconnectWallet()
  }

  return (
    <div className="flex items-center justify-between p-3 bg-mobile-frame-dark text-white border-b border-gray-800">
      {/* Left side - App title */}
      <div className="flex items-center">
        <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Token Rivals
        </h1>
      </div>

      {/* Right side - Wallet connection */}
      <div className="flex items-center space-x-2">
        {isConnected ? (
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

            {/* Disconnect Button */}
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              className="p-2 h-8 w-8 text-black"
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-3 py-1 text-xs"
          >
            <Wallet className="w-3 h-3 mr-1" />
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        )}
      </div>
    </div>
  )
}
