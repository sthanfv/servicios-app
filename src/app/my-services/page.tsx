'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '@/services/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit, Trash2, PlusCircle, LogIn, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
}

export default function MyServices() {
  const [user, authLoading] = useAuthState(auth);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setLoadingServices(true);
      const q = query(
        collection(db, 'services'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
        setServices(servicesData);
        setLoadingServices(false);
      }, (error) => {
        console.error("Error fetching services: ", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar tus servicios.',
        });
        setLoadingServices(false);
      });
      return () => unsubscribe();
    } else if (!authLoading) {
        setLoadingServices(false);
    }
  }, [user, authLoading, toast]);

  const handleDelete = async (serviceId: string, imageUrl?: string) => {
    setIsDeleting(serviceId);
    try {
      if (imageUrl) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: imageUrl }),
        });
      }
      await deleteDoc(doc(db, 'services', serviceId));
      toast({
        title: 'Éxito',
        description: 'Servicio eliminado correctamente.',
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el servicio.',
      });
    } finally {
        setIsDeleting(null);
    }
  };

  if (authLoading || (!user && !authLoading && !loadingServices)) {
    return (
        <main className="container min-h-screen flex flex-col items-center justify-center text-center py-10">
        {authLoading ? <Loader2 className="h-12 w-12 animate-spin text-primary"/> : (
            <Card className="w-full max-w-md p-8">
                <CardTitle className="text-2xl font-bold mb-4">Acceso Denegado</CardTitle>
                <CardDescription className="mb-6">
                Debes iniciar sesión para ver tus servicios.
                </CardDescription>
                <Button asChild>
                    <Link href="/login">
                    <LogIn className="mr-2"/>
                    Iniciar Sesión
                    </Link>
                </Button>
            </Card>
        )}
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
          <h1 className="text-3xl font-bold text-primary">Mis Servicios</h1>
        </div>
        <Button asChild>
          <Link href="/add">
            <PlusCircle className="mr-2"/>
            Agregar Nuevo
          </Link>
        </Button>
      </div>

      {loadingServices ? (
        <div className="text-center py-20">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Cargando tus servicios...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Aún no has publicado servicios</h3>
          <p className="text-muted-foreground mt-2 mb-4">¡Empieza a ofrecer tus habilidades a la comunidad!</p>
          <Button asChild>
            <Link href="/add">
                <PlusCircle className="mr-2"/>
                Publicar mi primer servicio
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(service => (
            <Card key={service.id} className="h-full flex flex-col overflow-hidden">
                {service.imageUrl && (
                    <div className="relative w-full h-48">
                        <Image
                        src={service.imageUrl}
                        alt={service.title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                        />
                    </div>
                )}
                <CardHeader>
                    <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-3">{service.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Badge variant="secondary">{service.category}</Badge>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => router.push(`/edit-service/${service.id}`)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" disabled={isDeleting === service.id}>
                                    {isDeleting === service.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                                    <span className="sr-only">Eliminar</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente el servicio
                                    y su imagen asociada.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(service.id, service.imageUrl)}>
                                    Sí, eliminar
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
