import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
interface AppUser {
  id: number;
  name: string | null;
  wallet_address: string;
}

export interface Submission {
  id: number;
  user_id: number;
  name: string;
  description: string;
  proof_photo?: string | null;
  approved: boolean;
  minted: boolean;
  points: number;
  event_date: string | null;
}

export function useAdminInbox() {
  const [pending, setPending] = useState<Submission[]>([]);
  const [verified, setVerified] = useState<Submission[]>([]);

  const [users, setUsers] = useState<AppUser[]>([]);
  const fetchUsers = async () => {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (usersError) console.error('Error fetching users:', usersError);
    else setUsers((usersData as AppUser[]) || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch submissions from Supabase
  const fetchSubmissions = async () => {
    const { data: pendingData, error: pendingError } = await supabase
      .from('actions')
      .select('*')
      .eq('approved', false)
      .order('event_date', { ascending: true });

    if (pendingError) console.error('Error fetching pending:', pendingError);
    else setPending(pendingData as Submission[]);

    const { data: verifiedData, error: verifiedError } = await supabase
      .from('actions')
      .select('*')
      .eq('approved', true)
      .eq('minted', false)
      .order('event_date', { ascending: true });

    if (verifiedError) console.error('Error fetching verified:', verifiedError);
    else setVerified(verifiedData as Submission[]);
  };

  useEffect(() => {
    fetchSubmissions();

    // Optional: Poll every X seconds for new submissions
    const interval = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- Actions ---
  const approveSubmission = async (id: number) => {
    const { error } = await supabase
      .from('actions')
      .update({ approved: true })
      .eq('id', id);

    if (error) console.error('Error approving:', error);
    else fetchSubmissions();
  };

  const rejectSubmission = async (id: number) => {
    const { error } = await supabase
      .from('actions')
      .delete()
      .eq('id', id);

    if (error) console.error('Error rejecting (deleting):', error);
    else fetchSubmissions();
  };

  const markAsMinted = async (ids: number[]) => {
    const { error } = await supabase
      .from('actions')
      .update({ minted: true })
      .in('id', ids);

    if (error) console.error('Error marking minted:', error);
    else fetchSubmissions();
  };

  return { pending, verified, users, approveSubmission, rejectSubmission, markAsMinted };
}
