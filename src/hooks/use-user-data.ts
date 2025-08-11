'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '@/services/firebase';
import { doc, onSnapshot, Unsubscribe, Timestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Timestamp;
  favoriteServices?: string[];
  verified?: boolean;
  photoURL?: string;
}

export function useUserData() {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    
    // Always start with loading true when user state changes
    setLoading(true);

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
          // User is authenticated, but no document exists.
          setUserData(null);
        }
        // Data has been fetched (or confirmed not to exist), so loading is done.
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user data:", error);
        setUserData(null);
        setLoading(false); // Also stop loading on error
      });
    } else {
      // No user is signed in.
      setUserData(null);
      setLoading(false);
    }

    // Cleanup subscription on unmount
    return () => unsubscribe && unsubscribe();
  }, [user]);

  return { user, userData, loading };
}
