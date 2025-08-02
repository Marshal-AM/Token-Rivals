"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus } from "lucide-react"
import { MobileFrame } from "@/components/mobile-frame"

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
      { position: "CB", count: 3, className: "flex justify-around w-full gap-x-2" },
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

const PlayerSlot = ({ position, onClick }: { position: "ST" | "MF" | "CB"; onClick: () => void }) => {
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

  return (
    <div className="relative flex flex-col items-center justify-center w-20 h-20 bg-player-slot-bg rounded-md p-2 text-white text-xs font-medium text-center flex-shrink-0 border border-gray-600 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg">
      <button onClick={onClick} className="flex flex-col items-center justify-center w-full h-full">
        <Plus className="w-6 h-6 mb-1 text-green-400" />
        <span>ADD TOKEN</span>
      </button>
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
  const router = useRouter()

  const handleEnterTournament = () => {
    if (squadName.trim() === "") {
      setSquadNameError(true)
    } else {
      setSquadNameError(false)
      router.push("/tournament-type") // Navigate to tournament type selection
    }
  }

  const handlePlayerSlotClick = () => {
    router.push("/create-squad") // Navigate to the create squad page
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
              onClick={() => setActiveFormation(formationKey)}
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
                {Array.from({ length: row.count }).map((_, playerIndex) => (
                  <PlayerSlot
                    key={`${row.position}-${playerIndex}`}
                    position={row.position}
                    onClick={handlePlayerSlotClick}
                  />
                ))}
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
    </MobileFrame>
  )
}
