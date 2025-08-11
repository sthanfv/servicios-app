'use client';
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/services/firebase";
import { Button } from "@/components/ui/button";
import { useAuthState } from 'react-firebase-hooks/auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, PlusCircle, User, Moon, Sun, Shield, Heart, Briefcase, MessageSquare, Megaphone, Users, MapPin, Star } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/use-user-data";
import { ServiceSearch } from "@/components/service-search";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useServiceSearch } from "@/hooks/use-service-search";
import { useEffect } from "react";
import { motion } from "framer-motion";


function UserMenu() {
    const { user, userData, loading: userDataLoading } = useUserData();
    const [authLoading] = useAuthState(auth);
    const { theme, setTheme } = useTheme();
    const router = useRouter();

    // This effect handles role-based redirection after login and data is loaded.
    useEffect(() => {
        if (!userDataLoading && userData?.role === 'admin') {
            router.replace('/admin');
        }
    }, [userData, userDataLoading, router]);

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
                <DropdownMenuItem onSelect={() => router.push('/favorites')}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Mis Favoritos</span>
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

export default function Home() {
  const { recentServices, loading: servicesLoading } = useServiceSearch();
  const testimonials = [
    {
      quote: "¡Increíble! Encontré un fontanero en 15 minutos. La app es súper intuitiva y fácil de usar. Totalmente recomendada para cualquier emergencia.",
      name: "Ana García",
      title: "Cliente Satisfecha",
      imgSrc: "https://placehold.co/100x100.png",
      imgHint: "woman smiling"
    },
    {
      quote: "Como profesional independiente, esta plataforma me ha ayudado a conseguir nuevos clientes cada semana. La visibilidad que me da es genial.",
      name: "Carlos Rodríguez",
      title: "Electricista",
      imgSrc: "https://placehold.co/100x100.png",
      imgHint: "man portrait"
    },
    {
      quote: "La mejor parte es la comunicación directa. Pude chatear con el proveedor para aclarar todas mis dudas antes de contratar el servicio. ¡5 estrellas!",
      name: "Laura Martínez",
      title: "Diseñadora de Interiores",
      imgSrc: "https://placehold.co/100x100.png",
      imgHint: "woman portrait"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="container sticky top-0 z-50 flex justify-between items-center py-4 bg-background/80 backdrop-blur-xs">
        <Link href="/" className="flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">
            ServiciosApp Lite
          </h1>
        </Link>
        <nav className="flex items-center gap-4">
            <UserMenu />
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container text-center py-20 md:py-32">
            <motion.h1 
              className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
                La forma simple de conectar servicios
            </motion.h1>
            <motion.p 
              className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
                Publica, descubre y conecta con profesionales en tu área. Rápido, seguro y sin complicaciones.
            </motion.p>
            <motion.div 
              className="flex justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" asChild>
                        <Link href="/add">Publicar un Servicio</Link>
                    </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      Explorar Servicios
                  </Button>
                </motion.div>
            </motion.div>
        </section>

        {/* Recent Services Section */}
        <section className="bg-muted py-16">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Novedades</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto mt-2">
                        Echa un vistazo a los últimos servicios añadidos por nuestra comunidad.
                    </p>
                </div>
                 <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                    >
                    <CarouselContent>
                        {recentServices.map((service) => (
                        <CarouselItem key={service.id} className="md:basis-1/2 lg:basis-1/4">
                           <ServiceSearch.FeaturedCard service={service} />
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
            <div className="container grid md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Megaphone className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Publica Fácilmente</h3>
                    <p className="text-muted-foreground">Crea una publicación para tu servicio en menos de 5 minutos y llega a nuevos clientes.</p>
                </div>
                 <div className="flex flex-col items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Conecta Directo</h3>
                    <p className="text-muted-foreground">Comunícate directamente con los proveedores o clientes a través de nuestro chat integrado.</p>
                </div>
                 <div className="flex flex-col items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Explora Local</h3>
                    <p className="text-muted-foreground">Encuentra los mejores profesionales y servicios disponibles cerca de ti.</p>
                </div>
            </div>
        </section>

        {/* Services Section */}
        <section id="services-section" className="bg-muted py-16">
             <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Descubre Servicios</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto mt-2">
                        Usa nuestro buscador para encontrar exactamente lo que necesitas.
                    </p>
                </div>
                <ServiceSearch />
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Lo que dicen nuestros usuarios</h2>
              <p className="text-muted-foreground max-w-xl mx-auto mt-2">
                Experiencias reales de personas que confían en nosotros.
              </p>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-4xl mx-auto"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className="h-full">
                        <CardContent className="flex flex-col items-center justify-center text-center p-6 h-full">
                          <Image
                            className="rounded-full mb-4"
                            src={testimonial.imgSrc}
                            alt={testimonial.name}
                            width={80}
                            height={80}
                            data-ai-hint={testimonial.imgHint}
                          />
                          <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                          </div>
                          <p className="font-bold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted py-16">
          <div className="container">
              <div className="bg-card border rounded-xl p-8 md:p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  ¿Listo para empezar?
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  Únete a nuestra comunidad hoy mismo. Es gratis y solo toma un minuto.
                </p>
                <div className="flex justify-center gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" asChild className="w-full sm:w-auto">
                          <Link href="/signup">Crear una cuenta</Link>
                      </Button>
                    </motion.div>
                </div>
              </div>
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
