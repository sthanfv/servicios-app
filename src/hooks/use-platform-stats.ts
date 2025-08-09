
'use client';
import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';

interface PlatformStats {
  totalUsers: number;
  totalServices: number;
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats>({ totalUsers: 0, totalServices: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, 'users');
        const servicesCollection = collection(db, 'services');

        const userCountPromise = getCountFromServer(usersCollection);
        const serviceCountPromise = getCountFromServer(servicesCollection);

        const [userSnapshot, serviceSnapshot] = await Promise.all([userCountPromise, serviceCountPromise]);
        
        setStats({
          totalUsers: userSnapshot.data().count,
          totalServices: serviceSnapshot.data().count,
        });

      } catch (error) {
        console.error("Error fetching platform stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}
