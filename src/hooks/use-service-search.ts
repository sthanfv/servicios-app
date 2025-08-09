
import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { collection, query, where, getDocs, orderBy, Query, DocumentData } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    // Fetch unique categories only once on mount
    const fetchCategories = async () => {
        try {
            const servicesSnapshot = await getDocs(query(collection(db, "services")));
            const uniqueCategories = [...new Set(servicesSnapshot.docs.map(doc => doc.data().category as string))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        let servicesQuery: Query<DocumentData> = collection(db, 'services');

        // Build the query dynamically based on filters
        if (selectedCategory !== 'all') {
          servicesQuery = query(servicesQuery, where('category', '==', selectedCategory));
        }
        
        // Note: Firestore does not support native full-text search.
        // This client-side filter is a common workaround for smaller-scale apps.
        // For production apps, a dedicated search service like Algolia or Typesense
        // integrated with Firebase is the recommended approach.
        
        // We always order by creation date to show the newest services first
        servicesQuery = query(servicesQuery, orderBy('createdAt', 'desc'));

        const querySnapshot = await getDocs(servicesQuery);
        let servicesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Service));
        
        // Client-side search filtering on the already filtered (by category) data
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
    loading, 
    searchTerm, 
    setSearchTerm, 
    selectedCategory, 
    setSelectedCategory,
    categories 
  };
}
