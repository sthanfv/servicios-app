
'use client';
import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';

interface PlatformStats {
  totalUsers: number;
  totalServices: number;
  totalHires: number;
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats>({ totalUsers: 0, totalServices: 0, totalHires: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, 'users');
        const servicesCollection = collection(db, 'services');
        const hiresCollection = collection(db, 'hires');

        const userCountPromise = getCountFromServer(usersCollection);
        const serviceCountPromise = getCountFromServer(servicesCollection);
        const hireCountPromise = getCountFromServer(hiresCollection);

        const [userSnapshot, serviceSnapshot, hireSnapshot] = await Promise.all([
            userCountPromise, 
            serviceCountPromise,
            hireCountPromise
        ]);
        
        setStats({
          totalUsers: userSnapshot.data().count,
          totalServices: serviceSnapshot.data().count,
          totalHires: hireSnapshot.data().count,
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
