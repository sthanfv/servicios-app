'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatformStats } from "@/hooks/use-platform-stats";
import { Users, Briefcase, Loader2, Handshake, BarChart, LineChart } from "lucide-react";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

export default function AdminDashboard() {
  const { stats, userGrowthData, loading } = usePlatformStats();
  const chartConfig = {
      users: {
        label: "Nuevos Usuarios",
        color: "hsl(var(--primary))",
      },
  } satisfies import("@/components/ui/chart").ChartConfig;


  return (
    <div className="space-y-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Contrataciones Totales
                    </CardTitle>
                     <Handshake className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <div className="text-2xl font-bold">{stats.totalHires}</div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Solicitudes de servicio
                    </p>
                </CardContent>
            </Card>
        </div>

        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Crecimiento de Usuarios
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="h-[350px] w-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin" />
                         </div>
                    ) : (
                        <ChartContainer config={chartConfig} className="h-[350px] w-full">
                           <RechartsBarChart
                                data={userGrowthData}
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: 0,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis allowDecimals={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="users" fill="var(--color-users)" radius={4} />
                            </RechartsBarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
