'use client';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';

interface ProviderData {
    displayName: string;
    photoURL?: string;
    verified?: boolean;
}

export function useProviderData() {
    const [user, authLoading] = useAuthState(auth);
    const [providerData, setProviderData] = useState<ProviderData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProviderData = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProviderData({
                        displayName: data.displayName,
                        photoURL: data.photoURL || '',
                        verified: data.verified || false
                    });
                }
            }
            setLoading(false);
        };

        if (!authLoading) {
            fetchProviderData();
        }

    }, [user, authLoading]);

    return { providerData, loading: authLoading || loading };
}
