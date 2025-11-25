import { useReadContract } from 'wagmi';
import { useState, useEffect } from 'react';
import FightOnChain from '../utils/FightOnChain.json';
import { supabase } from '../lib/supabaseClient';

const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '') as `0x${string}`;

interface Player {
  walletAddress: string;
  name: string;
  score: bigint;
  tribe: string;
  joinDate: number;
  isActive: boolean;
} 

interface ChainPlayer {
  walletAddress: string;
  score: bigint;
}

interface DatabaseUser {
  wallet_address: string;
  name: string | null;
  tribe: string | null;
  score: number | null;
  is_admin: boolean;
  created_at: string; // ISO timestamp string
}

export function useAllPlayers(address: string) {
  const [dbUsers, setDbUsers] = useState<DatabaseUser[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  // Get scores from chain (source of truth)
  const { data: chainData, isError: chainError, isLoading: chainLoading } = useReadContract({
    address: contractAddress,
    abi: FightOnChain.abi,
    functionName: 'getPlayers',
    args: [],
  });


  console.log('chainData', chainData);
  console.log('chainError', chainError);
  console.log('chainLoading', chainLoading);

  // Get player info from database
  useEffect(() => {
    const fetchDbUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('wallet_address, name, tribe, score, is_admin, created_at')
          .order('score', { ascending: false });

        if (error) {
          console.error('Error fetching users from database:', error);
          setDbError(true);
        } else {
          setDbUsers(data || []);
        }
      } catch (err) {
        console.error('Error in fetchDbUsers:', err);
        setDbError(true);
      } finally {
        setDbLoading(false);
      }
    };

    fetchDbUsers();
  }, []);

  console.log('dbUsers', dbUsers);
  console.log('dbError', dbError);
  console.log('dbLoading', dbLoading);

  let chainPlayers: ChainPlayer[] = Array.isArray(chainData)
  ? (chainData as ChainPlayer[])
  : [];

// Remove bogus entries (common in Solidity dynamic arrays)
chainPlayers = chainPlayers.filter(
  (p) =>
    p.walletAddress &&
    p.walletAddress.toLowerCase() !== "0x0000000000000000000000000000000000000000" &&
    p.score !== null &&
    p.score !== undefined
);

  
  // Create a map of wallet_address -> database user for quick lookup
  const dbUsersMap = new Map(
    dbUsers.map(user => [user.wallet_address.toLowerCase(), user])
  );

  // Merge: use chain score, but get name/tribe from database
  const mergedPlayers: Player[] = chainPlayers.map((chainPlayer: ChainPlayer) => {
    const dbUser = dbUsersMap.get(chainPlayer.walletAddress.toLowerCase());
    
    // Convert created_at ISO string to Unix timestamp (bigint)
    const joinDate = dbUser?.created_at 
      ? (Math.floor(new Date(dbUser.created_at).getTime() / 1000))
      : (0);
    
    return {
      walletAddress: chainPlayer.walletAddress,
      name: dbUser?.name || 'Unknown',
      score: chainPlayer.score, 
      tribe: dbUser?.tribe || 'Unknown',
      joinDate: joinDate,
      isActive: true, 
    };
  });

  return {
    players: mergedPlayers,
    isError: chainError || dbError,
    isLoading: chainLoading || dbLoading,
  };
}
