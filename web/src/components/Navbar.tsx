import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface NavbarProps {
  variant?: 'floating' | 'standard' | 'admin';
  showLogoDot?: boolean;
}

export default function Navbar({ variant = 'standard', showLogoDot = true }: NavbarProps) {
  const { isConnected } = useAccount();

  // Floating variant (for homepage)
  if (variant === 'floating') {
    return (
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90vw]">
        <div className="flex items-center gap-6 px-6 py-3 rounded-full bg-[#111]/80 backdrop-blur-xl border border-white/5 shadow-2xl shadow-black/50">
          <Link href="/" className="flex items-center gap-3">
            {showLogoDot && (
              <div className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected ? 'bg-green-500' : 'bg-red-600'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  isConnected ? 'bg-green-600' : 'bg-red-700'
                }`}></span>
              </div>
            )}
            <span className="text-lg font-serif font-medium tracking-tight text-neutral-100">
              Fight On-Chain
            </span>
          </Link>
          
          <div className="h-4 w-[1px] bg-white/10" />
          
          <div className="scale-90 origin-right">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
          </div>
        </div>
      </nav>
    );
  }

  // Admin variant
  if (variant === 'admin') {
    return (
      <nav className="border-b border-white/10 bg-[#111] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="font-mono font-bold tracking-widest text-red-500">ORACLE_MODE</span>
        </div>
        <ConnectButton />
      </nav>
    );
  }

  // Standard variant (default)
  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {showLogoDot && (
            <div className="w-2 h-2 bg-red-600 rounded-full group-hover:animate-pulse" />
          )}
          <span className="font-serif font-medium text-neutral-300">Fight On-Chain</span>
        </Link>
        <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
      </div>
    </nav>
  );
}
