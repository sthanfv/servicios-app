'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServiceSearch, Service } from '@/hooks/use-service-search';
import { Loader2, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/service/${service.id}`} className="group">
      <Card className="h-full flex flex-col overflow-hidden transform transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
        {service.imageUrl ? (
          <div className="relative w-full h-48">
            <Image
              src={service.imageUrl}
              alt={service.title}
              layout="fill"
              objectFit="cover"
              className="rounded-t-xl"
              data-ai-hint="service image"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-xl">
            <span className="text-muted-foreground">Sin imagen</span>
          </div>
        )}
        <CardHeader>
          <CardTitle>{service.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground line-clamp-3">{service.description}</p>
        </CardContent>
        <CardFooter>
          <Badge variant="secondary">{service.category}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}

function ServiceCardSkeleton() {
    return (
        <Card className="h-full flex flex-col overflow-hidden">
            <Skeleton className="w-full h-48 rounded-t-xl" />
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-6 w-1/4" />
            </CardFooter>
        </Card>
    );
}


function FeaturedServiceCard({ service }: { service: Service }) {
  return (
    <Card className="h-full flex flex-col overflow-hidden group border-primary/20 hover:border-primary transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
       <Link href={`/service/${service.id}`} className="block">
        <div className="relative w-full aspect-[4/3]">
            {service.imageUrl ? (
            <Image
                src={service.imageUrl}
                alt={service.title}
                layout="fill"
                objectFit="cover"
                className="rounded-t-xl"
                data-ai-hint="featured service"
            />
            ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center rounded-t-xl">
                <span className="text-muted-foreground">Sin imagen</span>
            </div>
            )}
        </div>
      </Link>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-lg">{service.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
         <Badge variant="secondary">{service.category}</Badge>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
            <Link href={`/service/${service.id}`}>Ver Más</Link>
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
  } = useServiceSearch();

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o descripción..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Categorías" />
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
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No se encontraron servicios</h3>
          <p className="text-muted-foreground mt-2">
            Intenta ajustar tu búsqueda o filtros.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </>
  );
}

ServiceSearch.FeaturedCard = FeaturedServiceCard;
    
