import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { embeddedWallet } from "@civic/auth-web3/wagmi";

// Define Etherlink Testnet as a custom chain
const etherlinkTestnet = {
  id: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '128123'),
  name: 'Etherlink Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Tezos',
    symbol: 'XTZ',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://128123.rpc.thirdweb.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherlink Explorer',
      url: 'https://testnet.explorer.etherlink.com'
    },
  },
} as const;

export const wagmiConfig = createConfig({
  chains: [etherlinkTestnet, mainnet, sepolia],
  transports: {
    [etherlinkTestnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    embeddedWallet(),
  ],
});

export { etherlinkTestnet };