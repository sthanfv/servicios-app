'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, getDocs, collection, query, where, limit } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, MessageSquare, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Service {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  userId: string;
}

interface UserProfile {
    displayName: string;
    photoURL?: string;
}

export default function ServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const serviceId = params.id as string;

  const [user, authLoading] = useAuthState(auth);
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;

    const fetchServiceAndProvider = async () => {
      setLoading(true);
      try {
        const serviceDocRef = doc(db, 'services', serviceId);
        const serviceDocSnap = await getDoc(serviceDocRef);

        if (serviceDocSnap.exists()) {
          const serviceData = serviceDocSnap.data() as Service;
          setService(serviceData);

          // Fetch provider info - assuming a 'users' collection exists
          // For now, we will mock it if a dedicated user profile doesn't exist.
          if (serviceData.userId) {
             // This is a placeholder. In a real app, you'd fetch from a `users` collection
             // using `doc(db, 'users', serviceData.userId)`.
             // We'll try to find the user by UID in the auth system as a fallback.
             // This is not efficient and should be replaced with a user profile collection.
             setProvider({
                 displayName: 'Proveedor Anónimo',
                 photoURL: ''
             });
          }

        } else {
          toast({
            variant: 'destructive',
            title: 'No encontrado',
            description: 'El servicio que buscas no existe o fue eliminado.',
          });
          router.push('/');
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo cargar la información del servicio.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServiceAndProvider();
  }, [serviceId, router, toast]);

  const handleShare = () => {
    if(navigator.share) {
        navigator.share({
            title: service?.title,
            text: `Mira este servicio: ${service?.title}`,
            url: window.location.href,
        })
        .then(() => toast({ title: '¡Compartido!', description: 'El enlace al servicio ha sido compartido.' }))
        .catch((error) => console.error('Error al compartir', error));
    } else {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: '¡Copiado!', description: 'Enlace copiado al portapapeles.' });
    }
  };

  const handleContact = () => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Acción requerida',
            description: 'Debes iniciar sesión para contactar al proveedor.',
        });
        router.push('/login');
        return;
    }
    if (user.uid === service?.userId) {
        toast({
            title: 'Este es tu servicio',
            description: 'No puedes iniciar un chat contigo mismo.',
        });
        return;
    }
    router.push(`/chat?contact=${service?.userId}`);
  };


  if (loading || authLoading) {
    return (
      <main className="container min-h-screen flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }

  if (!service) {
    return null; // Or a more comprehensive "Not Found" component
  }
  
  const isOwner = user && user.uid === service.userId;

  return (
    <main className="container py-10">
       <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className='flex gap-2'>
            <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2" />
                Compartir
            </Button>
        </div>
      </div>

      <div className='grid md:grid-cols-3 gap-8'>
        <div className='md:col-span-2'>
            <Card className="overflow-hidden">
                {service.imageUrl && (
                    <div className="relative w-full h-64 md:h-96">
                        <Image
                            src={service.imageUrl}
                            alt={service.title}
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                )}
                <CardHeader>
                <div className='flex justify-between items-start'>
                    <div>
                    <Badge variant="secondary" className="mb-2">{service.category}</Badge>
                    <CardTitle className="text-3xl md:text-4xl font-bold">{service.title}</CardTitle>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                <h3 className='font-bold text-lg mb-2'>Descripción del servicio</h3>
                <CardDescription className="text-base md:text-lg whitespace-pre-wrap">
                    {service.description}
                </CardDescription>
                </CardContent>
            </Card>
        </div>

        <div className='md:col-span-1 space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Contactar al Proveedor</CardTitle>
                </CardHeader>
                <CardContent>
                     {provider && (
                         <div className='flex items-center gap-4 mb-4'>
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={provider.photoURL ?? ''} />
                                <AvatarFallback>{provider.displayName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className='font-semibold'>{provider.displayName}</p>
                                <p className='text-sm text-muted-foreground'>Proveedor verificado</p>
                            </div>
                        </div>
                     )}
                     
                    {isOwner ? (
                        <Button disabled className="w-full">Es tu servicio</Button>
                    ) : (
                        <Button onClick={handleContact} className="w-full">
                            <MessageSquare className="mr-2" />
                            Enviar Mensaje
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>


    </main>
  );
}
