"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, X, Check } from "lucide-react"
import { MobileFrame } from "@/components/mobile-frame"

// Crypto token data for different positions
const strikerTokens = [
  { id: 1, name: "Bitcoin", symbol: "BTC", price: "$43,250", change: "+2.5%", color: "from-yellow-400 to-orange-500" },
  { id: 2, name: "Ethereum", symbol: "ETH", price: "$2,680", change: "+1.8%", color: "from-blue-400 to-purple-500" },
  { id: 3, name: "Solana", symbol: "SOL", price: "$98.50", change: "+5.2%", color: "from-green-400 to-blue-500" },
  { id: 4, name: "Cardano", symbol: "ADA", price: "$0.52", change: "+3.1%", color: "from-blue-500 to-indigo-600" },
  { id: 5, name: "Polkadot", symbol: "DOT", price: "$7.20", change: "+4.7%", color: "from-pink-400 to-purple-600" },
  { id: 6, name: "Chainlink", symbol: "LINK", price: "$15.80", change: "+2.9%", color: "from-blue-500 to-cyan-500" },
  { id: 7, name: "Uniswap", symbol: "UNI", price: "$6.45", change: "+1.6%", color: "from-pink-500 to-red-500" },
  { id: 8, name: "Aave", symbol: "AAVE", price: "$245.30", change: "+3.8%", color: "from-purple-500 to-indigo-600" },
  { id: 9, name: "Synthetix", symbol: "SNX", price: "$3.20", change: "+2.1%", color: "from-cyan-400 to-blue-500" },
  { id: 10, name: "Yearn Finance", symbol: "YFI", price: "$8,450", change: "+4.2%", color: "from-yellow-500 to-orange-600" },
]

const midfielderTokens = [
  { id: 11, name: "Polygon", symbol: "MATIC", price: "$0.85", change: "+6.3%", color: "from-purple-400 to-pink-500" },
  { id: 12, name: "Avalanche", symbol: "AVAX", price: "$32.40", change: "+3.9%", color: "from-red-400 to-orange-500" },
  { id: 13, name: "Cosmos", symbol: "ATOM", price: "$9.80", change: "+2.7%", color: "from-blue-400 to-indigo-500" },
  { id: 14, name: "Tezos", symbol: "XTZ", price: "$1.15", change: "+1.4%", color: "from-green-400 to-teal-500" },
  { id: 15, name: "Algorand", symbol: "ALGO", price: "$0.18", change: "+5.1%", color: "from-gray-400 to-gray-600" },
  { id: 16, name: "Stellar", symbol: "XLM", price: "$0.12", change: "+2.3%", color: "from-purple-400 to-violet-500" },
  { id: 17, name: "VeChain", symbol: "VET", price: "$0.025", change: "+4.8%", color: "from-green-500 to-emerald-600" },
  { id: 18, name: "IOTA", symbol: "MIOTA", price: "$0.28", change: "+1.9%", color: "from-blue-500 to-cyan-600" },
  { id: 19, name: "NEO", symbol: "NEO", price: "$12.50", change: "+3.2%", color: "from-green-400 to-emerald-500" },
  { id: 20, name: "Ontology", symbol: "ONT", price: "$0.35", change: "+2.6%", color: "from-purple-500 to-violet-600" },
]

const defenderTokens = [
  { id: 21, name: "Tether", symbol: "USDT", price: "$1.00", change: "0.0%", color: "from-green-400 to-emerald-500" },
  { id: 22, name: "USD Coin", symbol: "USDC", price: "$1.00", change: "0.0%", color: "from-blue-400 to-cyan-500" },
  { id: 23, name: "Dai", symbol: "DAI", price: "$1.00", change: "0.0%", color: "from-yellow-400 to-orange-500" },
  { id: 24, name: "Binance USD", symbol: "BUSD", price: "$1.00", change: "0.0%", color: "from-yellow-500 to-orange-600" },
  { id: 25, name: "TrueUSD", symbol: "TUSD", price: "$1.00", change: "0.0%", color: "from-blue-500 to-indigo-600" },
  { id: 26, name: "Pax Dollar", symbol: "USDP", price: "$1.00", change: "0.0%", color: "from-green-500 to-emerald-600" },
  { id: 27, name: "Gemini Dollar", symbol: "GUSD", price: "$1.00", change: "0.0%", color: "from-purple-400 to-violet-500" },
  { id: 28, name: "Frax", symbol: "FRAX", price: "$1.00", change: "0.0%", color: "from-gray-400 to-gray-600" },
  { id: 29, name: "Liquity USD", symbol: "LUSD", price: "$1.00", change: "0.0%", color: "from-blue-400 to-indigo-500" },
  { id: 30, name: "Fei USD", symbol: "FEI", price: "$1.00", change: "0.0%", color: "from-orange-400 to-red-500" },
]

type Token = {
  id: number
  name: string
  symbol: string
  price: string
  change: string
  color: string
}

type SelectedPlayer = {
  position: "ST" | "MF" | "CB"
  token: Token
  slotId: string
}

export default function CreateSquadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPosition, setSelectedPosition] = useState<"ST" | "MF" | "CB" | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([])
  const [showTokenGrid, setShowTokenGrid] = useState(false)

  // Get selected players from URL params
  useEffect(() => {
    const playersParam = searchParams.get("selectedPlayers")
    if (playersParam) {
      try {
        const players = JSON.parse(decodeURIComponent(playersParam))
        setSelectedPlayers(players)
      } catch (error) {
        console.error("Error parsing selected players:", error)
      }
    }
  }, [searchParams])

  // Get position and slot from URL params
  useEffect(() => {
    const position = searchParams.get("position") as "ST" | "MF" | "CB" | null
    const slotId = searchParams.get("slotId")
    
    if (position && slotId) {
      setSelectedPosition(position)
      setSelectedSlotId(slotId)
      setShowTokenGrid(true)
    }
  }, [searchParams])

  const getTokensForPosition = (position: "ST" | "MF" | "CB"): Token[] => {
    switch (position) {
      case "ST":
        return strikerTokens
      case "MF":
        return midfielderTokens
      case "CB":
        return defenderTokens
      default:
        return []
    }
  }

  const handleTokenSelect = (token: Token) => {
    if (selectedPosition && selectedSlotId) {
      // Create updated players list
      const updatedPlayers = selectedPlayers.filter(player => player.slotId !== selectedSlotId)
      const newPlayer: SelectedPlayer = {
        position: selectedPosition,
        token,
        slotId: selectedSlotId
      }
      const newSelectedPlayers = [...updatedPlayers, newPlayer]
      
      // Redirect back to main page with selected token info and updated players
      const selectedPlayersParam = encodeURIComponent(JSON.stringify(newSelectedPlayers))
      router.push(`/?selectedTokenId=${token.id}&position=${selectedPosition}&slotId=${selectedSlotId}&selectedPlayers=${selectedPlayersParam}`)
    }
  }

  const handlePlayerSlotClick = (position: "ST" | "MF" | "CB", slotId: string) => {
    setSelectedPosition(position)
    setSelectedSlotId(slotId)
    setShowTokenGrid(true)
  }

  const removePlayer = (slotId: string) => {
    setSelectedPlayers(selectedPlayers.filter(player => player.slotId !== slotId))
  }

  const getPositionColor = (position: "ST" | "MF" | "CB") => {
    switch (position) {
      case "ST":
        return "bg-red-500"
      case "MF":
        return "bg-blue-500"
      case "CB":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const TokenCard = ({ token, onClick, isDisabled }: { token: Token; onClick: () => void; isDisabled?: boolean }) => (
    <div 
      onClick={isDisabled ? undefined : onClick}
      className={`bg-gray-800 rounded-lg p-3 transition-all duration-200 border ${
        isDisabled 
          ? 'cursor-not-allowed opacity-50 border-gray-600' 
          : 'cursor-pointer hover:bg-gray-700 border-gray-700 hover:border-green-500'
      }`}
    >
      <div className={`w-full h-16 rounded-md bg-gradient-to-r ${token.color} mb-3 flex items-center justify-center relative`}>
        <span className="text-white font-bold text-lg">{token.symbol}</span>
        {isDisabled && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">SELECTED</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-white font-semibold text-sm truncate">{token.name}</h3>
        <p className="text-gray-400 text-xs">{token.price}</p>
        <p className={`text-xs font-medium ${token.change.startsWith('+') ? 'text-green-400' : token.change.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>
          {token.change}
        </p>
      </div>
    </div>
  )

  const PlayerSlot = ({ position, slotId, selectedPlayer }: { 
    position: "ST" | "MF" | "CB"; 
    slotId: string;
    selectedPlayer?: SelectedPlayer;
  }) => (
    <div className="relative flex flex-col items-center justify-center w-20 h-20 bg-gray-800 rounded-md p-2 text-white text-xs font-medium text-center flex-shrink-0 border border-gray-600 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg">
      {selectedPlayer ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className={`w-8 h-8 rounded-full ${getPositionColor(position)} flex items-center justify-center mb-1`}>
            <span className="text-white text-xs font-bold">{selectedPlayer.token.symbol}</span>
          </div>
          <span className="text-xs truncate w-full">{selectedPlayer.token.name}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              removePlayer(slotId)
            }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <button 
          onClick={() => handlePlayerSlotClick(position, slotId)}
          className="flex flex-col items-center justify-center w-full h-full"
        >
          <div className={`w-8 h-8 rounded-full ${getPositionColor(position)} flex items-center justify-center mb-1`}>
            <span className="text-white text-xs font-bold">{position}</span>
          </div>
          <span className="text-xs">ADD TOKEN</span>
        </button>
      )}
    </div>
  )

  if (showTokenGrid && selectedPosition) {
    const tokens = getTokensForPosition(selectedPosition)
    
    return (
      <MobileFrame>
        <div className="flex flex-col h-full bg-gray-900">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">
              Select {selectedPosition === "ST" ? "Striker" : selectedPosition === "MF" ? "Midfielder" : "Defender"} Token
            </h1>
            <button 
              onClick={() => setShowTokenGrid(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Token Grid */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 overflow-y-auto">
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 pb-4">
                  {tokens.map((token) => {
                    const isAlreadySelected = selectedPlayers.some(player => 
                      player.token.id === token.id && player.slotId !== selectedSlotId
                    )
                    return (
                      <TokenCard 
                        key={token.id} 
                        token={token} 
                        onClick={() => handleTokenSelect(token)}
                        isDisabled={isAlreadySelected}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MobileFrame>
    )
  }

  return (
    <MobileFrame>
      <div className="flex flex-col h-full bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Create Squad</h1>
          <button 
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Team Assembly Area */}
        <div className="flex-1 p-4">
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h2 className="text-white font-semibold mb-3">Your Team</h2>
            <div className="grid grid-cols-3 gap-3">
              {/* Striker Slots */}
              <div className="space-y-2">
                <h3 className="text-red-400 text-sm font-medium">Strikers</h3>
                {Array.from({ length: 3 }).map((_, index) => (
                  <PlayerSlot 
                    key={`ST-${index}`}
                    position="ST"
                    slotId={`ST-${index}`}
                    selectedPlayer={selectedPlayers.find(p => p.slotId === `ST-${index}`)}
                  />
                ))}
              </div>

              {/* Midfielder Slots */}
              <div className="space-y-2">
                <h3 className="text-blue-400 text-sm font-medium">Midfielders</h3>
                {Array.from({ length: 3 }).map((_, index) => (
                  <PlayerSlot 
                    key={`MF-${index}`}
                    position="MF"
                    slotId={`MF-${index}`}
                    selectedPlayer={selectedPlayers.find(p => p.slotId === `MF-${index}`)}
                  />
                ))}
              </div>

              {/* Defender Slots */}
              <div className="space-y-2">
                <h3 className="text-green-400 text-sm font-medium">Defenders</h3>
                {Array.from({ length: 3 }).map((_, index) => (
                  <PlayerSlot 
                    key={`CB-${index}`}
                    position="CB"
                    slotId={`CB-${index}`}
                    selectedPlayer={selectedPlayers.find(p => p.slotId === `CB-${index}`)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Instructions</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Click on any player slot to select a crypto token</li>
              <li>• Strikers: High-volatility tokens for attacking</li>
              <li>• Midfielders: Balanced tokens for control</li>
              <li>• Defenders: Stable tokens for defense</li>
              <li>• Click the X to remove a selected player</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="flex-1 text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => router.push("/")}
            >
              <Check className="w-4 h-4 mr-2" />
              Save Squad
            </Button>
          </div>
        </div>
      </div>
    </MobileFrame>
  )
}
