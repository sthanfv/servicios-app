"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Phone } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SupportChatbot } from './support-chatbot';
import { Separator } from './ui/separator';

export function ContactMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const handleWhatsAppClick = () => {
        // Replace with your actual WhatsApp number
        window.open('https://wa.me/1234567890?text=Hola,%20necesito%20ayuda.', '_blank');
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="default" size="icon" className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50">
                   {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 mr-4 mb-2 p-0" side="top" align="end">
                <div className="p-3">
                    <p className="font-bold text-center">¿Necesitas ayuda?</p>
                </div>
                <Separator />
                <div className="p-2 flex flex-col gap-1">
                    <SupportChatbot />
                    <button onClick={handleWhatsAppClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors w-full text-left">
                        <div className="p-2 bg-muted rounded-full">
                           <Phone className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold">Contactar por WhatsApp</p>
                            <p className="text-sm text-muted-foreground">Respuesta rápida</p>
                        </div>
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
