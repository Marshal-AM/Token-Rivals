'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { CivicAuthProvider } from "@civic/auth-web3/nextjs"
import { WalletProvider } from '@/contexts/civic-wallet-context'
import { WebSocketProvider } from '@/contexts/websocket-context'
import { wagmiConfig, etherlinkTestnet } from '@/lib/wagmi-config'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <CivicAuthProvider initialChain={etherlinkTestnet}>
          <WebSocketProvider>
            <WalletProvider>
              {children}
            </WalletProvider>
          </WebSocketProvider>
        </CivicAuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}