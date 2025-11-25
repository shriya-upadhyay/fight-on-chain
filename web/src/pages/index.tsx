import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Navbar from '../components/Navbar';
import Link from 'next/link';  


export default function Home() {
  const { address, isConnected } = useAccount();  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-red-900/30 selection:text-white overflow-x-hidden">
      <Head>
      <title>Fight On-Chain | USC Blockchain</title>
      <meta name="description" content="The semester-long decentralized survivor game." />
      </Head>
      {/* --- Ambient Background Gradients (Softer & Warmer) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-gradient-to-br from-red-900/10 to-transparent rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-900/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <Navbar variant="floating" />

      {/* --- Hero Section --- */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20 text-center">
        
        <div className="space-y-8 max-w-4xl mx-auto animate-fade-in-up">
          
          {/* Season Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
            <span className="text-xs font-medium text-neutral-400 tracking-widest uppercase font-sans">
              Season 1: Genesis
            </span>
          </div>

          {/* Main Title - Editorial Serif Style */}
          <h1 className="text-3xl md:text-8xl font-serif font-medium tracking-tight leading-[1.05] text-neutral-100">
            Provenance is <br />
            <span className="italic text-neutral-500">earned, not bought.</span>
          </h1>

          {/* Subtitle - Clean Sans for Contrast */}
          <p className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto leading-relaxed font-light">
            The official social strategy game of USC Blockchain. 
            Verify your attendance, build your reputation, and outlast the cohort.
          </p>

          {/* Action Area */}
          <div className="flex flex-col items-center gap-8 pt-8">
            <div className="transform transition-transform hover:scale-105 duration-500">
              {isConnected ? (
                <Link href="/dashboard">
                  <button className="px-8 py-4 rounded-full bg-[#990000] hover:bg-[#b91c1c] text-white font-medium text-base transition-colors shadow-lg shadow-red-900/20 hover:shadow-xl hover:shadow-red-900/30">
                    Enter Game
                  </button>
                </Link>
              ) : (
                <ConnectButton label="Connect Wallet" />
              )}
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="flex -space-x-2 overflow-hidden">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-black bg-neutral-800" />
                  ))}
               </div>
               <p className="text-xs font-medium text-neutral-500">142 Students Active</p>
            </div>
          </div>
        </div>
      </main>

      {/* --- Bento Grid Stats Section --- */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: The Manifesto */}
          <div className="md:col-span-2 p-10 rounded-[2rem] bg-[#111] border border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-900/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <h3 className="text-3xl font-serif mb-6 text-neutral-200">The Protocol</h3>
            <div className="space-y-6">
                <ProtocolStep number="01" title="Whitelist" desc="Secure your invite via the club registration form." />
                <ProtocolStep number="02" title="Verify" desc="Prove attendance at club events on-chain." />
                <ProtocolStep number="03" title="Ascend" desc="Accumulate points. Avoid weekly elimination." />
            </div>
          </div>

          {/* Card 2: Live Data */}
          <div className="md:col-span-1 p-10 rounded-[2rem] bg-[#111] border border-white/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-red-950/20 to-transparent opacity-50" />
            
            <div>
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Status</p>
                <p className="text-4xl font-serif text-white">Week 01</p>
            </div>
            
            <div className="space-y-4 mt-12 relative z-10">
                <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                    <span className="text-sm text-neutral-500">Tribe</span>
                    <span className="text-base text-neutral-200 font-serif">Genesis</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                    <span className="text-sm text-neutral-500">Prize Pool</span>
                    <span className="text-base text-neutral-200 font-serif">0.5 ETH</span>
                </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

// --- Helper Components ---

function ProtocolStep({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <div className="flex gap-4 items-start group/step">
            <span className="font-serif text-neutral-600 italic text-lg group-hover/step:text-red-500 transition-colors">{number}</span>
            <div>
                <h4 className="text-neutral-200 font-medium mb-1">{title}</h4>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
