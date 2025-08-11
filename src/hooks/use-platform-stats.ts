
'use client';
import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { collection, getCountFromServer, getDocs, query, orderBy } from 'firebase/firestore';

interface PlatformStats {
  totalUsers: number;
  totalServices: number;
  totalHires: number;
}

interface UserGrowthData {
    month: string;
    users: number;
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats>({ totalUsers: 0, totalServices: 0, totalHires: 0 });
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, 'users');
        const servicesCollection = collection(db, 'services');
        const hiresCollection = collection(db, 'hires');

        // Parallelize count queries
        const userCountPromise = getCountFromServer(usersCollection);
        const serviceCountPromise = getCountFromServer(servicesCollection);
        const hireCountPromise = getCountFromServer(hiresCollection);

        // Fetch all users for growth chart
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'asc'));
        const usersSnapshotPromise = getDocs(usersQuery);

        const [userCountSnapshot, serviceCountSnapshot, hireCountSnapshot, usersSnapshot] = await Promise.all([
            userCountPromise, 
            serviceCountPromise,
            hireCountPromise,
            usersSnapshotPromise
        ]);
        
        setStats({
          totalUsers: userCountSnapshot.data().count,
          totalServices: serviceCountSnapshot.data().count,
          totalHires: hireCountSnapshot.data().count,
        });

        // Process user growth data
        const monthlyGrowth = usersSnapshot.docs.reduce((acc, doc) => {
            const user = doc.data();
            if (user.createdAt) {
                const date = user.createdAt.toDate();
                const month = date.toLocaleString('default', { month: 'short' });
                const year = date.getFullYear();
                const key = `${year}-${month}`;
                
                if (!acc[key]) {
                    acc[key] = { month, year, users: 0 };
                }
                acc[key].users++;
            }
            return acc;
        }, {} as Record<string, { month: string; year: number; users: number }>);
        
        const sortedGrowthData = Object.values(monthlyGrowth).sort((a,b) => {
            return new Date(`${a.month} 1, ${a.year}`).getTime() - new Date(`${b.month} 1, ${b.year}`).getTime();
        });

        setUserGrowthData(sortedGrowthData);


      } catch (error) {
        console.error("Error fetching platform stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, userGrowthData, loading };
}
