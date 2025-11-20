import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';  // Import from lib

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  points: number;
  status: 'Pending' | 'Verified' | 'Rejected';
  timestamp: any;
}

export function usePlayerActivity(address: string | undefined) {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setActivity([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'submissions'),
      where('walletAddress', '==', address),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityItem[];
      
      setActivity(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [address]);

  return { activity, loading };
}