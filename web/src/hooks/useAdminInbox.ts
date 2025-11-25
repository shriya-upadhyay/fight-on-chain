import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Submission {
  id: number; // Supabase uses numeric IDs by default
  walletAddress: string;
  action_name: string;
  points: number;
  // approved: 'Pending' | 'Verified' | 'Rejected' | 'Minted';
  approved: boolean,
  event_date: string;
  proof_photo_url?: string | null;
}

export function useAdminInbox() {
  const [pending, setPending] = useState<Submission[]>([]);
  const [verified, setVerified] = useState<Submission[]>([]);

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
      .update({ approved: false })
      .eq('id', id);

    if (error) console.error('Error rejecting:', error);
    else fetchSubmissions();
  };

  const markAsMinted = async (ids: number[]) => {
    const { error } = await supabase
      .from('actions')
      .update({ approved: true })
      .in('id', ids);

    if (error) console.error('Error marking minted:', error);
    else fetchSubmissions();
  };

  return { pending, verified, approveSubmission, rejectSubmission, markAsMinted };
}
