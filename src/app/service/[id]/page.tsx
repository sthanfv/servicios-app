'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  userId: string;
}

export default function ServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;

    const fetchService = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'services', serviceId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setService(docSnap.data() as Service);
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

    fetchService();
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


  if (loading) {
    return (
      <main className="container min-h-screen flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }

  if (!service) {
    return null; // Or a more comprehensive "Not Found" component
  }

  return (
    <main className="container py-10">
       <div className="flex justify-between items-center mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2" />
            Compartir
        </Button>
      </div>

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
          <CardDescription className="text-base md:text-lg whitespace-pre-wrap">
            {service.description}
          </CardDescription>
        </CardContent>
      </Card>
    </main>
  );
}
