'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useUserData } from '@/hooks/use-user-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Heart, ArrowLeft, LogIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  userId: string;
}

export default function FavoritesPage() {
  const [user, authLoading] = useAuthState(auth);
  const { userData, loading: userLoading } = useUserData();
  const [favoriteServices, setFavoriteServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userLoading || authLoading) return;

    if (!user || !userData) {
      setLoading(false);
      return;
    }
    
    setLoading(true);

    if (userData.favoriteServices && userData.favoriteServices.length > 0) {
      const fetchServices = async () => {
          try {
            const servicesPromises = userData.favoriteServices?.map(id => getDoc(doc(db, 'services', id))) || [];
            const serviceDocs = await Promise.all(servicesPromises);
            const servicesData = serviceDocs
                .filter(docSnap => docSnap.exists())
                .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Service));
            setFavoriteServices(servicesData);
          } catch(e) {
             console.error(e);
             toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los favoritos.' });
          } finally {
            setLoading(false);
          }
      }
      fetchServices();
    } else {
      setFavoriteServices([]);
      setLoading(false);
    }
    
  }, [userData, user, userLoading, authLoading, toast]);
  

  if (authLoading || userLoading || loading) {
    return (
      <main className="container min-h-screen flex flex-col items-center justify-center text-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container min-h-screen flex flex-col items-center justify-center text-center py-10">
        <Card className="w-full max-w-md p-8">
          <CardTitle className="text-2xl font-bold mb-4">Acceso Denegado</CardTitle>
          <CardDescription className="mb-6">
            Debes iniciar sesión para ver tus servicios favoritos.
          </CardDescription>
          <Button asChild>
            <Link href="/login">
              <LogIn className="mr-2" />
              Iniciar Sesión
            </Link>
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">Mis Favoritos</h1>
        </div>
      </div>

      {favoriteServices.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
           <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Aún no tienes favoritos</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            Guarda los servicios que te interesan haciendo clic en el corazón.
          </p>
          <Button asChild>
            <Link href="/">
              Explorar Servicios
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoriteServices.map((service) => (
             <Link href={`/service/${service.id}`} key={service.id} className="group">
                <Card className="h-full flex flex-col overflow-hidden transform transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-lg">
                      {service.imageUrl ? (
                        <Image
                          src={service.imageUrl}
                          alt={service.title}
                          layout="fill"
                          objectFit="cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                    <CardTitle>{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-3">{service.description}</p>
                    </CardContent>
                    <CardFooter>
                    <Badge variant="secondary">{service.category}</Badge>
                    </CardFooter>
                </Card>
             </Link>
          ))}
        </div>
      )}
    </div>
  );
}
