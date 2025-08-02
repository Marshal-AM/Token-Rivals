"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Users, Check, AlertCircle, Loader2 } from "lucide-react"
import { MobileFrame } from "@/components/mobile-frame"
import { useRoomWebSocket } from "@/hooks/use-room-websocket"

export default function RoomJoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [roomCode, setRoomCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [showHandshakeModal, setShowHandshakeModal] = useState(false)
  const [hostData, setHostData] = useState<any>(null)

  const selectedPlayersParam = searchParams.get("selectedPlayers")
  const formation = searchParams.get("formation")
  const bet = searchParams.get("bet")
  const roomCodeParam = searchParams.get("roomCode")

  const {
    isConnected,
    roomId,
    roomStatus,
    error,
    joinRoom,
    setPlayerReady,
    disconnect
  } = useRoomWebSocket()

  // Parse selected players
  const selectedPlayers = selectedPlayersParam ? JSON.parse(decodeURIComponent(selectedPlayersParam)) : []

  // Set room code from URL parameter if available
  useEffect(() => {
    if (roomCodeParam) {
      setRoomCode(roomCodeParam.toUpperCase())
    }
  }, [roomCodeParam])

  // Handle room status changes
  useEffect(() => {
    if (roomStatus === 'handshaking') {
      console.log('Joined room, waiting for host to accept handshake')
    } else if (roomStatus === 'accepted') {
      console.log('Handshake accepted, setting player ready')
      if (roomId) {
        setPlayerReady(roomId)
      }
    } else if (roomStatus === 'tournament') {
      console.log('Tournament starting, redirecting to competition')
      // Redirect to competition page
      const params = new URLSearchParams({
        roomId: roomId || '',
        selectedPlayers: selectedPlayersParam || '',
        formation: formation || '',
        bet: bet || '',
        isHost: 'false',
        hostBet: hostData?.bet || ''
      })
      router.push(`/competition?${params.toString()}`)
    } else if (roomStatus === 'error') {
      console.error('Room error:', error)
      setIsJoining(false)
    }
  }, [roomStatus, roomId, error, setPlayerReady, router, selectedPlayersParam, formation, bet, hostData])

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      return
    }

    setIsJoining(true)
    console.log('Joining room:', roomCode)
    
    joinRoom(roomCode.toUpperCase(), {
      selectedPlayers,
      formation: formation || '2-2-1',
      bet
    })
  }

  const handleBack = () => {
    disconnect()
    router.back()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinRoom()
    }
  }

  if (!isConnected) {
    return (
      <MobileFrame>
        <div className="flex flex-col h-full bg-gray-900">
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-white mb-2">Connecting to Server</h2>
              <p className="text-gray-400">Please wait while we establish a connection...</p>
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
          <h1 className="text-xl font-bold text-white">Join Room</h1>
          <button onClick={handleBack} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Join a Tournament</h2>
            <p className="text-gray-400">Enter the room code provided by your opponent</p>
          </div>

          {/* Room Code Input */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="mb-4">
              <label htmlFor="roomCode" className="block text-white font-semibold mb-2">
                Room Code
              </label>
              <Input
                id="roomCode"
                type="text"
                placeholder="Enter room code (e.g., A1B2C3D4)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="text-center text-lg font-mono bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                maxLength={8}
                disabled={isJoining || roomStatus !== 'idle'}
              />
            </div>

            <Button
              onClick={handleJoinRoom}
              disabled={!roomCode.trim() || isJoining || roomStatus !== 'idle'}
              className="w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-300"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Joining Room...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 mr-2" />
                  Join Room
                </>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-2">How to join:</h3>
            <ol className="text-gray-300 text-sm space-y-1">
              <li>1. Ask your opponent for their room code</li>
              <li>2. Enter the 8-character room code above</li>
              <li>3. Wait for the host to accept your connection</li>
              <li>4. Once accepted, the tournament will begin!</li>
            </ol>
          </div>

          {/* Status */}
          {roomStatus !== 'idle' && (
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                {roomStatus === 'handshaking' && (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Waiting for host to accept connection...</span>
                  </>
                )}
                {roomStatus === 'accepted' && (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Connection accepted! Starting tournament...</span>
                  </>
                )}
              </div>
              <p className="text-gray-500 text-xs">
                {roomStatus === 'handshaking' && "The host will be notified of your request"}
                {roomStatus === 'accepted' && "Preparing tournament..."}
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </MobileFrame>
  )
} 