import React from 'react';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAccount, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAdminInbox } from '../hooks/useAdminInbox';
import { useIsAdmin } from '../hooks/useIsAdmin';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabaseClient';
import FightOnChain from '../utils/FightOnChain.json';

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '') as `0x${string}`;


export default function Admin() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { pending, verified, approveSubmission, rejectSubmission, markAsMinted } = useAdminInbox();
  const { writeContract, isPending: isTxPending } = useWriteContract();
  const [adminName, setAdminName] = useState('');
  const [adminWalletAddress, setAdminWalletAddress] = useState(''); 
  const [playerName, setPlayerName] = useState('');
  const [playerWalletAddress, setPlayerWalletAddress] = useState('');
  const [playerScore, setPlayerScore] = useState('');
  const [playerTribe, setPlayerTribe] = useState('');

  const { isAdmin, isLoading: isCheckingAdmin } = useIsAdmin(address);

  // Wait for contract check to complete, then verify admin status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isCheckingAdmin) return; // Don't redirect while still checking
    if (isAdmin === undefined) return; // Don't redirect if we don't have an answer yet
    
    // Contract check is complete - use contract as source of truth
    const storedIsAdmin = localStorage.getItem('is_admin') === 'true';
    
    console.log('Admin check complete:', {
      storedIsAdmin,
      isAdmin,
      isCheckingAdmin
    });
    
    // Contract is source of truth - if contract says not admin, redirect
    // (localStorage might not be set yet, but contract check is definitive)
    if (isAdmin === false) {
      console.log('🚫 Not admin according to contract - redirecting to dashboard...');
      router.push('/dashboard');
    }
    // If contract says admin but localStorage doesn't, that's okay - Navbar will set it
  }, [isAdmin, isCheckingAdmin, router]);

  const handleAddPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: FightOnChain.abi,
      functionName: 'addPlayer',
      args: [playerWalletAddress, playerScore],
    });

    if (!playerWalletAddress || !playerScore || !playerTribe || !playerName) return alert("Fill in all fields");

    try {
        const { data, error } = await supabase
        .from("users")
        .upsert({
            name: playerName,
            wallet_address: playerWalletAddress,
            is_admin: false,
            score: playerScore,
            tribe: playerTribe,
        }, { onConflict: "wallet_address" }); 

        console.log(data, error)

        console.log(playerName, playerWalletAddress, playerScore, playerTribe)

        if (error) throw error;

        alert(`Player ${playerName} added!`);
        setPlayerName("");
        setPlayerWalletAddress("");
        setPlayerScore("");
        setPlayerTribe("");
    } catch (err: any) {
        console.error(err);
        alert(err.message || "Something went wrong adding the player");
    }
  };
  const handleAddAdmin =  async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // writeContract({
    //   address: '0xYourContractAddress...',
    // //   abi: CryptoClubGameV3.abi,
    //   functionName: 'addAdmin',
    //   args: [adminWalletAddress, adminName],
    // });

    if (!playerWalletAddress || !playerName) return alert("Fill in all fields");

  try {
    const { error } = await supabase
      .from("users")
      .upsert({
        wallet_address: playerWalletAddress,
        name: playerName,
        is_admin: false,
        score: playerScore ? parseInt(playerScore) : 0,
        tribe: playerTribe || null
      }, { onConflict: "wallet_address" });

    if (error) throw error;

    alert(`Player ${playerName} added!`);
    setPlayerName("");
    setPlayerWalletAddress("");
    setPlayerScore("");
    setPlayerTribe("");
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Something went wrong adding the player");
  }
  };
  // --- The "Big Red Button" Logic ---
  const handleBatchMint = () => {
    if (verified.length === 0) return;

    // 1. Prepare the data arrays for Solidity
    const addresses = verified.map(s => s.walletAddress);
    const amounts = verified.map(s => BigInt(s.points));
    // Note: Our contract expects a single reason string for the batch, 
    // or we can just pass "Weekly Verification" to save gas.
    
    // 2. Call the Contract
    // writeContract({
    //   address: '0xYourContractAddress...',
    // //   abi: CryptoClubGameV3.abi,
    //   functionName: 'awardPointsBatch',
    //   args: [addresses, amounts, "Weekly Verification"],
    // }, {
    //   onSuccess: () => {
    //     // 3. If TX succeeds, update Firebase to remove them from the list
    //     // In production, wait for tx.wait() receipt before doing this!
    //     markAsMinted(verified.map(s => s.id));
    //     alert("Batch Mint Executed! Points distributed.");
    //   }
    // });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-900/30">
      <Head><title>Admin Dashboard | Fight On-Chain</title></Head>
      
      <Navbar variant="admin" />  {/* Replace nav section */}
      
      {(!isConnected || isCheckingAdmin) ? (
         <div className="pt-32 p-20 text-center text-neutral-500">
           {!isConnected ? 'Connect Officer Wallet' : 'Verifying admin status...'}
         </div>
      ) : !isAdmin ? (
         <div className="pt-32 p-20 text-center text-red-500">
           <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
           <p className="text-neutral-400">You do not have admin privileges.</p>
         </div>
      ) : (
        <main className="pt-32 max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- COLUMN 1: THE INBOX (Pending) --- */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif">Inbox ({pending.length})</h2>
                <span className="text-xs text-neutral-500 uppercase tracking-widest">Awaiting Review</span>
            </div>
            
            <div className="space-y-4">
                {pending.length === 0 && <p className="text-neutral-600 italic">No pending submissions.</p>}
                {pending.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-[#111] border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="font-bold text-lg">{item.action_name}</p>
                                <p className="text-xs text-neutral-500 font-mono">{item.walletAddress}</p>
                            </div>
                            <span className="px-2 py-1 rounded bg-white/10 text-xs font-bold">+{item.points} Pts</span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <button 
                                onClick={() => rejectSubmission(item.id)}
                                className="py-2 rounded-lg border border-red-900/50 text-red-500 hover:bg-red-900/20 text-xs font-bold uppercase"
                            >
                                Reject
                            </button>
                            <button 
                                onClick={() => approveSubmission(item.id)}
                                className="py-2 rounded-lg bg-green-900/20 border border-green-900/50 text-green-500 hover:bg-green-900/30 text-xs font-bold uppercase"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* --- COLUMN 2: THE STAGING AREA (Verified) --- */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif text-green-500">Staging ({verified.length})</h2>
                <span className="text-xs text-neutral-500 uppercase tracking-widest">Ready to Mint</span>
            </div>

            <div className="p-6 rounded-2xl border border-green-900/30 bg-green-900/5 space-y-6">
                <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Total Transactions</span>
                    <span className="text-white font-mono">1 (Batch)</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Total Points</span>
                    <span className="text-white font-mono">
                        {verified.reduce((acc, curr) => acc + curr.points, 0)}
                    </span>
                </div>

                <button
                    onClick={handleBatchMint}
                    disabled={verified.length === 0 || isTxPending}
                    className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-lg shadow-lg shadow-green-900/20 transition-all"
                >
                    {isTxPending ? 'Minting...' : 'MINT BATCH TO CHAIN'}
                </button>

                <p className="text-center text-[10px] text-green-500/50 uppercase tracking-widest">
                    authorized personnel only
                </p>
            </div>

            {/* List of items ready to go */}
            <div className="opacity-50 pointer-events-none">
                {verified.map((item) => (
                     <div key={item.id} className="flex justify-between py-2 border-b border-white/5 text-xs text-neutral-500">
                        <span>{item.walletAddress.slice(0,6)}...</span>
                        <span>+{item.points}</span>
                     </div>
                ))}
            </div>

          </div>

          {/* --- Add Admin Section --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif">Add Admin</h2>
                <span className="text-xs text-neutral-500 uppercase tracking-widest">Officer Only</span>
            </div>
            
            <form onSubmit={handleAddAdmin} className="p-6 rounded-xl bg-[#111] border border-white/5 space-y-4">
                <div className="space-y-2">
                    <label className="text-xs text-neutral-500 uppercase tracking-widest font-medium">
                        Admin Name
                    </label>
                    <input 
                        type="text" 
                        placeholder="Enter name" 
                        value={adminName} 
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 focus:border-green-500/50 focus:outline-none text-white placeholder:text-neutral-600 font-mono text-sm transition-colors"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs text-neutral-500 uppercase tracking-widest font-medium">
                        Wallet Address
                    </label>
                    <input 
                        type="text" 
                        placeholder="0x..." 
                        value={adminWalletAddress} 
                        onChange={(e) => setAdminWalletAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 focus:border-green-500/50 focus:outline-none text-white placeholder:text-neutral-600 font-mono text-sm transition-colors"
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="w-full py-3 rounded-lg bg-green-900/20 border border-green-900/50 text-green-500 hover:bg-green-900/30 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                    Add Admin
                </button>
            </form>
          </div>

          {/* --- Add Player Section --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif">Add Player</h2>
                <span className="text-xs text-neutral-500 uppercase tracking-widest">Manual Entry</span>
            </div>
            
            <form onSubmit={handleAddPlayer} className="p-6 rounded-xl bg-[#111] border border-white/5 space-y-4">
                <div className="space-y-2">
                    <label className="text-xs text-neutral-500 uppercase tracking-widest font-medium">
                        Player Name
                    </label>
                    <input 
                        type="text" 
                        placeholder="Enter name" 
                        value={playerName} 
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 focus:border-green-500/50 focus:outline-none text-white placeholder:text-neutral-600 font-mono text-sm transition-colors"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs text-neutral-500 uppercase tracking-widest font-medium">
                        Wallet Address
                    </label>
                    <input 
                        type="text" 
                        placeholder="0x..." 
                        value={playerWalletAddress} 
                        onChange={(e) => setPlayerWalletAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 focus:border-green-500/50 focus:outline-none text-white placeholder:text-neutral-600 font-mono text-sm transition-colors"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-500 uppercase tracking-widest font-medium">
                            Score
                        </label>
                        <input 
                            type="text" 
                            placeholder="0" 
                            value={playerScore} 
                            onChange={(e) => setPlayerScore(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 focus:border-green-500/50 focus:outline-none text-white placeholder:text-neutral-600 font-mono text-sm transition-colors"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-500 uppercase tracking-widest font-medium">
                            Tribe
                        </label>
                        <input 
                            type="text" 
                            placeholder="Genesis" 
                            value={playerTribe} 
                            onChange={(e) => setPlayerTribe(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 focus:border-green-500/50 focus:outline-none text-white placeholder:text-neutral-600 font-mono text-sm transition-colors"
                        />
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    className="w-full py-3 rounded-lg bg-green-900/20 border border-green-900/50 text-green-500 hover:bg-green-900/30 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                    Add Player
                </button>
            </form>
          </div>

        </main>
      )}
    </div>
  );
}