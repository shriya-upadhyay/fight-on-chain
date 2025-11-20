import { useReadContract } from 'wagmi';
// import FightOnChain from '../utils/FightOnChain.json'; // Your ABI

// Define the structure of the data we expect back
interface Player {
  walletAddress: string;
  name: string;
  score: bigint; // Solidity uint256 comes back as BigInt
  tribe: string;
  joinDate: bigint;
  isActive: boolean;
}

export function useAllPlayers() {
  const { data, isError, isLoading } = useReadContract({
    address: '0xYourContractAddress...', // Replace with deployed address
    // abi: FightOnChain.abi,
    functionName: 'getPlayers',
    args: [],
  });

  // The contract returns an array of Player structs
  const players: Player[] = data ? (data as any[]).map((player: any) => ({
    walletAddress: player.walletAddress,
    name: player.name,
    score: player.score,
    tribe: player.tribe,
    joinDate: player.joinDate,
    isActive: player.isActive,
  })) : [];

  // Sort by score (descending) - highest scores first
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.score > b.score) return -1;
    if (a.score < b.score) return 1;
    return 0;
  });

  return { 
    players: sortedPlayers, 
    isError, 
    isLoading 
  };
}

