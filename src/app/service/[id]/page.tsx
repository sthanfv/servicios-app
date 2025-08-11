'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, onSnapshot, addDoc, Timestamp, orderBy, runTransaction, increment, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Share2, Star, Heart, MapPin, Briefcase, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFavorites } from '@/hooks/use-favorites';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { HiringModal } from '@/components/hiring-modal';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface Service {
  title: string;
  description: string;
  category: string;
  price: number;
  city: string;
  zone?: string;
  imageUrl?: string;
  userId: string;
  providerVerified?: boolean;
  reviewCount?: number;
  averageRating?: number;
}

interface UserProfile {
    displayName: string;
    photoURL?: string;
    verified?: boolean;
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
            <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <Heart className={`transition-colors ${isFavorited ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
            </motion.div>
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
  const [hiringModalOpen, setHiringModalOpen] = useState(false);
  const [reviewDistribution, setReviewDistribution] = useState([0, 0, 0, 0, 0]);


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
                    photoURL: userData.photoURL ?? '',
                    verified: userData.verified ?? false
                });
            } else {
                 setProvider({
                    displayName: 'Proveedor Anónimo',
                    photoURL: '',
                    verified: false
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

  // Effect for fetching reviews and distribution
  useEffect(() => {
      if(!serviceId) return;

      const reviewsQuery = query(collection(db, `services/${serviceId}/reviews`), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
          const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
          setReviews(reviewsData);

          const distribution = [5, 4, 3, 2, 1].map(
            (stars) => reviewsData.filter((r) => r.rating === stars).length
          );
          setReviewDistribution(distribution);

          if(currentUser) {
              const userReview = reviewsData.find(r => r.userId === currentUser.uid);
              setHasReviewed(!!userReview);
          }
      });
      
      return () => unsubscribe();

  }, [serviceId, currentUser]);


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
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            // User cancelled the share sheet, do nothing.
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

  const handleHire = () => {
    if (!currentUser) {
        toast({
            variant: 'destructive',
            title: 'Acción requerida',
            description: 'Debes iniciar sesión para contratar un servicio.',
        });
        router.push('/login');
        return;
    }
     if (currentUser.uid === service?.userId) {
        toast({
            title: 'Este es tu servicio',
            description: 'No puedes contratar tu propio servicio.',
        });
        return;
    }
    setHiringModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(!currentUser || !serviceId || !service) {
          toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para dejar una reseña.' });
          return;
      }
      if(reviewRating === 0){
          toast({ variant: 'destructive', title: 'Error', description: 'Por favor, selecciona una calificación.' });
          return;
      }

      setIsSubmittingReview(true);
      try {
          const serviceRef = doc(db, 'services', serviceId);
          const reviewRef = doc(collection(db, `services/${serviceId}/reviews`));
          const notificationRef = doc(collection(db, 'notifications'));

          await runTransaction(db, async (transaction) => {
             const serviceDoc = await transaction.get(serviceRef);
             if (!serviceDoc.exists()) {
                 throw new Error("El servicio no existe");
             }

             const currentData = serviceDoc.data();
             const currentReviewCount = currentData.reviewCount || 0;
             const currentAverageRating = currentData.averageRating || 0;

             const newReviewCount = currentReviewCount + 1;
             const newAverageRating = ((currentAverageRating * currentReviewCount) + reviewRating) / newReviewCount;

             // 1. Update service document with new stats
             transaction.update(serviceRef, {
                 reviewCount: newReviewCount,
                 averageRating: newAverageRating
             });

             // 2. Add the new review
             transaction.set(reviewRef, {
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userAvatar: currentUser.photoURL,
                rating: reviewRating,
                comment: reviewComment,
                createdAt: Timestamp.now()
             });

            // 3. Create notification for the provider
            transaction.set(notificationRef, {
                userId: service.userId,
                type: 'new_review',
                title: '¡Nueva reseña!',
                message: `${currentUser.displayName} ha dejado una reseña de ${reviewRating} estrellas en tu servicio: "${service.title}".`,
                link: `/service/${serviceId}`,
                read: false,
                createdAt: Timestamp.now()
            });

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
                <Share2 className="mr-2 h-4 w-4" />
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
                            fill
                            objectFit="cover"
                        />
                    </div>
                )}
                <CardHeader>
                <div className='flex justify-between items-start'>
                    <div>
                    <Badge variant="secondary" className="mb-2">{service.category}</Badge>
                    <CardTitle className="text-3xl md:text-4xl font-bold">{service.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground text-sm gap-2 pt-2">
                        <MapPin className="h-4 w-4" />
                        <span>{service.city}{service.zone ? `, ${service.zone}` : ''}</span>
                    </div>
                    </div>
                     <span className="text-2xl font-bold text-primary">
                        ${new Intl.NumberFormat('es-CO').format(service.price)}
                    </span>
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
                    {(service.reviewCount || 0) > 0 && (
                        <div className="flex items-center gap-2 pt-2">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={`h-5 w-5 ${(service.averageRating || 0) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                ))}
                            </div>
                            <span className="font-bold text-lg">{service.averageRating?.toFixed(1)}</span>
                            <span className="text-muted-foreground text-sm">({service.reviewCount} reseñas)</span>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                     {(service.reviewCount || 0) > 0 && (
                       <div className="space-y-2 mb-8">
                           {reviewDistribution.map((count, index) => {
                               const stars = 5 - index;
                               const percentage = (service.reviewCount || 0) > 0 ? (count / (service.reviewCount || 1)) * 100 : 0;
                               return (
                                   <div key={stars} className="flex items-center gap-2 text-sm">
                                       <span className="w-16">{stars} estrellas</span>
                                       <Progress value={percentage} className="flex-1 h-2" />
                                       <span className="w-8 text-right text-muted-foreground">{count}</span>
                                   </div>
                               );
                           })}
                       </div>
                    )}
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
                           <Button type="submit" disabled={isSubmittingReview || reviewRating === 0}>
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
                             <Link href={`/profile/${service.userId}`} className="flex items-center gap-4 group">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={provider.photoURL ?? ''} />
                                    <AvatarFallback>{provider.displayName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-1">
                                        <p className='font-semibold group-hover:underline'>{provider.displayName}</p>
                                        {provider.verified && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                         <ShieldCheck className="h-4 w-4 text-blue-500" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Proveedor Verificado</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                    <p className='text-sm text-muted-foreground'>Ver perfil</p>
                                </div>
                             </Link>
                        </div>
                     )}
                     
                    {isOwner ? (
                        <Button disabled className="w-full">Es tu servicio</Button>
                    ) : (
                        <Button onClick={handleHire} className="w-full">
                            <Briefcase className="mr-2 h-4 w-4" />
                            Contratar Servicio
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      {currentUser && !isOwner && service && (
        <HiringModal
            open={hiringModalOpen}
            onOpenChange={setHiringModalOpen}
            serviceId={serviceId}
            serviceTitle={service.title}
            servicePrice={service.price}
            serviceImage={service.imageUrl || ''}
            providerId={service.userId}
            clientId={currentUser.uid}
        />
      )}
    </main>
  );
}

    