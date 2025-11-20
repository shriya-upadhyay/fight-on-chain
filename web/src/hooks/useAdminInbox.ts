import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Submission {
    id: string;
    walletAddress: string;
    title: string;
    points: number;
    status: 'Pending' | 'Verified' | 'Rejected' | 'Minted';
    timestamp: any;
    // Add photoURL if you are storing images
  }
  
  export function useAdminInbox() {
    const [pending, setPending] = useState<Submission[]>([]);
    const [verified, setVerified] = useState<Submission[]>([]); // Staged for minting
  
    useEffect(() => {
      // 1. Listen for PENDING items (To be reviewed)
      const qPending = query(
        collection(db, 'submissions'),
        where('status', '==', 'Pending'),
        orderBy('timestamp', 'asc')
      );
  
      const unsubPending = onSnapshot(qPending, (snapshot) => {
        setPending(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Submission)));
      });
  
      // 2. Listen for VERIFIED items (Ready to Mint)
      const qVerified = query(
        collection(db, 'submissions'),
        where('status', '==', 'Verified'),
        orderBy('timestamp', 'asc')
      );
  
      const unsubVerified = onSnapshot(qVerified, (snapshot) => {
        setVerified(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Submission)));
      });
  
      return () => {
        unsubPending();
        unsubVerified();
      };
    }, []);
  
    // --- Actions ---
  
    const approveSubmission = async (id: string) => {
      await updateDoc(doc(db, 'submissions', id), { status: 'Verified' });
    };
  
    const rejectSubmission = async (id: string) => {
      await updateDoc(doc(db, 'submissions', id), { status: 'Rejected' });
    };
  
    const markAsMinted = async (ids: string[]) => {
      // After blockchain tx succeeds, we mark them as "Minted" so they disappear from the list
      const promises = ids.map(id => updateDoc(doc(db, 'submissions', id), { status: 'Minted' }));
      await Promise.all(promises);
    };
  
    return { pending, verified, approveSubmission, rejectSubmission, markAsMinted };
  }