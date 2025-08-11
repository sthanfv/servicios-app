
'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Handshake, Star } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { ScrollArea } from './ui/scroll-area';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

const iconMap = {
    new_request: <Handshake className="h-5 w-5 text-blue-500" />,
    hire_accepted: <Handshake className="h-5 w-5 text-green-500" />,
    hire_rejected: <Handshake className="h-5 w-5 text-red-500" />,
    hire_completed: <Star className="h-5 w-5 text-yellow-500" />,
    new_review: <Star className="h-5 w-5 text-yellow-500" />,
    default: <Bell className="h-5 w-5 text-gray-500" />
};

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    const getIconForType = (type: string) => {
        const key = Object.keys(iconMap).find(k => type.startsWith(k));
        return iconMap[key as keyof typeof iconMap] || iconMap.default;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4">
                    <h4 className="font-medium text-lg">Notificaciones</h4>
                </div>
                <Separator />
                <ScrollArea className="h-[300px]">
                   {notifications.length > 0 ? (
                        <div className="flex flex-col">
                        {notifications.map(notif => (
                           <Link
                            href={notif.link}
                            key={notif.id}
                            className={cn(
                                'flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors',
                                !notif.read && 'bg-blue-500/10'
                            )}
                            onClick={() => markAsRead(notif.id)}
                           >
                            <div className="mt-1">
                                {getIconForType(notif.type)}
                            </div>
                             <div className="flex-1">
                                <p className="font-semibold text-sm">{notif.title}</p>
                                <p className="text-xs text-muted-foreground">{notif.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(notif.createdAt.seconds * 1000).toLocaleString()}
                                </p>
                             </div>
                           </Link>
                        ))}
                        </div>
                   ) : (
                        <div className="text-center text-muted-foreground p-8">
                            <p>No tienes notificaciones</p>
                        </div>
                   )}
                </ScrollArea>
                 {notifications.length > 0 && (
                    <>
                        <Separator />
                        <div className="p-2">
                             <Button variant="link" className="w-full" onClick={markAllAsRead}>
                                Marcar todas como leídas
                            </Button>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
}
