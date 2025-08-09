
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, onSnapshot, addDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, MessageSquare, Share2, Star, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFavorites } from '@/hooks/use-favorites';

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

interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    comment: string;
    createdAt: Timestamp;
}

function FavoriteButton({ serviceId }: { serviceId: string }) {
    const { isFavorited, toggleFavorite, loading } = useFavorites(serviceId);

    if (loading) {
        return (
            <Button variant="outline" size="icon" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
        );
    }

    return (
        <Button variant="outline" size="icon" onClick={toggleFavorite} aria-label="Toggle Favorite">
            <Heart className={`transition-all ${isFavorited ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
        </Button>
    )
}

export default function ServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const serviceId = params.id as string;

  const [currentUser, authLoading] = useAuthState(auth);
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);


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

          if (serviceData.userId) {
            const userRef = doc(db, "users", serviceData.userId);
            const userSnap = await getDoc(userRef);
            if(userSnap.exists()){
                const userData = userSnap.data();
                setProvider({
                    displayName: userData.displayName ?? 'Proveedor',
                    photoURL: userData.photoURL ?? ''
                });
            } else {
                 setProvider({
                    displayName: 'Proveedor Anónimo',
                    photoURL: ''
                 });
            }
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

  // Effect for fetching reviews
  useEffect(() => {
      if(!serviceId) return;

      const reviewsQuery = query(collection(db, `services/${serviceId}/reviews`), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
          const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
          setReviews(reviewsData);

          // Check if current user has already reviewed
          if(currentUser) {
              const userReview = reviewsData.find(r => r.userId === currentUser.uid);
              setHasReviewed(!!userReview);
          }
      });
      
      return () => unsubscribe();

  }, [serviceId, currentUser])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: '¡Copiado!', description: 'Enlace copiado al portapapeles.' });
  };

  const handleShare = async () => {
    const shareData = {
      title: service?.title,
      text: `Mira este servicio: ${service?.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: '¡Compartido!', description: 'El enlace al servicio ha sido compartido.' });
      } catch (error) {
        // This error is often a "Permission Denied" error, which we can safely ignore
        // and fall back to the clipboard method.
        if (error instanceof DOMException && error.name === 'AbortError') {
            // User cancelled the share sheet
        } else {
            // Fallback for other errors or browsers that fail to share
            copyToClipboard();
        }
      }
    } else {
      // Fallback for browsers that do not support the Share API
      copyToClipboard();
    }
  };

  const handleContact = () => {
    if (!currentUser) {
        toast({
            variant: 'destructive',
            title: 'Acción requerida',
            description: 'Debes iniciar sesión para contactar al proveedor.',
        });
        router.push('/login');
        return;
    }
    if (currentUser.uid === service?.userId) {
        toast({
            title: 'Este es tu servicio',
            description: 'No puedes iniciar un chat contigo mismo.',
        });
        return;
    }
    router.push(`/chat?contact=${service?.userId}`);
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(!currentUser || !serviceId) {
          toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para dejar una reseña.' });
          return;
      }
      if(reviewRating === 0){
          toast({ variant: 'destructive', title: 'Error', description: 'Por favor, selecciona una calificación.' });
          return;
      }

      setIsSubmittingReview(true);
      try {
          await addDoc(collection(db, `services/${serviceId}/reviews`), {
              userId: currentUser.uid,
              userName: currentUser.displayName,
              userAvatar: currentUser.photoURL,
              rating: reviewRating,
              comment: reviewComment,
              createdAt: Timestamp.now()
          });
          toast({ title: '¡Gracias!', description: 'Tu reseña ha sido publicada.' });
          setReviewComment("");
          setReviewRating(0);
      } catch (error) {
          console.error("Error submitting review:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo publicar tu reseña.' });
      } finally {
          setIsSubmittingReview(false);
      }
  }


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
  
  const isOwner = currentUser && currentUser.uid === service.userId;
  const canReview = !isOwner && currentUser && !hasReviewed;

  return (
    <main className="container py-10">
       <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className='flex gap-2'>
            {currentUser && !isOwner && <FavoriteButton serviceId={serviceId} />}
            <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2" />
                Compartir
            </Button>
        </div>
      </div>

      <div className='grid md:grid-cols-3 gap-8'>
        <div className='md:col-span-2 space-y-8'>
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

            {/* Reviews Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Reseñas y Calificaciones</CardTitle>
                </CardHeader>
                <CardContent>
                    {canReview && (
                        <form onSubmit={handleReviewSubmit} className="mb-6 space-y-4 p-4 border rounded-lg">
                           <h4 className='font-semibold'>Deja tu opinión</h4>
                           <div className='flex items-center gap-2'>
                                <Label>Tu calificación:</Label>
                                <div className='flex'>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`cursor-pointer h-6 w-6 ${reviewRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                                            onClick={() => setReviewRating(star)}
                                        />
                                    ))}
                                </div>
                           </div>
                           <div>
                                <Label htmlFor="comment">Tu comentario (opcional):</Label>
                                <Textarea 
                                    id="comment" 
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="¿Qué te pareció el servicio?"
                                    disabled={isSubmittingReview}
                                />
                           </div>
                           <Button type="submit" disabled={isSubmittingReview}>
                               {isSubmittingReview ? <Loader2 className='mr-2 animate-spin' /> : null}
                               Publicar Reseña
                           </Button>
                        </form>
                    )}
                    {hasReviewed && <p className='text-center text-muted-foreground p-4 border rounded-lg mb-6'>Ya has dejado una reseña para este servicio. ¡Gracias!</p>}
                    
                    <div className='space-y-6'>
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <div key={review.id} className='flex gap-4'>
                                    <Avatar>
                                        <AvatarImage src={review.userAvatar} />
                                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <p className='font-semibold'>{review.userName}</p>
                                            <span className='text-xs text-muted-foreground'>
                                                {review.createdAt.toDate().toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className={`h-4 w-4 ${review.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                            ))}
                                        </div>
                                        <p className='mt-1 text-sm text-muted-foreground'>{review.comment}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className='text-center text-muted-foreground py-8'>Aún no hay reseñas para este servicio. ¡Sé el primero!</p>
                        )}
                    </div>
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
                                <p className='text-sm text-muted-foreground'>Proveedor</p>
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
