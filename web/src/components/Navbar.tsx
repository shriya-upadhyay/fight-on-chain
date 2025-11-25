'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useIsAdmin } from '../hooks/useIsAdmin';
import FightOnChain from '../utils/FightOnChain.json';


const NAV_LINKS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'Submit Evidence', href: '/submitevidence'}
];

const ADMIN_LINK = { name: 'Admin', href: '/admindashboard' };


interface NavbarProps {
  variant?: 'floating' | 'standard' | 'admin';
  showLogoDot?: boolean;
}

export default function Navbar({ variant = 'standard', showLogoDot = true }: NavbarProps) {
  const { address, isConnected, connector } = useAccount();
  const { isAdmin, admin, isLoading: isCheckingAdmin } = useIsAdmin(address);
  
  // Check localStorage for admin status (faster check for UI)
  const [isAdminFromStorage, setIsAdminFromStorage] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('is_admin') === 'true';
    setIsAdminFromStorage(stored);
  }, [isAdmin]); // Update when contract check completes
  
  // Show admin link if contract confirms admin OR localStorage says admin (for faster UI)
  const showAdminLink = isAdmin === true || isAdminFromStorage === true;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const isSigningInRef = useRef(false); // Prevent concurrent sign-in attempts
  const isCheckingAuthRef = useRef(false); // Prevent concurrent auth checks 

  useEffect(() => {
    if (!isConnected || !address) {
      // Clear signed in address when disconnected
      localStorage.removeItem('supabase_signed_in_address');
      return;
    }

    // Prevent concurrent auth checks
    if (isCheckingAuthRef.current) {
      return;
    }

    // Check if user is already authenticated in Supabase
    const checkAuth = async () => {
      isCheckingAuthRef.current = true;
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // If we have a valid session, verify it's for the current wallet
        if (session && !error) {
          // Extract wallet address from session metadata
          // The wallet address is in rawUserMetaData.sub as "web3:ethereum:0x..."
          const sessionSub = session.user.user_metadata?.sub || '';
          const sessionWalletAddress = sessionSub.startsWith('web3:ethereum:') 
            ? sessionSub.replace('web3:ethereum:', '').toLowerCase()
            : null;
          const currentWalletAddress = address?.toLowerCase();
          
          console.log("📋 Session check:", {
            id: session.user.id,
            sessionWallet: sessionWalletAddress,
            currentWallet: currentWalletAddress,
            match: sessionWalletAddress === currentWalletAddress,
            rawUserMetaData: session.user.user_metadata
          });
          
          // If session is for a different wallet, sign out and sign in with new wallet
          if (sessionWalletAddress && sessionWalletAddress !== currentWalletAddress) {
            console.log("⚠️ Session is for different wallet, signing out old session");
            await supabase.auth.signOut();
            // Continue to sign in with new wallet below
          } else if (sessionWalletAddress === currentWalletAddress) {
            // Session matches current wallet, use it
            setUser(session.user);
            localStorage.setItem('supabase_signed_in_address', address.toLowerCase());
            isCheckingAuthRef.current = false;
            return;
          }
          // If no wallet address found in session, continue to sign in
        }

        // No valid session, sign in (but only if not already signing)
        if (!isSigningInRef.current) {
          isSigningInRef.current = true;
          await signInWithWallet();
          isSigningInRef.current = false;
        }
      } finally {
        isCheckingAuthRef.current = false;
      }
    };

    checkAuth();
  }, [isConnected, address]);

  // Function to sign in to Supabase with the connected wallet
  const signInWithWallet = async () => {
    
    // Double-check we have a valid session before signing (prevent duplicate calls)
    const { data: { session: existingSession } } = await supabase.auth.getSession();
    if (existingSession) {
      console.log("⚠️ Existing session found, skipping sign-in");
      setUser(existingSession.user);
      if (address) {
        localStorage.setItem('supabase_signed_in_address', address.toLowerCase());
      }
      return;
    }
    
    console.log("✅ No existing session, proceeding with sign-in...");

    if (!isConnected || !address) {
      console.error("No wallet connected!");
      isSigningInRef.current = false;
      return;
    }
    if (typeof window === "undefined") {
      isSigningInRef.current = false;
      return;
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase not configured! Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
      isSigningInRef.current = false;
      return;
    }

    // Get the provider from the connected wallet
    // Try to get it from the connector, otherwise fall back to window.ethereum
    let provider: any = null;
    
    if (typeof window !== 'undefined') {
      // Check if connector has a provider
      if (connector && 'getProvider' in connector) {
        try {
          provider = await (connector as any).getProvider();
        } catch (e) {
          console.log("Could not get provider from connector, trying window.ethereum");
        }
      }
      
      // Fallback to window.ethereum (works for MetaMask, Coinbase Wallet, etc.)
      if (!provider && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        
        // If multiple providers (like when both MetaMask and Coinbase are installed)
        // Use the one that matches the connector
        if (ethereum.providers && Array.isArray(ethereum.providers)) {
          // Try to find the provider that matches the connector
          if (connector?.id === 'coinbaseWalletSDK') {
            provider = ethereum.providers.find((p: any) => p.isCoinbaseWallet) || ethereum;
          } else if (connector?.id === 'metaMask') {
            provider = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum;
          } else {
            // Default to first provider or ethereum
            provider = ethereum.providers[0] || ethereum;
          }
        } else {
          provider = ethereum;
        }
      }
    }

    if (!provider) {
      console.error("No Ethereum wallet provider detected");
      isSigningInRef.current = false;
      return;
    }

    console.log("📝 Calling supabase.auth.signInWithWeb3()...");
    const { data, error } = await supabase.auth.signInWithWeb3({
      chain: 'ethereum',
      statement: 'I accept the Terms of Service at https://example.com/tos',
      wallet: provider, // Use the actual connected wallet provider
    });
    console.log("📝 signInWithWeb3() completed", { hasData: !!data, hasError: !!error });

    if (error) {
      console.error("Supabase sign-in error:", error);
      isSigningInRef.current = false;
      return;
    }

    // Success - user signed in
    console.log("✅ Sign-in successful! User:", data?.user);
    setUser(data.user);
    // Store that we've signed in for this address
    if (address) {
      localStorage.setItem('supabase_signed_in_address', address.toLowerCase());
    }
    isSigningInRef.current = false;
    console.log("🎉 User signed in successfully", data.user);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only update localStorage when we have a definitive answer (true or false, not undefined)
    if (!isCheckingAdmin && isAdmin !== undefined) {
      // Update localStorage immediately when we know admin status
      localStorage.setItem('is_admin', isAdmin.toString());
    }
  }, [isAdmin, isCheckingAdmin]);

  // Update users table when admin status changes (separate from localStorage)
  useEffect(() => {
    if (!address || isCheckingAdmin || !user || isAdmin === undefined) return;

    const updateAdminInUsersTable = async () => {
      try {
        // Check if user exists in users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('is_admin, wallet_address, name')
          .eq('wallet_address', address.toLowerCase())
          .single();

        // Update users table if admin status changed or user exists
        if (existingUser) {
          // User exists, update if admin status changed
          if (existingUser.is_admin !== isAdmin) {
            const updateData: any = { is_admin: isAdmin };
            if (admin?.name) {
              updateData.name = admin.name;
            }

            const { error } = await supabase
              .from('users')
              .update(updateData)
              .eq('wallet_address', address.toLowerCase());

            if (error) {
              console.error("Error updating admin status:", error);
            } else {
              console.log(`✅ Admin status updated in users table: ${isAdmin}`);
            }
          }
        } else if (isAdmin && admin) {
          // User doesn't exist but is admin - create record
          const { error } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              wallet_address: address.toLowerCase(),
              is_admin: true,
              name: admin.name || null,
              score: 0,
              tribe: null,
            }, { onConflict: 'wallet_address' });

          if (error) {
            console.error("Error creating admin user:", error);
          } else {
            console.log("Admin user created in users table");
          }
        }
      } catch (err) {
        console.error("Error updating admin status:", err);
      }
    };

    updateAdminInUsersTable();
  }, [isAdmin, admin, address, isCheckingAdmin, user]);


  
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

          <div className="hidden md:flex items-center gap-4">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {showAdminLink && (
              <Link 
                href={ADMIN_LINK.href}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                {ADMIN_LINK.name}
              </Link>
            )}
          </div>
          
          <div className="h-4 w-[1px] bg-white/10" />
          
          <div className="scale-90 origin-right">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
          </div>
        </div>
      </nav>
    );
  }

  // Admin variant - shows full navbar with admin indicator
  if (variant === 'admin') {
    return (
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-red-900/30 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
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
              <span className="font-serif font-medium text-neutral-300">Fight On-Chain</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1 rounded border border-red-900/50 bg-red-900/10">
              <span className="font-mono text-xs font-bold tracking-widest text-red-400">ADMIN MODE</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {showAdminLink && (
              <Link 
                href={ADMIN_LINK.href}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                {ADMIN_LINK.name}
              </Link>
            )}
          </div>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>
      </nav>
    );
  }

  // Standard variant (default)
  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
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
          <span className="font-serif font-medium text-neutral-300">Fight On-Chain</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {showAdminLink && (
              <Link 
                href={ADMIN_LINK.href}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                {ADMIN_LINK.name}
              </Link>
            )}
          </div>
        <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
      </div>
    </nav>
  );
}
