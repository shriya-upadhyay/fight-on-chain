import Head from "next/head";
import Navbar from "../components/Navbar";
import { useAllPlayers } from "../hooks/useAllPlayers";
import FightOnChain from "../utils/FightOnChain.json";
const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '') as `0x${string}`;

const mockPlayers = [
    { walletAddress: '0x1234567890abcdef1234567890abcdef12345678', name: 'Ava Solaris', score: BigInt(240), tribe: 'Genesis', joinDate: "2025-12-17T03:24:00-08:00", isActive: true },
    { walletAddress: '0x2234567890abcdef1234567890abcdef12345678', name: 'Kai Nebula', score: BigInt(210), tribe: 'Genesis', joinDate: "2025-12-17T03:24:00-08:00", isActive: true },
    { walletAddress: '0x3234567890abcdef1234567890abcdef12345678', name: 'Rin Atlas', score: BigInt(198), tribe: 'Genesis', joinDate: "2025-12-17T03:24:00-08:00", isActive: true },
    { walletAddress: '0x4234567890abcdef1234567890abcdef12345678', name: 'Nova Hyperion', score: BigInt(150), tribe: 'Genesis', joinDate: "2025-12-17T03:24:00-08:00", isActive: true },
    { walletAddress: '0x5234567890abcdef1234567890abcdef12345678', name: 'Echo Meridian', score: BigInt(120), tribe: 'Aurora', joinDate: "2025-12-17T03:24:00-08:00", isActive: true },
];

function Leaderboard() {
    const { players, isLoading, isError } = useAllPlayers();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-red-900/30 selection:text-white overflow-x-hidden">
            <Head>
                <title>Leaderboard | Fight On-Chain</title>
            </Head>
            <Navbar variant="standard" />

            <main className="pt-32 pb-16 px-6 max-w-5xl mx-auto space-y-8">
                <header className="space-y-2 text-center">
                    <p className="text-xs font-mono tracking-[0.3em] text-red-500 uppercase">Rankings</p>
                    <h1 className="text-4xl font-serif text-white">Leaderboard</h1>
                    <p className="text-sm text-neutral-500">Top performers in the game</p>
                </header>

                {isLoading && players.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-neutral-500">Loading leaderboard...</p>
                    </div>
                )}

                {isError && (
                    <div className="text-center py-20">
                        <p className="text-red-500">Error loading leaderboard</p>
                    </div>
                )}

                {!isError && (
                    <div className="space-y-4">
                        {players.map((player: any, index: number) => (
                            <div 
                                key={player.walletAddress} 
                                className={`p-6 rounded-xl border transition-colors ${
                                    (index % 4) === 0 
                                        ? 'bg-red-900/10 border-red-900/30' 
                                        : (index % 4) === 1
                                        ? 'bg-neutral-900/50 border-white/10'
                                        : (index % 4) === 2
                                        ? 'bg-amber-900/10 border-amber-900/30'
                                        : 'bg-[#111] border-white/5'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl font-bold ${
                                            (index % 4) === 0 
                                                ? 'bg-red-600 text-white' 
                                                : (index % 4) === 1
                                                ? 'bg-neutral-700 text-white'
                                                : (index % 4) === 2
                                                ? 'bg-amber-700 text-white'
                                                : 'bg-white/5 text-neutral-400'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-serif text-white">{player.name || 'Unknown'}</h3>
                                            <p className="text-xs text-neutral-500 font-mono">{player.walletAddress.slice(0, 6)}...{player.walletAddress.slice(-4)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-serif text-white">{Number(player.score)}</p>
                                        <p className="text-xs text-neutral-500">points</p>
                                    </div>
                                </div>
                                {player.tribe && (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <span className="text-xs text-neutral-500 uppercase tracking-widest">Tribe: </span>
                                        <span className="text-sm text-neutral-300">{player.tribe}</span>
                                        <div className="text-right">
                                            <span className="text-xs text-neutral-500 uppercase tracking-widest">Joined: </span>
                                            <span className="text-sm text-neutral-300">
                                                {player.joinDate
                                                    ? new Date(player.joinDate * 1000).toLocaleDateString()
                                                    : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>

                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Leaderboard;