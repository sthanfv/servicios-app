'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '@/services/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, Timestamp, addDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, ArrowLeft, LogIn, Handshake, Calendar, User, Tag, AlertCircle, CheckCircle, XCircle, Hourglass, Star, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface Hire {
  id: string;
  clientId: string;
  serviceId: string;
  serviceTitle: string;
  clientName: string;
  message: string;
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

export default function RequestsPage() {
  const [user, authLoading] = useAuthState(auth);
  const [requests, setRequests] = useState<Hire[]>([]);
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
        where('providerId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hiresData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hire));
      setRequests(hiresData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching requests: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar tus solicitudes.' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);

  const handleUpdateStatus = async (hire: Hire, newStatus: Hire['status']) => {
    try {
        const hireRef = doc(db, 'hires', hire.id);
        await updateDoc(hireRef, { status: newStatus, updatedAt: Timestamp.now() });

        // Create notification for the client
        let notificationTitle = '';
        let notificationMessage = '';

        if (newStatus === 'accepted') {
            notificationTitle = '¡Solicitud Aceptada!';
            notificationMessage = `Tu solicitud para el servicio "${hire.serviceTitle}" ha sido aceptada.`;
        } else if (newStatus === 'rejected') {
            notificationTitle = 'Solicitud Rechazada';
            notificationMessage = `Lamentablemente, tu solicitud para "${hire.serviceTitle}" fue rechazada.`;
        } else if (newStatus === 'completed') {
            notificationTitle = '¡Servicio Completado!';
            notificationMessage = `El servicio "${hire.serviceTitle}" ha sido marcado como completado. ¡No olvides dejar una reseña!`;
        }
        
        if (notificationTitle) {
            await addDoc(collection(db, 'notifications'), {
                userId: hire.clientId,
                type: `hire_${newStatus}`,
                title: notificationTitle,
                message: notificationMessage,
                link: `/my-hires`,
                read: false,
                createdAt: Timestamp.now()
            });
        }

        toast({ title: 'Estado actualizado', description: 'La solicitud ha sido actualizada correctamente.' });
    } catch (error) {
        console.error("Error updating status: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el estado.' });
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
            Debes iniciar sesión para ver tus solicitudes.
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
          <h1 className="text-3xl font-bold text-primary">Solicitudes Recibidas</h1>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
           <Handshake className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No tienes solicitudes pendientes</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            Cuando un cliente contrate uno de tus servicios, aparecerá aquí.
          </p>
           <Button asChild>
            <Link href="/add">
              Publicar un nuevo servicio
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const statusInfo = statusConfig[req.status];
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={req.id}>
                 <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                             <CardTitle>{req.serviceTitle}</CardTitle>
                             <CardDescription>Solicitud de: <Link href={`/profile/${req.clientId}`} className="text-primary hover:underline font-semibold">{req.clientName}</Link></CardDescription>
                        </div>
                        <Badge variant="outline" className={`w-fit border-none text-white ${statusInfo.color}`}>
                            <StatusIcon className="mr-2 h-4 w-4" />
                            {statusInfo.label}
                        </Badge>
                    </div>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="h-4 w-4" /> 
                        <span>Fecha solicitada: {req.date.toDate().toLocaleDateString()}</span>
                    </div>
                    {req.message && (
                        <div className="p-3 bg-muted rounded-lg border">
                            <p className="text-sm text-muted-foreground italic">"{req.message}"</p>
                        </div>
                    )}
                 </CardContent>
                 <CardFooter className="flex-wrap gap-2">
                    {req.status === 'pending' && (
                        <>
                            <Button onClick={() => handleUpdateStatus(req, 'accepted')}>Aceptar</Button>
                            <Button variant="destructive" onClick={() => handleUpdateStatus(req, 'rejected')}>Rechazar</Button>
                        </>
                    )}
                     {req.status === 'accepted' && (
                        <Button onClick={() => handleUpdateStatus(req, 'completed')}>Marcar como Completada</Button>
                     )}
                     <Button variant="outline" asChild>
                        <Link href={`/chat?contact=${req.clientId}`}><MessageSquare className="mr-2 h-4 w-4"/>Contactar</Link>
                     </Button>
                     <Button variant="secondary" asChild>
                        <Link href={`/service/${req.serviceId}`}>Ver Servicio</Link>
                     </Button>
                 </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
