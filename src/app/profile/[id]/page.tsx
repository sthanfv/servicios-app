
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, MessageSquare, Share2, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  userId: string;
}

interface UserProfile {
    uid: string;
    displayName: string;
    photoURL?: string;
    email: string;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Fetch user profile
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          toast({ variant: 'destructive', title: 'No encontrado', description: 'Este perfil de usuario no existe.' });
          router.push('/');
          return;
        }
        const userData = userDocSnap.data() as UserProfile;
        setProfile(userData);

        // Fetch user's services
        const servicesQuery = query(
          collection(db, 'services'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const servicesSnapshot = await getDocs(servicesQuery);
        const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
        setServices(servicesData);

      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el perfil.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, router, toast]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: '¡Enlace copiado!', description: 'El enlace al perfil ha sido copiado al portapapeles.' });
  };
  
   const handleContact = () => {
    router.push(`/chat?contact=${userId}`);
  };


  if (loading) {
    return (
      <main className="container min-h-screen flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }

  if (!profile) {
    return null; // Should be redirected if profile is not found
  }

  return (
    <main className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2" />
                Compartir Perfil
            </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src={profile.photoURL} alt={profile.displayName} />
            <AvatarFallback>
                <UserIcon className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{profile.displayName}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
            {/* Placeholder for future reputation system */}
            <div className="flex justify-center md:justify-start items-center gap-2 mt-2 text-muted-foreground">
              <span>⭐️ Aún sin calificación</span>
            </div>
          </div>
          <Button size="lg" onClick={handleContact}>
            <MessageSquare className="mr-2" />
            Contactar
          </Button>
        </CardContent>
      </Card>

      {/* Services List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Servicios de {profile.displayName}</h2>
        {services.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service) => (
              <Link href={`/service/${service.id}`} key={service.id} className="group">
                <Card className="h-full flex flex-col overflow-hidden transform transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                  {service.imageUrl ? (
                    <div className="relative w-full h-48">
                      <Image
                        src={service.imageUrl}
                        alt={service.title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
                      <span className="text-muted-foreground">Sin imagen</span>
                    </div>
                  )}
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
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Este proveedor aún no ha publicado servicios</h3>
            <p className="text-muted-foreground mt-2">Vuelve a consultar más tarde.</p>
          </div>
        )}
      </div>
    </main>
  );
}
