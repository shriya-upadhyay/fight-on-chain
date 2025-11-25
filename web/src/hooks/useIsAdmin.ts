import { useReadContract } from 'wagmi';
import FightOnChain from '../utils/FightOnChain.json';

const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x02C5dfdcFEE44912d516A26b1C36aFaf84506c9f') as `0x${string}`;


export interface Admin {
  walletAddress: string;
  name: string;
  joinDate: bigint;
  isActive: boolean;
}

export function useIsAdmin(address: string | undefined) {
  const { data: isAdminBool, isError, isLoading } = useReadContract({
    address: contractAddress, 
    abi: FightOnChain.abi,
    functionName: 'isAdmin',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const isAdmin = isAdminBool as boolean | undefined;

  const { data: adminData, isError: adminError, isLoading: adminLoading } = useReadContract({
    address: contractAddress,
    abi: FightOnChain.abi,
    functionName: 'getAdminByAddress',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!contractAddress && isAdmin === true, // Only call if confirmed admin
    },
  });
  
  const admin: Admin | undefined = adminData ? (adminData as Admin) : undefined;

  const isAdminDefinitive = isAdminBool !== undefined ? (isAdminBool as boolean) : undefined;

  return {
    isAdmin: isAdminDefinitive, // Keep as undefined until we have a definitive answer
    admin, 
    isError: isError || adminError,
    isLoading: isLoading || adminLoading,
  };
}

