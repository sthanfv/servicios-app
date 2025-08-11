'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServiceSearch, Service } from '@/hooks/use-service-search';
import { Loader2, Search, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { motion } from 'framer-motion';

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
  return (
    <motion.div variants={gridItemVariants} className="h-full">
        <Link href={`/service/${service.id}`} className="group h-full">
        <Card className="h-full flex flex-col overflow-hidden transform transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
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
            </div>
            <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                 <div className="flex items-center text-muted-foreground text-sm gap-2 pt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{service.city}{service.zone ? `, ${service.zone}` : ''}</span>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <p className="text-muted-foreground line-clamp-2">{service.description}</p>
                <div className="flex justify-between items-center">
                    <Badge variant="secondary">{service.category}</Badge>
                    <span className="text-lg font-bold text-primary">
                        ${new Intl.NumberFormat('es-CO').format(service.price)}
                    </span>
                </div>
            </CardContent>
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
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                 <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/3" />
                </div>
            </CardContent>
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
      <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, descripción..."
            className="pl-10 h-12 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[240px] h-12 text-base">
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
