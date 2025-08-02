"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import { MobileFrame } from "@/components/mobile-frame"

export default function BettingSelectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedBet, setSelectedBet] = useState<"SHORT" | "LONG" | null>(null)

  const handleBetSelection = (bet: "SHORT" | "LONG") => {
    setSelectedBet(bet)
  }

  const handleCreateRoom = () => {
    if (selectedBet) {
      const selectedPlayersParam = searchParams.get("selectedPlayers")
      const formation = searchParams.get("formation")
      
      // Generate a random room ID
      const roomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      
      // Navigate to room code display page
      router.push(`/room-code-display?roomId=${roomId}&bet=${selectedBet}&selectedPlayers=${selectedPlayersParam}&formation=${formation}`)
    }
  }

  return (
    <MobileFrame>
      <div className="flex flex-col h-full bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Choose Your Bet</h1>
          <button 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Select Your Position</h2>
            <p className="text-gray-400">Choose whether you want to bet on the price going up or down</p>
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
        </div>

        {/* Action Button */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <Button
            onClick={handleCreateRoom}
            disabled={!selectedBet}
            className={`w-full py-3 text-lg font-bold rounded-lg transition-all duration-300 ${
              selectedBet 
                ? "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700" 
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
                         Create Room
          </Button>
        </div>
      </div>
    </MobileFrame>
  )
} 