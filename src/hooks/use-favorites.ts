
import { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useUserData } from './use-user-data';
import { useToast } from './use-toast';

export function useFavorites(serviceId: string) {
  const { user, userData } = useUserData();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userData) {
      setIsFavorited(userData.favoriteServices?.includes(serviceId) ?? false);
      setLoading(false);
    } else if (!user) {
        // if user is not logged in, not loading
        setLoading(false)
    }
  }, [userData, serviceId, user]);

  const toggleFavorite = useCallback(async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Acción requerida',
        description: 'Debes iniciar sesión para añadir a favoritos.',
      });
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
      } else {
        await updateDoc(userDocRef, {
          favoriteServices: arrayUnion(serviceId),
        });
        toast({ title: 'Añadido a favoritos' });
      }
      setIsFavorited(prev => !prev);
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
  }, [isFavorited, serviceId, user, toast]);

  return { isFavorited, toggleFavorite, loading };
}
