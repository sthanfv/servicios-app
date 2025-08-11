
'use client';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { Home, Users, Settings, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useUserData } from "@/hooks/use-user-data";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userData, loading } = useUserData();
  const router = useRouter();

  // This effect acts as a route guard.
  useEffect(() => {
    // If loading is finished and the user is not an admin, redirect.
    if (!loading && (!userData || userData.role !== 'admin')) {
      router.replace('/');
    }
  }, [userData, loading, router]);


  // While loading, show a loading screen.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Verificando acceso de administrador...</p>
        </div>
      </div>
    );
  }

  // If after loading, the user is not an admin, render null while redirecting.
  if (!userData || userData.role !== 'admin') {
      return null;
  }
  
  // If loading is complete and the user is an admin, render the admin layout.
  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Link href="/admin">
                            <Home />
                            Dashboard
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                         <Link href="/admin/users">
                            <Users />
                            Usuarios
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Link href="/">
                            <Settings />
                            Volver a la App
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </Sidebar>
        <SidebarInset>
            <header className="flex items-center justify-between p-4 border-b">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
            </header>
            <main className="p-4">
                 {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  )
}
