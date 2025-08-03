"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { MobileFrame } from "@/components/mobile-frame"
import { WalletConnection } from "@/components/wallet-connection"
import { useWallet } from "@/contexts/wallet-context"

export default function BettingSelectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedBet, setSelectedBet] = useState<"SHORT" | "LONG" | null>(null)
  const [stakeAmount, setStakeAmount] = useState<string>("")
  
  const { isConnected, isContractReady, userBalance } = useWallet()

  const handleBetSelection = (bet: "SHORT" | "LONG") => {
    setSelectedBet(bet)
  }

  const handleCreateRoom = () => {
    if (selectedBet && stakeAmount && parseFloat(stakeAmount) > 0) {
      const selectedPlayersParam = searchParams.get("selectedPlayers")
      const formation = searchParams.get("formation")
      
      // Navigate to new room creation page with WebSocket
      router.push(`/room-creation?bet=${selectedBet}&stake=${stakeAmount}&selectedPlayers=${selectedPlayersParam}&formation=${formation}`)
    }
  }

  const handleJoinRoom = () => {
    if (selectedBet && stakeAmount && parseFloat(stakeAmount) > 0) {
      const selectedPlayersParam = searchParams.get("selectedPlayers")
      const formation = searchParams.get("formation")
      
      // Navigate to room join page with current settings
      router.push(`/room-join?bet=${selectedBet}&stake=${stakeAmount}&selectedPlayers=${selectedPlayersParam}&formation=${formation}`)
    }
  }

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow positive numbers with up to 4 decimal places (for ETH precision)
    if (value === "" || /^\d*\.?\d{0,4}$/.test(value)) {
      setStakeAmount(value)
    }
  }

  const canProceed = isConnected && isContractReady && selectedBet && stakeAmount && parseFloat(stakeAmount) > 0 && parseFloat(stakeAmount) <= parseFloat(userBalance)

  return (
    <MobileFrame>
      <div className="flex-1 overflow-y-auto bg-gray-900">
        <div className="p-4">
          {/* Header with back button */}
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white mr-4"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-white">Choose Your Bet</h1>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Select Your Position & Stake</h2>
            <p className="text-gray-400">Connect wallet and choose your betting direction with XTZ stake</p>
          </div>

          {/* Wallet Connection - Only show if not connected */}
          {!isConnected && (
            <div className="mb-6">
              <WalletConnection requireConnection={true} showBalance={false} />
            </div>
          )}

          {/* Stake Amount Input */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-white">Stake Amount</h3>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter XTZ stake (e.g., 0.01)"
                value={stakeAmount}
                onChange={handleStakeChange}
                disabled={!isConnected || !isContractReady}
                className="text-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-12"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                XTZ
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
              <p className="text-gray-400">
                This XTZ will be staked in the smart contract
              </p>
              {isConnected && (
                <p className="text-gray-300">
                  Balance: {parseFloat(userBalance).toFixed(4)} XTZ
                </p>
              )}
            </div>
            {stakeAmount && parseFloat(stakeAmount) > parseFloat(userBalance) && (
              <p className="text-red-400 text-sm mt-1">
                Insufficient balance
              </p>
            )}
          </div>

          <div className="space-y-4">
            {/* Long Option */}
            <div 
              onClick={() => handleBetSelection("LONG")}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedBet === "LONG" 
                  ? "border-green-500 bg-green-500 bg-opacity-10" 
                  : "border-gray-600 bg-gray-800 hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white">LONG</h3>
                    <p className="text-gray-400">Bet on price going UP</p>
                  </div>
                </div>
                {selectedBet === "LONG" && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Short Option */}
            <div 
              onClick={() => handleBetSelection("SHORT")}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedBet === "SHORT" 
                  ? "border-red-500 bg-red-500 bg-opacity-10" 
                  : "border-gray-600 bg-gray-800 hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white">SHORT</h3>
                    <p className="text-gray-400">Bet on price going DOWN</p>
                  </div>
                </div>
                {selectedBet === "SHORT" && (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3 mt-8">
            <Button
              onClick={handleCreateRoom}
              disabled={!canProceed}
              className={`w-full py-3 text-lg font-bold rounded-lg transition-all duration-300 ${
                canProceed
                  ? "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700" 
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              Create Room {stakeAmount && parseFloat(stakeAmount) > 0 ? `(${stakeAmount} XTZ)` : ''}
            </Button>
            
            <Button
              onClick={handleJoinRoom}
              disabled={!canProceed}
              variant="outline"
              className={`w-full py-3 text-lg font-bold rounded-lg transition-all duration-300 ${
                canProceed
                  ? "border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white" 
                  : "border-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              Join Room {stakeAmount && parseFloat(stakeAmount) > 0 ? `(${stakeAmount} XTZ)` : ''}
            </Button>
          </div>
        </div>
      </div>
    </MobileFrame>
  )
} 