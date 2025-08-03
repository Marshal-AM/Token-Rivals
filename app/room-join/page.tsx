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
  const [showRoomInfo, setShowRoomInfo] = useState(false)
  const [userStakeAmount, setUserStakeAmount] = useState("")

  const selectedPlayersParam = searchParams.get("selectedPlayers")
  const formation = searchParams.get("formation")
  const bet = searchParams.get("bet")
  const stake = searchParams.get("stake")
  const roomCodeParam = searchParams.get("roomCode")

  const {
    isConnected,
    roomId,
    roomStatus,
    error,
    roomInfo,
    getRoomInfo,
    joinRoom,
    setPlayerReady,
    disconnect
  } = useRoomWebSocket()

  // Parse selected players
  const selectedPlayers = selectedPlayersParam ? JSON.parse(decodeURIComponent(selectedPlayersParam)) : []

  // Set room code and stake from URL parameters if available
  useEffect(() => {
    if (roomCodeParam) {
      setRoomCode(roomCodeParam.toUpperCase())
    }
    if (stake) {
      setUserStakeAmount(stake)
    }
  }, [roomCodeParam, stake])

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
        stake: userStakeAmount || '',
        isHost: 'false',
        hostBet: hostData?.bet || ''
      })
      router.push(`/competition?${params.toString()}`)
    } else if (roomStatus === 'error') {
      console.error('Room error:', error)
      setIsJoining(false)
    }
  }, [roomStatus, roomId, error, setPlayerReady, router, selectedPlayersParam, formation, bet, hostData])

  const handleGetRoomInfo = () => {
    if (!roomCode.trim()) {
      return
    }
    
    getRoomInfo(roomCode.toUpperCase())
    setShowRoomInfo(true)
  }

  const handleJoinRoom = () => {
    if (!roomInfo || !userStakeAmount || parseFloat(userStakeAmount) !== roomInfo.requiredStake) {
      return
    }

    setIsJoining(true)
    console.log('Joining room:', roomCode)
    
    joinRoom(roomCode.toUpperCase(), {
      selectedPlayers,
      formation: formation || '2-2-1',
      bet: roomInfo.betType,
      stake: roomInfo.requiredStake
    })
  }

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow positive numbers with up to 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setUserStakeAmount(value)
    }
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

            {!showRoomInfo ? (
              <Button
                onClick={handleGetRoomInfo}
                disabled={!roomCode.trim()}
                className="w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-300"
              >
                <Users className="w-5 h-5 mr-2" />
                Get Room Info
              </Button>
            ) : (
              <Button
                onClick={handleJoinRoom}
                disabled={!roomInfo || !userStakeAmount || parseFloat(userStakeAmount) !== roomInfo.requiredStake || isJoining}
                className="w-full py-3 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg transition-all duration-300"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Joining Room...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    Join Room {roomInfo?.requiredStake ? `(${roomInfo.requiredStake} XTZ)` : ''}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Room Info Display */}
          {showRoomInfo && roomInfo && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Room Requirements</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-300">
                  <span>Bet Type:</span>
                  <span className={`font-semibold ${roomInfo.betType === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                    {roomInfo.betType}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Required Stake:</span>
                  <span className="font-semibold text-yellow-400">{roomInfo.requiredStake} XTZ</span>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <label htmlFor="stakeAmount" className="block text-white font-semibold mb-2">
                  Your Stake Amount
                </label>
                <div className="relative">
                  <Input
                    id="stakeAmount"
                    type="text"
                    placeholder={`Enter ${roomInfo.requiredStake}`}
                    value={userStakeAmount}
                    onChange={handleStakeChange}
                    className="text-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    XTZ
                  </div>
                </div>
                {userStakeAmount && parseFloat(userStakeAmount) !== roomInfo.requiredStake && (
                  <p className="text-red-400 text-sm mt-2">
                    Must match required stake: {roomInfo.requiredStake} XTZ
                  </p>
                )}
                <p className="text-gray-400 text-sm mt-2">
                  Your bet will be automatically set to {roomInfo.betType}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-2">How to join:</h3>
            <ol className="text-gray-300 text-sm space-y-1">
              {!showRoomInfo ? (
                <>
                  <li>1. Ask your opponent for their room code</li>
                  <li>2. Enter the 8-character room code above</li>
                  <li>3. Click "Get Room Info" to see requirements</li>
                  <li>4. Match the stake amount and betting type to join</li>
                </>
              ) : (
                <>
                  <li>1. Your bet type is automatically set to match the room</li>
                  <li>2. Enter the exact stake amount required</li>
                  <li>3. Click "Join Room" to request entry</li>
                  <li>4. Wait for host approval to start the tournament</li>
                </>
              )}
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