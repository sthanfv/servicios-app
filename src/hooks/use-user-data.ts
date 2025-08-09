
'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '@/services/firebase';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: any;
  favoriteServices?: string[];
}

export function useUserData() {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
          setUserData(null);
        }
        setLoading(false);
      });
    } else {
      setUserData(null);
      setLoading(false);
    }

    return () => unsubscribe && unsubscribe();
  }, [user]);

  return { user, userData, loading };
}
