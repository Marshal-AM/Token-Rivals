"use client"

import { TournamentResult } from '@/lib/tournament-service';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TournamentResultProps {
  result: TournamentResult;
  hostBet: 'LONG' | 'SHORT';
  guestBet: 'LONG' | 'SHORT';
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export function TournamentResult({ 
  result, 
  hostBet, 
  guestBet, 
  onPlayAgain, 
  onBackToHome 
}: TournamentResultProps) {
  const getWinnerText = () => {
    switch (result.winner) {
      case 'host':
        return 'Host Wins!';
      case 'guest':
        return 'Guest Wins!';
      case 'tie':
        return 'It\'s a Tie!';
      default:
        return 'Unknown Result';
    }
  };

  const getWinnerIcon = () => {
    switch (result.winner) {
      case 'host':
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 'guest':
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 'tie':
        return <Minus className="w-8 h-8 text-gray-400" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0) return 'text-green-400';
    if (score < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getScoreIcon = (score: number) => {
    if (score > 0) return <TrendingUp className="w-4 h-4" />;
    if (score < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-md mx-auto">
      {/* Winner Display */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          {getWinnerIcon()}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{getWinnerText()}</h2>
        <p className="text-gray-400">Tournament Complete</p>
      </div>

      {/* Score Details */}
      <div className="space-y-4 mb-6">
        {/* Host Score */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Host ({hostBet})</h3>
            <div className={`flex items-center space-x-2 ${getScoreColor(result.hostScore)}`}>
              {getScoreIcon(result.hostScore)}
              <span className="font-bold">{result.hostScore.toFixed(2)}</span>
            </div>
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            <div>Final Value: ${result.finalHostValue.toFixed(2)}</div>
            <div>Change: {result.hostPercentageChange.toFixed(2)}%</div>
          </div>
        </div>

        {/* Guest Score */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Guest ({guestBet})</h3>
            <div className={`flex items-center space-x-2 ${getScoreColor(result.guestScore)}`}>
              {getScoreIcon(result.guestScore)}
              <span className="font-bold">{result.guestScore.toFixed(2)}</span>
            </div>
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            <div>Final Value: ${result.finalGuestValue.toFixed(2)}</div>
            <div>Change: {result.guestPercentageChange.toFixed(2)}%</div>
          </div>
        </div>
      </div>

      {/* How Scoring Works */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h4 className="text-white font-semibold mb-2">How Scoring Works:</h4>
        <div className="text-sm text-gray-400 space-y-1">
          <div>• <span className="text-green-400">LONG</span>: Score = % increase in squad value</div>
          <div>• <span className="text-red-400">SHORT</span>: Score = -% decrease in squad value</div>
          <div>• Higher score wins the tournament</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onPlayAgain}
          className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300"
        >
          Play Again
        </button>
        <button
          onClick={onBackToHome}
          className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-300"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
} 