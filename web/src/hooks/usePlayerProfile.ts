import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface PlayerProfile {
  name: string | null;
  score: number | null;
  tribe: string | null;
  joinDate: number | null;
  isActive: boolean;
  transmissions: any[] | null;
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
          .select('name, id, wallet_address, score, tribe, created_at, is_admin')
          .eq('wallet_address', address.toLowerCase())
          .single();

        if (error) {
          console.error('Error fetching player profile:', error);
          setIsError(true);
          setIsLoading(false);
          return;
        }

        if (!data) {
          setIsLoading(false);
          return;
        }

        // Fetch transmissions only if we have a user ID
        let transmissions: any[] = [];
        if (data.id) {
          const { data: transmissionsData, error: transmissionsError } = await supabase
            .from('actions')
            .select('*')
            .eq('user_id', data.id)
            .order('event_date', { ascending: false })
            .limit(10);

          if (transmissionsError) {
            console.error('Error fetching transmissions:', transmissionsError);
          } else {
            transmissions = transmissionsData || [];
          }
        }

        const joinDate = data.created_at 
          ? Math.floor(new Date(data.created_at).getTime() / 1000)
          : null;
        
        setProfile({
          name: data.name,
          score: data.score || 0,
          tribe: data.tribe,
          joinDate: joinDate,
          isActive: !data.is_admin, // Non-admins are active players
          transmissions: transmissions.length > 0 ? transmissions : null,
        });
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
