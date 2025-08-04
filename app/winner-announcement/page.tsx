"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Trophy, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import { MobileFrame } from "@/components/mobile-frame"
import { useRoomWebSocket } from "@/hooks/use-room-websocket"

export default function WinnerAnnouncementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const tournamentId = searchParams.get("tournamentId")
  const winnerAddress = searchParams.get("winnerAddress")
  const winnerTxHash = searchParams.get("winnerTxHash")
  const stakeAmount = searchParams.get("stakeAmount")

  const { winnerInfo } = useRoomWebSocket()

  // Get winner information from WebSocket, localStorage, or URL params
  const getWinnerInfo = () => {
    // First try WebSocket
    if (winnerInfo?.winnerAddress && winnerInfo?.txHash) {
      return winnerInfo
    }
    
    // Then try localStorage (only on client side)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('winnerInfo')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.winnerAddress && parsed.txHash) {
            console.log('📦 Retrieved winner info from localStorage:', parsed)
            return parsed
          }
        }
      } catch (error) {
        console.error('Error parsing localStorage winner info:', error)
      }
    }
    
    // Finally fallback to URL params
    return { winnerAddress, txHash: winnerTxHash }
  }

  const finalWinnerInfo = getWinnerInfo()
  const finalWinnerAddress = finalWinnerInfo.winnerAddress
  const finalWinnerTxHash = finalWinnerInfo.txHash

  // Check if we have any winner information
  const hasWinnerInfo = finalWinnerAddress && finalWinnerTxHash

  // Debug: Log winner info
  useEffect(() => {
    console.log('🎯 [DEBUG] Winner announcement page winner info:', {
      winnerInfo,
      urlWinnerAddress: winnerAddress,
      urlWinnerTxHash: winnerTxHash,
      finalWinnerInfo,
      finalWinnerAddress,
      finalWinnerTxHash,
      hasWinnerInfo
    })
  }, [winnerInfo, winnerAddress, winnerTxHash, finalWinnerInfo, finalWinnerAddress, finalWinnerTxHash, hasWinnerInfo])

  const handleViewTransaction = () => {
    const txHash = finalWinnerTxHash
    if (txHash) {
      const explorerUrl = `https://explorer.etherlink.com/tx/${txHash}`
      window.open(explorerUrl, '_blank')
    }
  }

  const handleBackToHome = () => {
    // Clear winner info from localStorage (only on client side)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('winnerInfo')
      console.log('🗑️ Cleared winner info from localStorage')
    }
    router.push('/')
  }

  if (error) {
    return (
      <MobileFrame>
        <div className="flex flex-col h-full bg-gray-900">
          <div className="p-4 text-center">
            <h1 className="text-xl font-bold text-white">Winner Announcement Error</h1>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <Alert className="max-w-md border-red-500">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          </div>
          <div className="p-4">
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="w-full border-gray-600 text-gray-400 hover:bg-gray-700"
            >
              Go Home
            </Button>
          </div>
        </div>
      </MobileFrame>
    )
  }

  return (
    <MobileFrame>
      <div className="h-full overflow-y-auto bg-gray-900">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBackToHome}
              className="text-gray-400 hover:text-white mr-4"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-white">Tournament Complete</h1>
            </div>
          </div>

          {/* Winner Information */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Tournament Complete</h2>
            </div>
            
            {hasWinnerInfo ? (
              <div className="text-white">
                <p className="text-lg mb-2">🏆 Winner Address:</p>
                <div className="bg-white/20 rounded p-3 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-mono">
                      {finalWinnerAddress}
                    </div>
                  </div>
                </div>
                <p className="text-sm opacity-90">
                  Prize Amount: {stakeAmount ? (parseFloat(stakeAmount) * 2).toFixed(4) : '0'} XTZ
                </p>
              </div>
            ) : (
              <div className="text-white">
                <p className="text-lg mb-2">⏳ Winner information is being processed...</p>
                <p className="text-sm opacity-90">
                  Please wait while the winner announcement transaction is being confirmed on the blockchain.
                </p>
              </div>
            )}
          </div>

          {/* Transaction Information */}
          {hasWinnerInfo && finalWinnerTxHash && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-white">Winner Transaction</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Transaction Hash:</p>
                <p className="font-mono text-sm text-white bg-gray-700 rounded p-2 break-all">
                  {finalWinnerTxHash}
                </p>
              </div>
              
              <Button
                onClick={handleViewTransaction}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="w-full border-gray-600 text-gray-400 hover:bg-gray-700"
            >
              🏠 Back to Home
            </Button>
          </div>
        </div>
      </div>
    </MobileFrame>
  )
} 