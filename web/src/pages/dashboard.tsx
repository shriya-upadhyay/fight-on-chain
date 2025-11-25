import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi';
import Link from 'next/link';
import { usePlayerProfile } from '../hooks/usePlayerProfile';
import Navbar from '../components/Navbar';  
import FightOnChain from '../utils/FightOnChain.json';

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '') as `0x${string}`;

export default function Dashboard() {
    const { address, isConnected } = useAccount();
    const { data: ensName } = useEnsName({ address });  
    const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined });  
    const {profile, isError, isLoading} = usePlayerProfile(address);
    const formattedJoinDate = profile?.joinDate? new Date(Number(profile.joinDate) * 1000).toLocaleDateString(): 'Unknown';
    
    console.log('profile', profile);
    console.log('transmissions', profile?.transmissions);
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-red-900/30 selection:text-white">
            <Head>
                <title>Dashboard | Fight On-Chain</title>
            </Head>

            <Navbar variant="standard" />

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
            {!isConnected ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center border border-white/10">
              <span className="text-3xl">🔒</span>
            </div>
            <h2 className="text-3xl font-serif text-white">Access Restricted</h2>
            <p className="text-neutral-500 max-w-md mx-auto">
              Connect your wallet to retrieve your personnel file and operational status.
            </p>
            <div className="scale-110">
                <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- LEFT COL: Identity & Actions (4 Cols) --- */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Identity Card */}
              <div className="p-8 rounded-[2rem] bg-[#111] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20">
                {ensAvatar ? (
                <img 
                    src={ensAvatar} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full mix-blend-overlay"
                />
            ) : (
                // Fallback: Generate avatar from address (like Dicebear)
                <div 
                    className="w-24 h-24 bg-neutral-800 rounded-full mix-blend-overlay"
                    style={{
                        backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${address})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
            )}
                </div>
                
                <div className="relative z-10">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase mb-6 ${
                    profile?.isActive 
                        ? 'bg-green-900/20 border border-green-900/50 text-green-400'
                        : 'bg-red-900/20 border border-red-900/50 text-red-400'
                    }`}>
                        {localStorage.getItem('is_admin') === 'true' ? 
                        'Status: Admin' : 
                        'Status: ' + (profile?.isActive ? 'Active' : 'Inactive')
                        }
                    </div>
                    
                    <h1 className="text-4xl font-serif text-white mb-1">
                        {profile?.name || 'Unknown'}
                    </h1>
                    <p className="text-neutral-500 text-sm font-mono mb-8">
                        {address?.slice(0,20)}...
                    </p>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                            <span className="text-neutral-400 text-sm">Tribe</span>
                            <span className="text-white font-serif">{profile?.tribe || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                            <span className="text-neutral-400 text-sm">Joined</span>
                            <span className="text-white font-serif">{formattedJoinDate || 'Unknown'}</span>
                        </div>
                    </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-8 rounded-[2rem] bg-gradient-to-b from-red-950/20 to-[#111] border border-white/5">
                <h3 className="text-xl font-serif text-white mb-6">Operations</h3>
                <Link
                    href="/submitevidence"
                    className="block text-center w-full py-4 bg-white text-black font-medium rounded-xl hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5 mb-3"
                >
                    Submit Evidence
                </Link>
                <p className="text-center text-xs text-neutral-500">
                    Upload proof of attendance to earn points.
                </p>
              </div>
            </div>

            {/* --- RIGHT COL: Stats & History (8 Cols) --- */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Vitals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatBox label="Reputation" value={profile?.score || 0} sub="Points" />
                    <StatBox label="Global Rank" value="#42" sub="Top 30%" />
                    <StatBox label="Safety Margin" value="+15" sub="Pts above Cutoff" highlight />
                </div>

                {/* Activity Feed */}
                <div className="p-8 rounded-[2rem] bg-[#111] border border-white/5 min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-serif text-white">Recent Transmissions</h3>
                        <button className="text-sm text-neutral-500 hover:text-white transition-colors">View All</button>
                    </div>

                    <div className="space-y-0">
                        {profile?.transmissions && profile.transmissions.length > 0 ? (
                            profile.transmissions.map((transmission: any) => {
                                return (
                                    <ActivityItem 
                                        key={transmission.id}
                                        title={transmission.name || 'Untitled Event'}
                                        date={transmission.event_date ? new Date(transmission.event_date).toLocaleDateString() : 'Unknown'}
                                        points={transmission.points ? `+${transmission.points}` : '--'}
                                        status={transmission.minted ? 'Minted' : transmission.approved ? 'Verified' : 'Pending'}
                                    />
                                );
                            })
                        ) : (
                            <p className="text-neutral-500 text-center py-8 italic">No transmissions yet.</p>
                        )}
                    </div>
                </div>

            </div>
          </div>
        )}
            </main>
        </div>
    );
}

function StatBox({ label, value, sub, highlight }: any) {
    return (
        <div className={`p-6 rounded-[2rem] border ${highlight ? 'bg-red-900/10 border-red-900/30' : 'bg-[#111] border-white/5'}`}>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">{label}</p>
            <p className="text-4xl font-serif text-white mb-1">{value}</p>
            <p className={`text-sm ${highlight ? 'text-red-400' : 'text-neutral-600'}`}>{sub}</p>
        </div>
    )
}

function ActivityItem({ title, date, points, status }: any) {
    const isPending = status === 'Pending';
    return (
        <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group hover:bg-white/5 px-4 -mx-4 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <div>
                    <p className="text-white font-medium">{title}</p>
                    <p className="text-xs text-neutral-500">{date}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-white font-serif">{points}</p>
                <p className={`text-xs ${isPending ? 'text-yellow-500' : 'text-neutral-600'}`}>{status}</p>
            </div>
        </div>
    )
}