
import { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useUserData } from './use-user-data';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';

export function useFavorites(serviceId: string) {
  const { user, userData, loading: userLoading } = useUserData();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    if (user && userData) {
      setIsFavorited(userData.favoriteServices?.includes(serviceId) ?? false);
    }
    // We are done loading once we have checked the user/userData status.
    setLoading(false);
  }, [userData, serviceId, user]);

  const toggleFavorite = useCallback(async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Acción requerida',
        description: 'Debes iniciar sesión para añadir a favoritos.',
      });
      // Redirect to login page if user is not authenticated
      router.push('/login');
      return;
    }

    setLoading(true);

    const userDocRef = doc(db, 'users', user.uid);
    try {
      if (isFavorited) {
        await updateDoc(userDocRef, {
          favoriteServices: arrayRemove(serviceId),
        });
        toast({ title: 'Eliminado de favoritos' });
        setIsFavorited(false);
      } else {
        await updateDoc(userDocRef, {
          favoriteServices: arrayUnion(serviceId),
        });
        toast({ title: 'Añadido a favoritos' });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar tus favoritos.',
      });
    } finally {
      setLoading(false);
    }
  }, [isFavorited, serviceId, user, toast, router]);

  return { isFavorited, toggleFavorite, loading: loading || userLoading };
}
