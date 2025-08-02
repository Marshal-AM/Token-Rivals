"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, X } from "lucide-react"
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

type Formation = {
  strikers: number
  midfielders: number
  defenders: number
  layout: { position: "ST" | "MF" | "CB"; count: number; className: string }[]
}

const formations: { [key: string]: Formation } = {
  "2-2-1": {
    strikers: 1,
    midfielders: 2,
    defenders: 2,
    layout: [
      { position: "ST", count: 1, className: "flex justify-center w-full" },
      { position: "MF", count: 2, className: "flex justify-around w-full gap-x-4" },
      { position: "CB", count: 2, className: "flex justify-around w-full gap-x-4" },
    ],
  },
  "0-2-3": {
    strikers: 3,
    midfielders: 2,
    defenders: 0,
    layout: [
      { position: "ST", count: 3, className: "flex justify-around w-full gap-x-2" },
      { position: "MF", count: 2, className: "flex justify-around w-full gap-x-4" },
    ],
  },
  "3-2-0": {
    strikers: 0,
    midfielders: 2,
    defenders: 3,
    layout: [
      { position: "MF", count: 2, className: "flex justify-around w-full gap-x-4" },
      { position: "CB", count: 3, className: "flex justify-around w-full gap-x-4" },
    ],
  },
  "0-0-5": {
    strikers: 5,
    midfielders: 0,
    defenders: 0,
    layout: [
      { position: "ST", count: 3, className: "flex justify-around w-full gap-x-2" },
      { position: "ST", count: 2, className: "flex justify-around w-full gap-x-4" },
    ],
  },
}

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

const PlayerSlot = ({ position, slotId, onClick, selectedPlayer, onRemove }: { 
  position: "ST" | "MF" | "CB"; 
  slotId: string; 
  onClick: (position: "ST" | "MF" | "CB", slotId: string) => void;
  selectedPlayer?: SelectedPlayer;
  onRemove: (slotId: string) => void;
}) => {
  let positionColorClass = ""
  switch (position) {
    case "ST":
      positionColorClass = "bg-position-st"
      break
    case "MF":
      positionColorClass = "bg-position-mf"
      break
    case "CB":
      positionColorClass = "bg-position-cb"
      break
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

  return (
    <div className="relative flex flex-col items-center justify-center w-20 h-20 bg-player-slot-bg rounded-md p-2 text-white text-xs font-medium text-center flex-shrink-0 border border-gray-600 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg">
      {selectedPlayer ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${selectedPlayer.token.color} flex items-center justify-center mb-1`}>
            <span className="text-white text-xs font-bold">{selectedPlayer.token.symbol}</span>
          </div>
          <span className="text-xs truncate w-full">{selectedPlayer.token.name}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onRemove(slotId)
            }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <button onClick={() => onClick(position, slotId)} className="flex flex-col items-center justify-center w-full h-full">
          <Plus className="w-6 h-6 mb-1 text-green-400" />
          <span>ADD TOKEN</span>
        </button>
      )}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-4 rounded-sm flex items-center justify-center text-white text-[10px] font-bold ${positionColorClass} shadow-sm`}
      >
        {position}
      </div>
    </div>
  )
}

export default function FantasyFootballGame() {
  const [activeFormation, setActiveFormation] = useState("2-2-1")
  const [squadName, setSquadName] = useState("My Favourite Squad 1")
  const [squadNameError, setSquadNameError] = useState(false)
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([])
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<"ST" | "MF" | "CB" | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Clear selected players when formation changes
  const handleFormationChange = (newFormation: string) => {
    setActiveFormation(newFormation)
    // Only clear players that are not valid for the new formation
    setSelectedPlayers(prevPlayers => {
      const newFormationData = formations[newFormation]
      return prevPlayers.filter(player => {
        // Keep players that are still valid for the new formation
        if (player.position === "ST" && newFormationData.strikers > 0) return true
        if (player.position === "MF" && newFormationData.midfielders > 0) return true
        if (player.position === "CB" && newFormationData.defenders > 0) return true
        return false
      })
    })
  }

  // Initialize formation from URL params if available (for direct links)
  useEffect(() => {
    const formation = searchParams.get("formation")
    if (formation && formations[formation]) {
      setActiveFormation(formation)
    }
  }, [searchParams])

  const handleEnterTournament = () => {
    if (squadName.trim() === "") {
      setSquadNameError(true)
    } else {
      setSquadNameError(false)
      router.push("/tournament-type") // Navigate to tournament type selection
    }
  }

  const handlePlayerSlotClick = (position: "ST" | "MF" | "CB", slotId: string) => {
    setSelectedPosition(position)
    setSelectedSlotId(slotId)
    setShowTokenModal(true)
  }

  const removePlayer = (slotId: string) => {
    setSelectedPlayers(prevPlayers => prevPlayers.filter(player => player.slotId !== slotId))
  }

  const handleTokenSelect = (token: Token) => {
    if (selectedPosition && selectedSlotId) {
      // Check if this token is already selected in another slot
      const isTokenAlreadySelected = selectedPlayers.some(player => 
        player.token.id === token.id && player.slotId !== selectedSlotId
      )
      
      if (isTokenAlreadySelected) {
        // Token is already selected, don't proceed
        return
      }
      
      // Create updated players list
      const updatedPlayers = selectedPlayers.filter(player => player.slotId !== selectedSlotId)
      const newPlayer: SelectedPlayer = {
        position: selectedPosition,
        token,
        slotId: selectedSlotId
      }
      const newSelectedPlayers = [...updatedPlayers, newPlayer]
      
      // Update the state immediately to reflect the selection
      setSelectedPlayers(newSelectedPlayers)
      
      // Close the modal
      setShowTokenModal(false)
      setSelectedPosition(null)
      setSelectedSlotId(null)
    }
  }

  const isEnterTournamentButtonDisabled = squadName.trim() === ""

  const currentFormation = formations[activeFormation]

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Formation Tabs */}
        <div className="flex justify-around p-2 bg-mobile-frame-dark border-b border-gray-800 shadow-inner">
          {Object.keys(formations).map((formationKey) => (
            <Button
              key={formationKey}
              variant="ghost"
              onClick={() => handleFormationChange(formationKey)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFormation === formationKey
                  ? "bg-gradient-to-r from-tab-active-green to-green-600 text-mobile-frame-dark shadow-lg"
                  : "text-tab-inactive-text hover:bg-gray-700 hover:text-white"
              }`}
            >
              {formationKey}
            </Button>
          ))}
        </div>

        {/* Football Pitch */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black">
          <div className="relative w-full h-full bg-pitch-green rounded-lg overflow-hidden flex flex-col justify-around items-center p-4 border-4 border-green-700 shadow-2xl">
            {/* Pitch Lines */}
            <div className="absolute inset-0 border-2 border-pitch-line-white rounded-lg"></div>
            <div className="absolute w-full h-1 border-t-2 border-pitch-line-white top-1/2 -translate-y-1/2"></div>
            <div className="absolute w-20 h-20 border-2 border-pitch-line-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-24 h-16 border-2 border-pitch-line-white top-0 left-1/2 -translate-x-1/2 rounded-b-lg"></div>
            <div className="absolute w-24 h-16 border-2 border-pitch-line-white bottom-0 left-1/2 -translate-x-1/2 rounded-t-lg"></div>
            {/* Player Slots */}
            {currentFormation.layout.map((row, rowIndex) => (
              <div key={rowIndex} className={`${row.className} flex-1 flex items-center`}>
                {Array.from({ length: row.count }).map((_, playerIndex) => {
                  // Create unique slot ID that includes formation info
                  const slotId = `${activeFormation}-${row.position}-${playerIndex}`
                  const selectedPlayer = selectedPlayers.find(p => p.slotId === slotId)
                  return (
                    <PlayerSlot
                      key={slotId}
                      position={row.position}
                      slotId={slotId}
                      onClick={handlePlayerSlotClick}
                      selectedPlayer={selectedPlayer}
                      onRemove={removePlayer}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Squad Naming and Action Buttons */}
        <div className="p-4 bg-mobile-frame-dark space-y-4 border-t border-gray-800 shadow-inner">
          <div>
            <label htmlFor="squad-name" className="block text-white text-sm font-medium mb-1">
              Name the squad
            </label>
            {squadNameError && (
              <span className="text-error-red text-xs ml-2 animate-pulse">Squad name is required</span>
            )}
            <Input
              id="squad-name"
              value={squadName}
              onChange={(e) => {
                setSquadName(e.target.value)
                if (e.target.value.trim() !== "") {
                  setSquadNameError(false)
                }
              }}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              placeholder="My Favourite Squad 1"
            />
          </div>
          <div className="flex justify-between gap-3">
            <Button
              variant="ghost"
              className="flex-1 text-white hover:bg-gray-700 rounded-lg py-3 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              className={`flex-1 py-3 text-lg font-bold rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
                isEnterTournamentButtonDisabled
                  ? "bg-button-disabled cursor-not-allowed opacity-70"
                  : "bg-gradient-to-r from-button-green to-green-600 hover:from-green-600 hover:to-button-green"
              }`}
              onClick={handleEnterTournament}
              disabled={isEnterTournamentButtonDisabled}
            >
              {isEnterTournamentButtonDisabled ? "Positions need to be filled" : "Enter Tournament"}
            </Button>
          </div>
        </div>
      </div>

      {/* Token Selection Modal */}
      {showTokenModal && selectedPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                Select {selectedPosition === "ST" ? "Striker" : selectedPosition === "MF" ? "Midfielder" : "Defender"} Token
              </h2>
              <button 
                onClick={() => {
                  setShowTokenModal(false)
                  setSelectedPosition(null)
                  setSelectedSlotId(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Token Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                {getTokensForPosition(selectedPosition).map((token) => {
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
      )}
    </MobileFrame>
  )
}
