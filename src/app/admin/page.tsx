'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatformStats } from "@/hooks/use-platform-stats";
import { Users, Briefcase, Loader2, Handshake, BarChart, PieChart as PieChartIcon } from "lucide-react";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, PieChart, Pie, Cell, TooltipProps } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-background border rounded-lg shadow-lg">
        <p className="font-bold">{`${payload[0].name}`}</p>
        <p className="text-muted-foreground">{`Servicios: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};


export default function AdminDashboard() {
  const { stats, userGrowthData, serviceCategoryData, loading } = usePlatformStats();
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
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
            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5" />
                        Distribución de Servicios
                    </CardTitle>
                </CardHeader>
                 <CardContent>
                      {loading ? (
                         <div className="h-[350px] w-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin" />
                         </div>
                    ) : (
                       <ResponsiveContainer width="100%" height={350}>
                         <PieChart>
                           <Pie
                             data={serviceCategoryData}
                             cx="50%"
                             cy="50%"
                             labelLine={false}
                             outerRadius={100}
                             innerRadius={60}
                             fill="#8884d8"
                             dataKey="value"
                             nameKey="name"
                           >
                             {serviceCategoryData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <Tooltip content={<CustomTooltip />} />
                           <Legend iconSize={10}/>
                         </PieChart>
                       </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
