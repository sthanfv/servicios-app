'use client';
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/services/firebase';
import { collection, query, where, getDocs, orderBy, Query, DocumentData, limit, startAfter, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { useDebounce } from './use-debounce';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  userId: string;
  createdAt: Timestamp;
  price: number;
  city: string;
  zone?: string;
  providerName: string;
  providerImage?: string;
  providerVerified?: boolean;
  reviewCount?: number;
  averageRating?: number;
}

const SERVICES_PER_PAGE = 8;

export function useServiceSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState<Service[]>([]);
  const [recentServices, setRecentServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Effect for initial data and categories
  useEffect(() => {
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const servicesSnapshot = await getDocs(query(collection(db, "services")));
            const uniqueCategories = [...new Set(servicesSnapshot.docs.map(doc => doc.data().category as string))];
            setCategories(uniqueCategories);

            const recentQuery = query(collection(db, 'services'), orderBy('createdAt', 'desc'), limit(8));
            const recentSnapshot = await getDocs(recentQuery);
            const recentData = recentSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Service));
            setRecentServices(recentData);

        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };
    fetchInitialData();
  }, []);

  const fetchServices = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
        setLoadingMore(true);
    } else {
        setLoading(true);
        setLastDoc(null); // Reset pagination on new search
    }

    try {
        let servicesQuery: Query<DocumentData> = collection(db, 'services');

        if (selectedCategory !== 'all') {
            servicesQuery = query(servicesQuery, where('category', '==', selectedCategory));
        }
        
        // Firestore limitation: cannot use inequality filters (like searching for a substring) on a different field than the first orderBy.
        // We will filter by search term client-side after fetching.
        
        servicesQuery = query(servicesQuery, orderBy('createdAt', 'desc'));

        if (isLoadMore && lastDoc) {
            servicesQuery = query(servicesQuery, startAfter(lastDoc));
        }

        servicesQuery = query(servicesQuery, limit(SERVICES_PER_PAGE));

        const querySnapshot = await getDocs(servicesQuery);
        let servicesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Service));
        
        // Client-side search filtering
        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            servicesData = servicesData.filter(service => 
              service.title.toLowerCase().includes(lowercasedTerm) ||
              service.description.toLowerCase().includes(lowercasedTerm) ||
              service.providerName.toLowerCase().includes(lowercasedTerm)
            );
        }

        const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastDoc(newLastDoc);
        setHasMore(querySnapshot.docs.length === SERVICES_PER_PAGE);

        if (isLoadMore) {
            setServices(prev => [...prev, ...servicesData]);
        } else {
            setServices(servicesData);
        }

    } catch (error) {
        console.error("Error searching services:", error);
        setServices([]);
    } finally {
        setLoading(false);
        setLoadingMore(false);
    }
  }, [selectedCategory, debouncedSearchTerm, lastDoc]);

  // Effect to refetch services when filters change
  useEffect(() => {
    // This function reference `fetchServices` will change when its dependencies change,
    // which are `selectedCategory`, `debouncedSearchTerm`, and `lastDoc`.
    // We want to trigger a fresh search (not load-more) when filters change.
    const search = async () => {
        await fetchServices(false);
    }
    search();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedCategory]);


  const fetchMore = () => {
      if(hasMore && !loadingMore) {
          fetchServices(true);
      }
  }


  return { 
    services, 
    recentServices,
    loading, 
    loadingMore,
    hasMore,
    fetchMore,
    searchTerm, 
    setSearchTerm, 
    selectedCategory, 
    setSelectedCategory,
    categories 
  };
}
