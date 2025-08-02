"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Share2, Trophy, Clock } from "lucide-react"
import { MobileFrame } from "@/components/mobile-frame"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Confetti component
const Confetti = () => {
  const colors = ["confetti-red", "confetti-blue", "confetti-yellow", "confetti-green"]
  const pieces = Array.from({ length: 50 }).map((_, i) => (
    <div
      key={i}
      className={`absolute w-2 h-2 rounded-full ${colors[Math.floor(Math.random() * colors.length)]}`}
      style={{
        left: `${Math.random() * 100}%`,
        animation: `confetti-fall ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`,
        opacity: 0,
      }}
    />
  ))
  return <div className="absolute inset-0 overflow-hidden pointer-events-none">{pieces}</div>
}

export default function CompetitionPage() {
  const [matchEnded, setMatchEnded] = useState(false)
  const [showWinnerScreen, setShowWinnerScreen] = useState(false)

  useEffect(() => {
    // Simulate match ending after 5 seconds
    const matchEndTimer = setTimeout(() => {
      setMatchEnded(true)
      // Show winner screen 5 seconds after match ends (total 10s from start)
      const winnerScreenTimer = setTimeout(() => {
        setShowWinnerScreen(true)
      }, 5000)
      return () => clearTimeout(winnerScreenTimer)
    }, 5000)

    return () => clearTimeout(matchEndTimer)
  }, [])

  const user = {
    name: "marshal.25sec",
    avatar: "/placeholder.svg?height=40&width=40",
    score: matchEnded ? "-0.06%" : "-0.05%",
    isWinner: true,
  }

  const opponent = {
    name: "xuser_snap",
    avatar: "/placeholder.svg?height=40&width=40",
    score: matchEnded ? "-0.11%" : "0.05%",
    isLeading: !matchEnded,
  }

  // Updated graph data to match the reference image
  const graphData = [
    { time: "02:03:56", user: -0.02, opponent: 0.03 },
    { time: "02:03:57", user: 0.01, opponent: 0.01 },
    { time: "02:03:58", user: 0.04, opponent: -0.02 },
    { time: "02:03:59", user: 0.077, opponent: -0.073 },
  ]

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col bg-gray-900 text-white">
        {/* Header with Balance and Match Status */}
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
              <span className="text-white text-sm font-medium">Live match</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">00:00:47</span>
            </div>
          </div>
          
          {/* Score Display */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-white">
              {user.score} : {opponent.score}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400 text-xs">1m</span>
            </div>
          </div>

          {/* Player Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <div>
                <div className="text-white text-sm font-medium">{user.name}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                {opponent.isLeading && (
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded mb-1">Leading</div>
                )}
                <div className="text-white text-sm font-medium">{opponent.name}</div>
              </div>
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">X</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graph Section */}
        <div className="flex-1 p-4 bg-gray-900">
          <div className="h-64 w-full bg-gray-800 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={graphData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={{ stroke: "#444" }}
                />
                <YAxis
                  tickFormatter={(value) => `${(value * 100).toFixed(3)}%`}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  domain={[-0.1, 0.1]}
                  axisLine={{ stroke: "#444" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#333",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                  }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: number) => `${(value * 100).toFixed(3)}%`}
                />
                <Line
                  type="monotone"
                  dataKey="user"
                  stroke="#FF69B4"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#FF69B4", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#FF69B4", stroke: "#fff", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="opponent"
                  stroke="#7CFC00"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#7CFC00", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#7CFC00", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Graph Legend */}
          <div className="flex justify-end gap-4 mt-3">
            <div className="flex items-center text-sm font-bold text-pink-400">
              <div className="w-3 h-3 rounded-full bg-pink-400 mr-2"></div>
              <span>{(graphData[graphData.length - 1].user * 100).toFixed(3)}%</span>
            </div>
            <div className="flex items-center text-sm font-bold text-green-400">
              <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
              <span>{(graphData[graphData.length - 1].opponent * 100).toFixed(3)}%</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex justify-around items-center mb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="text-white text-sm font-medium">{user.name}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">X</span>
              </div>
              <span className="text-white text-sm font-medium">{opponent.name}</span>
            </div>
          </div>
          
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-base font-medium flex items-center justify-center gap-2 rounded-lg shadow-lg transition-all duration-300">
            Share Results
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Winner Screen Overlay */}
        {showWinnerScreen && (
          <div className="absolute inset-0 bg-comp-bg-dark bg-opacity-95 flex items-center justify-center p-4 animate-fade-in-scale z-20">
            <Confetti />
            <div className="relative bg-gradient-to-br from-victorious-gradient-start to-victorious-gradient-end rounded-2xl p-8 text-center shadow-2xl flex flex-col items-center gap-5 border-4 border-victorious-glow animate-pulse-glow overflow-hidden">
              <span className="text-3xl font-extrabold text-white uppercase tracking-widest drop-shadow-lg animate-confetti-burst">
                VICTORIOUS
              </span>
              <Image
                src={user.avatar || "/placeholder.svg"}
                alt={`${user.name} avatar`}
                width={120}
                height={120}
                className="rounded-full border-6 border-white shadow-xl animate-confetti-burst"
              />
              <span className="text-4xl font-bold text-white drop-shadow-lg animate-confetti-burst">{user.name}</span>
              <span className="text-2xl font-semibold text-white drop-shadow-lg animate-confetti-burst">WON</span>
              <div className="flex items-center gap-3 text-white text-4xl font-bold drop-shadow-lg animate-trophy-bounce">
                <Trophy className="w-12 h-12 text-yellow-300" />
                <span>+7</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileFrame>
  )
}
