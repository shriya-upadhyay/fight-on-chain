import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

// WalletConnect is optional - only needed for mobile wallets and WalletConnect-compatible wallets
// For desktop browsers with MetaMask/Coinbase Wallet, you can use a dummy project ID
// Get a free one at https://cloud.walletconnect.com/ if you want mobile support
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '00000000000000000000000000000000000000000000';

export const config = getDefaultConfig({
  appName: 'Fight On-Chain',
  projectId: walletConnectProjectId,
  chains: process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'false' ? [mainnet] : [sepolia],
  ssr: true,
});
