'use client';
import Link from "next/link";
import { auth } from "@/services/firebase";
import { Button } from "@/components/ui/button";
import { useAuthState } from 'react-firebase-hooks/auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, PlusCircle, User, Moon, Sun, Shield, Heart, Briefcase, MessageSquare } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/use-user-data";
import { ServiceSearch } from "@/components/service-search";


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
            <ServiceSearch />
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
