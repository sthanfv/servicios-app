
import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { collection, query, where, getDocs, orderBy, Query, DocumentData, limit } from 'firebase/firestore';
import { useDebounce } from './use-debounce';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  userId: string;
}

export function useServiceSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState<Service[]>([]);
  const [recentServices, setRecentServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Fetch categories
            const servicesSnapshot = await getDocs(query(collection(db, "services")));
            const uniqueCategories = [...new Set(servicesSnapshot.docs.map(doc => doc.data().category as string))];
            setCategories(uniqueCategories);

            // Fetch recent services for the carousel
            const recentQuery = query(collection(db, 'services'), orderBy('createdAt', 'desc'), limit(4));
            const recentSnapshot = await getDocs(recentQuery);
            const recentData = recentSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Service));
            setRecentServices(recentData);

        } catch (error) {
            console.error("Error fetching initial data:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        let servicesQuery: Query<DocumentData> = collection(db, 'services');

        if (selectedCategory !== 'all') {
          servicesQuery = query(servicesQuery, where('category', '==', selectedCategory));
        }
        
        servicesQuery = query(servicesQuery, orderBy('createdAt', 'desc'));

        const querySnapshot = await getDocs(servicesQuery);
        let servicesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Service));
        
        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            servicesData = servicesData.filter(service => 
              service.title.toLowerCase().includes(lowercasedTerm) ||
              service.description.toLowerCase().includes(lowercasedTerm)
            );
        }

        setServices(servicesData);
      } catch (error) {
        console.error("Error searching services:", error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [debouncedSearchTerm, selectedCategory]);

  return { 
    services, 
    recentServices,
    loading, 
    searchTerm, 
    setSearchTerm, 
    selectedCategory, 
    setSelectedCategory,
    categories 
  };
}

    