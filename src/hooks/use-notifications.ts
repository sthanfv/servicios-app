
'use client';
import { useState, useEffect, useCallback } from 'react';
import { db, auth } from '@/services/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: any;
}

export function useNotifications() {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
    }

    setLoading(true);
    const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(notifsData);
      
      const unread = notifsData.filter(n => !n.read).length;
      setUnreadCount(unread);
      setLoading(false);

    }, (error) => {
        console.error("Error fetching notifications: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    const notifRef = doc(db, 'notifications', notificationId);
    try {
        await updateDoc(notifRef, { read: true });
    } catch(e) {
        console.error("Error marking notification as read:", e);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user || unreadCount === 0) return;

    const batch = writeBatch(db);
    notifications.forEach(notif => {
        if (!notif.read) {
            const notifRef = doc(db, 'notifications', notif.id);
            batch.update(notifRef, { read: true });
        }
    });

    try {
        await batch.commit();
    } catch(e) {
        console.error("Error marking all notifications as read:", e);
    }

  }, [user, notifications, unreadCount]);


  return { notifications, unreadCount, markAsRead, markAllAsRead, loading };
}

    