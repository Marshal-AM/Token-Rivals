# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Next.js)
- `npm run dev` - Start Next.js development server (port 3000)
- `npm run build` - Build production Next.js application
- `npm run start` - Start production Next.js server
- `npm run lint` - Run Next.js linting

### WebSocket Server
- `node server.js` - Start the room management WebSocket server (port 8001)
- Server health check: `http://localhost:8001/health`

### Smart Contract Integration
- Contract Address: `0x26d215752f68bc2254186f9f6ff068b8c4bdfd37`
- Network: Etherlink Testnet (Chain ID: 128123)
- Native Currency: XTZ (Tezos)
- RPC URL: `https://128123.rpc.thirdweb.com`
- Block Explorer: `https://testnet.explorer.etherlink.com`

### Full Development Setup
1. Install dependencies: `npm install`
2. Set up environment variables in `.env.local`
3. Start WebSocket server: `node server.js`
4. Start frontend: `npm run dev` (in new terminal)
5. Connect wallet to Etherlink Testnet and ensure you have testnet XTZ

## Architecture Overview

### System Components

**Frontend (Next.js 15 + React 19)**
- Tournament-based cryptocurrency trading game
- Real-time price tracking using Pyth Network
- WebSocket-based room management for 1v1 tournaments
- Reown AppKit wallet integration for Web3 connectivity
- Mobile-responsive UI with Tailwind CSS and shadcn/ui components

**WebSocket Server (Node.js)**
- Handles room creation, joining, and handshaking
- Manages tournament lifecycle and player connections
- Validates blockchain stake deposits before allowing room entry
- Provides detailed logging and health monitoring

**Smart Contract (Solidity - Deployed)**
- Tournament escrow system for secure XTZ staking
- Deployed on Etherlink Testnet at `0x26d215752f68bc2254186f9f6ff068b8c4bdfd37`
- Winner-takes-all payout system with emergency withdrawal
- Event-driven stake verification and tournament completion

### Key Data Flow

1. **Wallet Connection**: Players connect Web3 wallet via Reown AppKit
2. **Squad Selection**: Players select crypto tokens (BTC, ETH, SOL, etc.) for their squad
3. **Betting & Staking**: Choose LONG/SHORT and set XTZ stake amount from wallet balance
4. **Tournament Creation**: Host stakes XTZ in smart contract and creates WebSocket room
5. **Room Joining**: Guests must stake matching XTZ amount and bet type to join
6. **Stake Verification**: Smart contract events verify both players have deposited XTZ
7. **Tournament**: 60-second live tournament with real-time Pyth price feeds
8. **Winner Payout**: Smart contract automatically transfers all XTZ stakes to winner

### Price Feeds & Tournament Logic

**Pyth Network Integration**
- Real-time price feeds for 13 cryptocurrencies
- 1-second price caching to avoid rate limiting
- Price feed IDs mapped in `lib/tournament-service.ts:4-23`

**Tournament Scoring**
- LONG betting: Higher percentage increase wins
- SHORT betting: Lower percentage decrease wins (less negative)
- Score calculation uses average percentage change across squad tokens

### Critical Environment Variables

- `NEXT_PUBLIC_WS_URL` - WebSocket server URL (default: `ws://localhost:8001`)
- `NEXT_PUBLIC_DEBUG` - Enable detailed logging

### File Structure Patterns

**Pages** (`app/` directory - Next.js App Router)
- Each page represents a step in the tournament flow
- Squad selection → Betting selection → Room creation/joining → Competition

**Hooks** (`hooks/` directory)
- `use-tournament.ts` - Tournament state management and real-time updates
- `use-room-websocket.ts` - WebSocket connection management
- Custom hooks follow React patterns with cleanup and error handling

**Services** (`lib/` directory)
- `tournament-service.ts` - Core tournament logic and Pyth Network integration
- Singleton service pattern with price caching

### Development Notes

**Testing the System**
1. Run both server and frontend
2. Open multiple browser tabs/windows
3. First player: Select squad → Choose bet & stake → Create room
4. Second player: Select squad → Choose bet & stake → Join room → Enter room code → Match requirements
5. Both players ready up to start 60-second tournament

**XTZ Staking Requirements**
- Both players must stake the exact same XTZ amount to participate
- Room creator sets the required XTZ stake amount and bet type (LONG/SHORT)
- Room joiner must match both XTZ stake and bet type to enter
- Smart contract validates XTZ deposits via blockchain events
- WebSocket server ensures stake verification before allowing tournament start

**WebSocket Debugging**
- Server provides detailed timestamped logs
- Health endpoint shows active rooms and clients
- Frontend logs tournament progress and WebSocket events

**Price Feed Testing**
- Pyth test endpoint available in `pythtest/main.js`
- Price updates occur every second during tournaments
- Initial prices set at tournament start (T0)

### Smart Contract Deployment

The `TournamentEscrow.sol` contract is production-ready with:
- OpenZeppelin security patterns
- Support for both ETH and ERC20 deposits
- Emergency withdrawal capabilities
- Owner-only tournament management

### Build Configuration

Next.js config ignores TypeScript/ESLint errors during builds for rapid prototyping. In production, enable strict checking by removing `ignoreDuringBuilds` and `ignoreBuildErrors` flags.