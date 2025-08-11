"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { Label } from "./ui/label"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/services/firebase"
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore"
import { useUserData } from "@/hooks/use-user-data"

interface HiringModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  serviceTitle: string;
  servicePrice: number;
  serviceImage: string;
  providerId: string;
  clientId: string;
}

export function HiringModal({ 
  open, 
  onOpenChange,
  serviceId,
  serviceTitle,
  servicePrice,
  serviceImage,
  providerId,
  clientId,
}: HiringModalProps) {
    const { userData: clientData } = useUserData();
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [message, setMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!date) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, selecciona una fecha.' });
            return;
        }
        if (!clientData) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo obtener tu información de usuario.' });
            return;
        }

        setLoading(true);
        try {
            // Get provider name
            const providerDoc = await getDoc(doc(db, 'users', providerId));
            const providerName = providerDoc.data()?.displayName ?? 'Proveedor';

            const hireDocRef = await addDoc(collection(db, 'hires'), {
                serviceId,
                providerId,
                clientId,
                serviceTitle,
                servicePrice,
                serviceImage,
                clientName: clientData.displayName,
                providerName,
                date: Timestamp.fromDate(date),
                message,
                status: 'pending', // pending, accepted, rejected, completed
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            // Create notification for the provider
            await addDoc(collection(db, 'notifications'), {
                userId: providerId,
                type: 'new_request',
                title: 'Nueva solicitud de servicio',
                message: `${clientData.displayName} ha solicitado tu servicio: "${serviceTitle}"`,
                link: `/requests`,
                read: false,
                createdAt: Timestamp.now()
            });

            toast({ title: '¡Solicitud enviada!', description: 'El proveedor ha sido notificado. Recibirás una respuesta pronto.' });
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating hire request:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar la solicitud de contratación.' });
        } finally {
            setLoading(false);
        }
    }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card/60 backdrop-blur-xl border-white/20">
        <AlertDialogHeader>
          <AlertDialogTitle>Contratar: {serviceTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            Selecciona una fecha y envía un mensaje al proveedor para iniciar la contratación.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                     <Label>1. Selecciona la fecha</Label>
                     <div className="flex justify-center rounded-md border mt-2">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="p-0"
                            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                        />
                     </div>
                </div>
                 <div className="flex-1 space-y-2">
                    <Label htmlFor="message">2. Envía un mensaje (opcional)</Label>
                    <Textarea 
                        id="message" 
                        placeholder="Hola, me gustaría contratar tu servicio para..."
                        className="h-[244px]"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
            </div>
             <div className="text-right font-bold text-lg">
                Precio del servicio: ${new Intl.NumberFormat('es-CO').format(servicePrice)}
            </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Contratación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

    