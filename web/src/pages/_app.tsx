import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, midnightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../wagmi'; 
import { Inter, Merriweather } from 'next/font/google';
import type { AppProps } from 'next/app';

const client = new QueryClient();

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter', 
});

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider theme={midnightTheme({
          accentColor: '#990000', // USC Cardinal
          borderRadius: 'large',
        })}>
          {/* 2. Inject the variables here so Tailwind can "see" them */}
          <div className={`${inter.variable} ${merriweather.variable} font-sans min-h-screen`}>
            <Component {...pageProps} />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;