'use client'

import { useWallet } from '@/contexts/civic-wallet-context'
import { UserButton, useUser } from "@civic/auth-web3/react"
import { userHasWallet } from "@civic/auth-web3"
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, Check, AlertCircle, Loader2 } from 'lucide-react'

interface WalletConnectionProps {
  requireConnection?: boolean
  showBalance?: boolean
  className?: string
}

export function WalletConnection({ 
  requireConnection = false, 
  showBalance = true, 
  className = "" 
}: WalletConnectionProps) {
  const { 
    isConnected, 
    address, 
    userBalance, 
    networkInfo, 
    isContractReady,
    connectWallet,
    isConnecting,
    signIn
  } = useWallet()
  
  const userContext = useUser()

  // If user is logged in but doesn't have a wallet, show wallet creation option
  if (userContext.user && !userHasWallet(userContext)) {
    return (
      <div className={`space-y-4 ${className}`}>
        {requireConnection && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-yellow-400">
              Please create a wallet to continue
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          onClick={() => userContext.createWallet()}
          disabled={userContext.walletCreationInProgress}
          className="w-full py-3 text-lg font-bold bg-button-green hover:bg-green-600 rounded-lg transition-all duration-300"
        >
          {userContext.walletCreationInProgress ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Wallet...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 mr-2" />
              Create Web3 Wallet
            </>
          )}
        </Button>
      </div>
    )
  }

  // If user is not logged in, show login button
  if (!userContext.user) {
    return (
      <div className={`space-y-4 ${className}`}>
        {requireConnection && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-yellow-400">
              Please sign in to continue
            </AlertDescription>
          </Alert>
        )}
        
        {/* Custom sign-in button instead of UserButton for better control */}
        <Button
          onClick={signIn}
          className="w-full py-3 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300"
        >
          <Wallet className="w-5 h-5 mr-2" />
          Sign In with Civic
        </Button>
      </div>
    )
  }

  // If user has wallet but not connected to Wagmi, show connect button
  if (userHasWallet(userContext) && !isConnected) {
    return (
      <div className={`space-y-4 ${className}`}>
        {requireConnection && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-yellow-400">
              Please connect your wallet to continue
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full py-3 text-lg font-bold bg-button-green hover:bg-green-600 rounded-lg transition-all duration-300"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Connection Status */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-green-400">Wallet Connected</span>
          </div>
          {/* Use Civic Auth's UserButton for logout functionality */}
          <div className="text-xs">
            <UserButton />
          </div>
        </div>
        
        <div className="space-y-1 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>Address:</span>
            <span className="font-mono text-xs">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}
            </span>
          </div>
          
          {showBalance && (
            <div className="flex justify-between">
              <span>Balance:</span>
              <span className="font-semibold text-green-400">
                {parseFloat(userBalance).toFixed(4)} XTZ
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>Network:</span>
            <span className="text-blue-400">
              {networkInfo?.name || 'Unknown'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Contract:</span>
            <span className={isContractReady ? 'text-green-400' : 'text-red-400'}>
              {isContractReady ? 'Ready' : 'Not Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Warning for wrong network */}
      {networkInfo && networkInfo.chainId !== parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '128123') && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-yellow-400">
            Please switch to Etherlink Testnet (Chain ID: {process.env.NEXT_PUBLIC_CHAIN_ID || '128123'}) to use this application
          </AlertDescription>
        </Alert>
      )}

      {/* Warning for low balance */}
      {parseFloat(userBalance) < 0.01 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-yellow-400">
            Your balance is low. You may need more XTZ to participate in tournaments.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}