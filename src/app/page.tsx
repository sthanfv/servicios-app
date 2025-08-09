'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { db, auth } from "@/services/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from 'react-firebase-hooks/auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, PlusCircle, User, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  userId: string;
}

function UserMenu() {
    const [user, loading] = useAuthState(auth);
    const { theme, setTheme } = useTheme();
    const router = useRouter();

    const handleSignOut = async () => {
        await auth.signOut();
        router.push('/');
    };

    if (loading) return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
    
    return user ? (
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
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuItem>
            <Separator />
             <DropdownMenuItem onSelect={() => router.push('/my-services')}>
              <User className="mr-2 h-4 w-4" />
              <span>Mis Servicios</span>
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => router.push('/add')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Agregar Servicio</span>
            </DropdownMenuItem>
             <Separator />
            <DropdownMenuItem onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    ) : (
        <Button asChild>
            <Link href="/login">
                <LogIn className="mr-2" />
                Iniciar Sesión
            </Link>
        </Button>
    );
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Service));
      setServices(servicesData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="container py-10">
       <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">
          Servicios Populares
        </h1>
        <div className="flex items-center gap-4">
            <UserMenu />
        </div>
      </header>
      
      {services.length === 0 ? (
         <div className="text-center py-20">
            <p className="text-muted-foreground">No hay servicios disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
              <Card key={service.id} className="h-full flex flex-col overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
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
          ))}
        </div>
      )}
    </div>
  );
}
