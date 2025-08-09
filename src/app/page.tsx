
'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { db, auth } from "@/services/firebase";
import { collection, onSnapshot, orderBy, query, limit, startAfter, getDocs } from "firebase/firestore";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from 'react-firebase-hooks/auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, PlusCircle, User, Moon, Sun, Search, Loader2, MessageSquare, Briefcase, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { useUserData } from "@/hooks/use-user-data";


interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  userId: string;
}

function UserMenu() {
    const { user, userData, loading: userDataLoading } = useUserData();
    const [authLoading] = useAuthState(auth);
    const { theme, setTheme } = useTheme();
    const router = useRouter();

    const handleSignOut = async () => {
        await auth.signOut();
        router.push('/');
    };
    
    const loading = authLoading || userDataLoading;

    if (loading) return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
    
    if (user && userData) {
        return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem disabled>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userData.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onSelect={() => router.push('/my-services')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Mis Servicios</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onSelect={() => router.push('/add')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Agregar Servicio</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/chat')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Mis Chats</span>
                </DropdownMenuItem>
                {userData.role === 'admin' && (
                    <DropdownMenuItem onSelect={() => router.push('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                    </DropdownMenuItem>
                )}
                 <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        );
    }
    
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
           {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
           <span className="sr-only">Toggle Theme</span>
        </Button>
        <Button asChild>
            <Link href="/login">
                <LogIn className="mr-2 h-4 w-4"/>
                Iniciar Sesión
            </Link>
        </Button>
      </div>
    );
}

const SERVICES_PER_PAGE = 8;

export default function Home() {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchServices = () => {
    setLoading(true);
    const q = query(collection(db, "services"), orderBy("createdAt", "desc"), limit(SERVICES_PER_PAGE));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Service));
      
      setAllServices(servicesData);
      setFilteredServices(servicesData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(servicesData.length === SERVICES_PER_PAGE);

      const uniqueCategories = [...new Set(servicesData.map(s => s.category))];
      setCategories(uniqueCategories);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching services:", error);
      setLoading(false);
    });

    return unsubscribe;
  };
  
  const fetchMoreServices = async () => {
    if (!lastDoc || loadingMore) return;
    
    setLoadingMore(true);
    const q = query(
      collection(db, "services"), 
      orderBy("createdAt", "desc"), 
      startAfter(lastDoc), 
      limit(SERVICES_PER_PAGE)
    );

    const documentSnapshots = await getDocs(q);
    const newServices = documentSnapshots.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Service));

    setAllServices(prev => [...prev, ...newServices]);
    setFilteredServices(prev => [...prev, ...newServices]);
    setLastDoc(documentSnapshots.docs[documentSnapshots.docs.length-1]);
    setHasMore(newServices.length === SERVICES_PER_PAGE);
    setLoadingMore(false);
  }


  useEffect(() => {
    const unsubscribe = fetchServices();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let services = [...allServices];

    if (debouncedSearchTerm) {
      const lowercasedTerm = debouncedSearchTerm.toLowerCase();
      services = services.filter(service => 
        service.title.toLowerCase().includes(lowercasedTerm) ||
        service.description.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      services = services.filter(service => service.category === selectedCategory);
    }

    setFilteredServices(services);
     // Note: Pagination is disabled when filters are active for simplicity.
     // For a full implementation, filtering should be done server-side.
    setHasMore(!debouncedSearchTerm && selectedCategory === 'all' && allServices.length % SERVICES_PER_PAGE === 0 && allServices.length > 0)
  }, [debouncedSearchTerm, selectedCategory, allServices]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="container sticky top-0 z-50 flex justify-between items-center py-4 bg-background/80 backdrop-blur-xs">
        <Link href="/" className="flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">
            ServiciosApp Lite
          </h1>
        </Link>
        <div className="flex items-center gap-4">
            <UserMenu />
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container text-center py-16 md:py-24">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-primary">
                Encuentra y publica servicios locales con facilidad
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                Tu plataforma minimalista para conectar con profesionales y clientes en tu área. Rápido, seguro y directo.
            </p>
            <div className="flex justify-center gap-4">
                <Button size="lg" asChild>
                    <Link href="/add">Publicar un Servicio</Link>
                </Button>
                 <Button size="lg" variant="outline" onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    Explorar Servicios
                </Button>
            </div>
        </section>

        {/* Services Section */}
        <section id="services-section" className="container py-10">
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
                    {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="text-center py-20">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Cargando servicios...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No se encontraron servicios</h3>
                <p className="text-muted-foreground mt-2">Intenta ajustar tu búsqueda o filtros.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredServices.map((service) => (
                  <Link href={`/service/${service.id}`} key={service.id} className="group">
                    <Card className="h-full flex flex-col overflow-hidden transform transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                      {service.imageUrl ? (
                        <div className="relative w-full h-48">
                          <Image
                            src={service.imageUrl}
                            alt={service.title}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-t-lg"
                            data-ai-hint="product image"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
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
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 text-center">
                  <Button onClick={fetchMoreServices} disabled={loadingMore}>
                    {loadingMore ? <Loader2 className="mr-2 animate-spin"/> : null}
                    Cargar más
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* CTA Section */}
        <section className="container py-16">
          <div className="bg-card border rounded-xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Publica tu servicio en minutos y llega a miles de clientes potenciales o encuentra al profesional perfecto para lo que necesitas.
            </p>
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/add">Publicar un Servicio Ahora</Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="w-full border-t border-border/50 bg-card">
        <div className="container text-center py-6 text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ServiciosApp Lite. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
