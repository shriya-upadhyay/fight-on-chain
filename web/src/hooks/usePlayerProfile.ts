import { useReadContract } from 'wagmi';
// import CryptoClubGameV3 from '../utils/CryptoClubGameV2.json'; // Your ABI

// Define the structure of the data we expect back
interface PlayerProfile {
  name: string;
  score: bigint; // Solidity uint256 comes back as BigInt
  tribe: string;
  joinDate: bigint;
  isActive: boolean;
}

export function usePlayerProfile(address: string | undefined) {
  const { data, isError, isLoading } = useReadContract({
    address: '0xYourContractAddress...', // Replace with deployed address
    // abi: CryptoClubGameV3.abi,
    functionName: 'getPlayer',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address, 
    }
  });

  // The contract returns an array-like struct. We map it to a clean object.
  const profile = data ? {
    name: (data as any).name,
    score: (data as any).score,
    tribe: (data as any).tribe,
    joinDate: (data as any).joinDate,
    isActive: (data as any).isActive,
  } : null;

  return { profile, isError, isLoading };
}