'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '@/services/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, ArrowLeft, LogIn, ShoppingCart, Calendar, User, AlertCircle, CheckCircle, XCircle, Hourglass, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface Hire {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  providerName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  date: Timestamp;
}

const statusConfig = {
    pending: { label: 'Pendiente', icon: Hourglass, color: 'bg-yellow-500' },
    accepted: { label: 'Aceptada', icon: CheckCircle, color: 'bg-green-500' },
    rejected: { label: 'Rechazada', icon: XCircle, color: 'bg-red-500' },
    completed: { label: 'Completada', icon: Star, color: 'bg-blue-500' },
    cancelled: { label: 'Cancelada', icon: AlertCircle, color: 'bg-gray-500' },
};

export default function MyHiresPage() {
  const [user, authLoading] = useAuthState(auth);
  const [hires, setHires] = useState<Hire[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const q = query(
        collection(db, 'hires'), 
        where('clientId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hiresData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hire));
      setHires(hiresData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching hires: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar tus contrataciones.' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);

  const handleCancelHire = async (hireId: string) => {
    try {
        const hireRef = doc(db, 'hires', hireId);
        await updateDoc(hireRef, { status: 'cancelled', updatedAt: Timestamp.now() });
        toast({ title: 'Contratación cancelada', description: 'Has cancelado la solicitud de servicio.' });
    } catch (error) {
        console.error("Error cancelling hire: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cancelar la contratación.' });
    }
  }

  if (authLoading || loading) {
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
            Debes iniciar sesión para ver tus contrataciones.
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
          <h1 className="text-3xl font-bold text-primary">Mis Contrataciones</h1>
        </div>
      </div>

      {hires.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
           <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Aún no has contratado servicios</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            Explora los servicios y encuentra lo que necesitas.
          </p>
          <Button asChild>
            <Link href="/">
              Explorar Servicios
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {hires.map((hire) => {
            const statusInfo = statusConfig[hire.status];
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={hire.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-1/4 h-48 md:h-auto">
                        <Image
                            src={hire.serviceImage || 'https://placehold.co/600x400.png'}
                            alt={hire.serviceTitle}
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                    <div className='flex-1'>
                        <CardHeader>
                             <div className="flex justify-between items-start">
                                <CardTitle>{hire.serviceTitle}</CardTitle>
                                <Badge variant="outline" className={`w-fit border-none text-white ${statusInfo.color}`}>
                                    <StatusIcon className="mr-2 h-4 w-4" />
                                    {statusInfo.label}
                                </Badge>
                             </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" /> 
                                <span>Proveedor: {hire.providerName}</span>
                            </div>
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" /> 
                                <span>Fecha: {hire.date.toDate().toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-wrap gap-2">
                           {hire.status === 'pending' && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Cancelar</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás seguro de cancelar?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. El proveedor será notificado de la cancelación.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>No, mantener</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleCancelHire(hire.id)}>Sí, cancelar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                           )}
                           {hire.status === 'completed' && (
                               <Button asChild>
                                   <Link href={`/service/${hire.serviceId}`}>Dejar Reseña</Link>
                               </Button>
                           )}
                           <Button variant="outline" asChild>
                               <Link href={`/service/${hire.serviceId}`}>Ver Servicio</Link>
                           </Button>
                        </CardFooter>
                    </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
