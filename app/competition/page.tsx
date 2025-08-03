"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, Trophy, TrendingUp, TrendingDown } from "lucide-react"
import { MobileFrame } from "@/components/mobile-frame"
import { useTournament } from "@/hooks/use-tournament"
import { TournamentChart } from "@/components/tournament-chart"
import { TournamentResult } from "@/components/tournament-result"
import { TournamentResult as TournamentResultType } from "@/lib/tournament-service"
import { useWallet } from "@/contexts/wallet-context"



export default function CompetitionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showResult, setShowResult] = useState(false)

  const roomId = searchParams.get("roomId")
  const selectedPlayersParam = searchParams.get("selectedPlayers")
  const formation = searchParams.get("formation")
  const bet = searchParams.get("bet")
  const isHost = searchParams.get("isHost") === "true"
  const hostBet = searchParams.get("hostBet")

  // Parse selected players
  const selectedPlayers = selectedPlayersParam ? JSON.parse(decodeURIComponent(selectedPlayersParam)) : []

  // For demo purposes, create different squads for host and guest
  // In a real app, you'd get the guest players from the WebSocket data
  const hostPlayers = selectedPlayers
  
  // Create a different squad for guest (for testing)
  const guestPlayers = [
    // Different striker
    {
      id: "guest-striker-1",
      name: "Guest Striker 1",
      position: "striker",
      token: {
        symbol: "ETH",
        priceFeedId: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
      }
    },
    // Different midfielder
    {
      id: "guest-midfielder-1", 
      name: "Guest Midfielder 1",
      position: "midfielder",
      token: {
        symbol: "OP",
        priceFeedId: "0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf"
      }
    },
    // Different defender
    {
      id: "guest-defender-1",
      name: "Guest Defender 1", 
      position: "defender",
      token: {
        symbol: "SUI",
        priceFeedId: "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744"
      }
    }
  ]

  // Both players bet the same way - use the room bet
  const roomBet = (hostBet || bet) as 'LONG' | 'SHORT'

  // Tournament hook
  const {
    isRunning,
    timeRemaining,
    progress,
    result,
    startTournament,
    stopTournament
  } = useTournament({
    hostPlayers,
    guestPlayers,
    roomBet,
    duration: 60000, // 60 seconds
    onComplete: (result: TournamentResultType) => {
      console.log('Tournament completed:', result)
      setShowResult(true)
    }
  })

  // Start tournament when component mounts
  useEffect(() => {
    if (!isRunning && !showResult) {
      startTournament()
    }
  }, [isRunning, showResult, startTournament])

  const handlePlayAgain = () => {
    setShowResult(false)
    startTournament()
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col bg-gray-900 text-white">
        {/* Header */}
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="text-white text-sm">0.00</span>
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">+</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">Menu</span>
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Live Tournament</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">
                {Math.ceil(timeRemaining / 1000)}s
              </span>
            </div>
          </div>
          
          {/* Score Display */}
          {progress && (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-white">
                {progress.hostSquad.percentageChange.toFixed(3)}% : {progress.guestSquad.percentageChange.toFixed(3)}%
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400 text-xs">1m</span>
              </div>
            </div>
          )}

          {/* Player Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">H</span>
              </div>
              <div>
                <div className="text-white text-sm font-medium">Host</div>
                <div className={`text-xs font-bold ${roomBet === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                  {roomBet}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-white text-sm font-medium">Guest</div>
                <div className={`text-xs font-bold ${roomBet === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                  {roomBet}
                </div>
              </div>
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Chart */}
        <div className="flex-1 p-4 bg-gray-900">
          <TournamentChart
            progress={progress}
            hostBet={roomBet}
            guestBet={roomBet}
            timeRemaining={timeRemaining}
            duration={60000}
          />
        </div>

        {/* Bottom Section */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex justify-around items-center mb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">H</span>
              </div>
              <span className="text-white text-sm font-medium">Host</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span className="text-white text-sm font-medium">Guest</span>
            </div>
          </div>
          
          <Button 
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-base font-medium flex items-center justify-center gap-2 rounded-lg shadow-lg transition-all duration-300"
            disabled={!isRunning}
          >
            {isRunning ? 'Tournament in Progress...' : 'Tournament Complete'}
          </Button>
        </div>

        {/* Result Screen Overlay */}
        {showResult && result && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-20">
            <TournamentResult
              result={result}
              roomBet={roomBet}
              onPlayAgain={handlePlayAgain}
              onBackToHome={handleBackToHome}
            />
          </div>
        )}
      </div>
    </MobileFrame>
  )
}
