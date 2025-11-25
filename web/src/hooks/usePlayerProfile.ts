import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface PlayerProfile {
  name: string | null;
  score: number | null;
  tribe: string | null;
  joinDate: bigint;
  isActive: boolean;
}

export function usePlayerProfile(address: string | undefined) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        
        const { data, error } = await supabase
          .from('users')
          .select('name, wallet_address, score, tribe, created_at, is_admin')
          .eq('wallet_address', address.toLowerCase())
          .single();

        if (error) {
          console.error('Error fetching player profile:', error);
          setIsError(true);
          setIsLoading(false);
          return;
        }

        if (data) {
          const joinDate = data.created_at 
            ? BigInt(Math.floor(new Date(data.created_at).getTime() / 1000))
            : BigInt(0);

          setProfile({
            name: data.name,
            score: data.score || 0,
            tribe: data.tribe,
            joinDate: joinDate,
            isActive: !data.is_admin, // Non-admins are active players
          });
        }
      } catch (err) {
        console.error('Error in fetchProfile:', err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [address]);

  return { profile, isError, isLoading };
}
