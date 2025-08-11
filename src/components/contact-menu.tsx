"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Phone, Mail } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ContactForm } from './contact-form';

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
            <PopoverContent className="w-80 mr-4 mb-2 p-2" side="top" align="end">
                <div className="flex flex-col gap-2">
                    <p className="font-bold text-center p-2">¿Necesitas ayuda?</p>
                    <button onClick={handleWhatsAppClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <div className="p-2 bg-muted rounded-full">
                           <Phone className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold">Contactar por WhatsApp</p>
                            <p className="text-sm text-muted-foreground">Respuesta rápida</p>
                        </div>
                    </button>
                    <ContactForm />
                </div>
            </PopoverContent>
        </Popover>
    )
}
