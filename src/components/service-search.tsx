'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServiceSearch, Service } from '@/hooks/use-service-search';
import { Loader2, Search, Star, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const gridItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
    },
};

function ServiceCard({ service }: { service: Service }) {
  const rating = service.averageRating?.toFixed(1) || '0.0';
  const reviewCount = service.reviewCount || 0;

  return (
    <motion.div variants={gridItemVariants} className="h-full">
        <Link href={`/service/${service.id}`} className="group h-full">
            <Card className="h-full flex flex-col overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-xl">
                  {service.imageUrl ? (
                    <Image
                    src={service.imageUrl}
                    alt={service.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-110"
                    data-ai-hint="service image"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">Sin imagen</span>
                    </div>
                  )}
                   <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <span className="text-xl font-bold text-white">
                            ${new Intl.NumberFormat('es-CO').format(service.price)}
                        </span>
                    </div>
                </div>
                <CardHeader>
                    <div className="flex justify-between items-start">
                         <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                         <Badge variant="secondary">{service.category}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                </CardContent>
                 <CardFooter className="border-t pt-4">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={service.providerImage} alt={service.providerName} />
                              <AvatarFallback>
                                {service.providerName?.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium">{service.providerName}</p>
                               {service.providerVerified && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <ShieldCheck className="h-5 w-5 text-blue-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Proveedor Verificado</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-foreground">{rating}</span>
                            <span>({reviewCount})</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    </motion.div>
  );
}


function ServiceCardSkeleton() {
    return (
        <Card className="h-full flex flex-col overflow-hidden">
            <Skeleton className="w-full aspect-[4/3] rounded-t-xl" />
            <CardHeader>
                <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-3/5" />
                    <Skeleton className="h-6 w-1/4" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="border-t pt-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="flex items-center gap-1">
                         <Skeleton className="h-5 w-16" />
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}


function FeaturedServiceCard({ service }: { service: Service }) {
  return (
    <Card className="h-full flex flex-col overflow-hidden group border-transparent hover:border-primary transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-card">
       <Link href={`/service/${service.id}`} className="block">
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-lg">
            {service.imageUrl ? (
            <Image
                src={service.imageUrl}
                alt={service.title}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-110"
                data-ai-hint="featured service"
            />
            ) : (
            <div className="w-full h-full bg-muted/50 flex items-center justify-center rounded-t-lg">
                <span className="text-muted-foreground">Sin imagen</span>
            </div>
            )}
        </div>
      </Link>
      <CardHeader>
        <CardTitle className="line-clamp-1 text-base font-semibold">{service.title}</CardTitle>
        <Badge variant="secondary" className="w-fit">{service.category}</Badge>
      </CardHeader>
      <CardContent className="flex-grow">
         <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
            <Link href={`/service/${service.id}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function NoveltyCard({ service }: { service: Service }) {
  return (
     <Link href={`/service/${service.id}`} className="group block">
        <Card className="overflow-hidden h-full transform transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
            <div className="relative w-full aspect-[3/4]">
                 {service.imageUrl ? (
                    <Image
                        src={service.imageUrl}
                        alt={service.title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-110"
                        data-ai-hint="novelty service"
                    />
                 ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground text-center p-2">Sin imagen</span>
                    </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                 <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="font-bold text-sm line-clamp-2">{service.title}</h3>
                    <Badge variant="secondary" className="mt-1 text-xs">{service.category}</Badge>
                 </div>
            </div>
        </Card>
     </Link>
  )
}

export function ServiceSearch() {
  const {
    services,
    loading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    hasMore,
    fetchMore,
    loadingMore,
  } = useServiceSearch();

  return (
    <>
      <div className="flex items-center gap-2 mb-8 max-w-3xl mx-auto bg-card p-2 rounded-xl shadow-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="¿Qué servicio necesitas?"
            className="pl-10 h-12 text-base bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[240px] h-12 text-base bg-muted border-none hover:bg-muted/80">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="lg" className="h-12 hidden md:inline-flex">Buscar</Button>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
                <ServiceCardSkeleton key={i} />
            ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-card">
          <h3 className="text-xl font-semibold">No se encontraron servicios</h3>
          <p className="text-muted-foreground mt-2">
            Intenta ajustar tu búsqueda o filtros.
          </p>
        </div>
      ) : (
        <>
            <motion.div 
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={gridContainerVariants}
                initial="hidden"
                animate="visible"
            >
            {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
            ))}
            </motion.div>
            {hasMore && (
                <div className="flex justify-center mt-8">
                    <Button onClick={fetchMore} disabled={loadingMore}>
                        {loadingMore ? <Loader2 className="mr-2 animate-spin" /> : null}
                        Cargar más
                    </Button>
                </div>
            )}
        </>
      )}
    </>
  );
}

ServiceSearch.FeaturedCard = FeaturedServiceCard;
ServiceSearch.NoveltyCard = NoveltyCard;
