'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatformStats } from "@/hooks/use-platform-stats";
import { Users, Briefcase, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { stats, loading } = usePlatformStats();

  return (
    <div>
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Usuarios Totales
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Usuarios registrados
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Servicios Totales
                    </CardTitle>
                     <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <div className="text-2xl font-bold">{stats.totalServices}</div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Servicios publicados
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
