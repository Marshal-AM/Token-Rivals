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
    score: matchEnded ? "-0.06%" : "-0.00%",
    isWinner: true, // For demonstration, marshal.25sec always wins
  }

  const opponent = {
    name: "ThomasPotli",
    avatar: "/placeholder.svg?height=40&width=40",
    score: matchEnded ? "-0.11%" : "0.00%",
    isLeading: !matchEnded, // Opponent is leading initially in live match image
  }

  // Sample data for the graph (more points for smoother lines)
  const graphData = [
    { time: "01:09:36", user: -0.018, opponent: -0.015 },
    { time: "01:09:36.5", user: -0.012, opponent: -0.01 },
    { time: "01:09:37", user: -0.008, opponent: -0.005 },
    { time: "01:09:37.5", user: -0.01, opponent: -0.008 },
    { time: "01:09:38", user: -0.003, opponent: -0.001 },
    { time: "01:09:38.5", user: 0.002, opponent: 0.001 },
    { time: "01:09:39", user: 0.008, opponent: 0.004 },
  ]

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col bg-comp-bg-dark text-white">
        {/* Match Status Header */}
        <div className="p-4 bg-comp-header-bg flex flex-col gap-4 border-b border-gray-800 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-live-dot animate-pulse" />
              <span className="text-sm font-medium text-gray-300">{matchEnded ? "Match ended" : "Live match"}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{matchEnded ? "1m" : "00:00:48"}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <Image
                src={user.avatar || "/placeholder.svg"}
                alt={`${user.name} avatar`}
                width={56}
                height={56}
                className="rounded-full border-2 border-green-500 shadow-lg"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-xl text-green-400">{user.name}</span>
                <span className="text-sm text-gray-400">Your Team</span>
              </div>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-score-text drop-shadow-lg">{user.score}</span>
              <span className="text-xl font-extrabold text-red-500 drop-shadow-lg">{opponent.score}</span>
            </div>

            {/* Opponent Info */}
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-3">
                {opponent.isLeading && !matchEnded && (
                  <span className="text-tab-active-green text-xs font-bold animate-pulse">Leading</span>
                )}
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-xl text-red-400">{opponent.name}</span>
                  <span className="text-sm text-gray-400">Opponent</span>
                </div>
                <Image
                  src={opponent.avatar || "/placeholder.svg"}
                  alt={`${opponent.name} avatar`}
                  width={56}
                  height={56}
                  className="rounded-full border-2 border-red-500 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Graph Section */}
        <div className="flex-1 p-4 flex flex-col justify-between bg-comp-bg-dark">
          <div className="h-64 w-full bg-gray-900 rounded-lg p-2 shadow-inner border border-gray-800">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={graphData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={matchEnded ? "#444" : "url(#gridGradient)"} />
                <XAxis dataKey="time" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <YAxis
                  tickFormatter={(value) => `${(value * 100).toFixed(3)}%`}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  domain={[-0.02, 0.01]}
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
                  stroke="url(#userGradient)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "url(#userGradient)" }}
                  activeDot={{ r: 6, fill: "url(#userGradient)", stroke: "#fff", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="opponent"
                  stroke="url(#opponentGradient)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "url(#opponentGradient)" }}
                  activeDot={{ r: 6, fill: "url(#opponentGradient)", stroke: "#fff", strokeWidth: 2 }}
                />
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FF69B4" />
                    <stop offset="100%" stopColor="#FF1493" />
                  </linearGradient>
                  <linearGradient id="opponentGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7CFC00" />
                    <stop offset="100%" stopColor="#32CD32" />
                  </linearGradient>
                  <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#333333" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#333333" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Current values on graph */}
          {!matchEnded && (
            <div className="flex justify-end gap-4 mt-4 pr-4">
              <div className="flex items-center text-sm font-bold text-graph-line-user">
                <div className="w-2.5 h-2.5 rounded-full bg-graph-line-user mr-1" />
                <span>{(graphData[graphData.length - 1].user * 100).toFixed(3)}%</span>
              </div>
              <div className="flex items-center text-sm font-bold text-graph-line-opponent">
                <div className="w-2.5 h-2.5 rounded-full bg-graph-line-opponent mr-1" />
                <span>{(graphData[graphData.length - 1].opponent * 100).toFixed(3)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Player Avatars and Share Button */}
        <div className="p-4 bg-comp-header-bg space-y-4 border-t border-gray-800 shadow-inner">
          <div className="flex justify-around items-center">
            <div className="flex flex-col items-center gap-2">
              <Image
                src={user.avatar || "/placeholder.svg"}
                alt={`${user.name} avatar`}
                width={60}
                height={60}
                className="rounded-full border-2 border-green-500 shadow-md"
              />
              <span className="text-sm font-medium text-gray-200">{user.name}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Image
                src={opponent.avatar || "/placeholder.svg"}
                alt={`${opponent.name} avatar`}
                width={60}
                height={60}
                className="rounded-full border-2 border-red-500 shadow-md"
              />
              <span className="text-sm font-medium text-gray-200">{opponent.name}</span>
            </div>
          </div>
          <Button className="w-full bg-gradient-to-r from-share-button-gradient-start to-share-button-gradient-end hover:from-share-button-gradient-end hover:to-share-button-gradient-start text-white py-3 text-lg flex items-center justify-center gap-2 rounded-xl shadow-lg transition-all duration-300 ease-in-out">
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
