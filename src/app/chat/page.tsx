'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/services/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

// Mock data for conversations and messages
const conversations = [
  { id: '1', name: 'Juan Perez', avatar: 'https://placehold.co/40x40.png', lastMessage: 'Hola, ¿sigue disponible?' },
  { id: '2', name: 'Maria Garcia', avatar: 'https://placehold.co/40x40.png', lastMessage: 'Perfecto, gracias.' },
];

const messagesMock = {
  '1': [
    { id: 'm1', text: 'Hola, ¿sigue disponible el servicio de fontanería?', sender: 'other' },
    { id: 'm2', text: '¡Hola! Sí, claro. ¿Qué necesitarías?', sender: 'me' },
  ],
  '2': [
     { id: 'm3', text: 'Quería agradecerte por el excelente trabajo de jardinería.', sender: 'other' },
     { id: 'm4', text: '¡De nada! Un placer ayudarte. Avísame si necesitas algo más.', sender: 'me' },
  ],
};


export default function ChatPage() {
  const [user, loading] = useAuthState(auth);
  const searchParams = useSearchParams();
  const contactId = searchParams.get('contact');

  const [selectedConversation, setSelectedConversation] = useState<string | null>(contactId ? (conversations.find(c => c.id === '1')?.id ?? null) : null);
  const [message, setMessage] = useState('');

  if(loading){
      return (
        <main className="container min-h-screen flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      )
  }

  if (!user && !loading) {
    return (
      <main className="container min-h-screen flex flex-col items-center justify-center text-center py-10">
        <Card className="w-full max-w-md p-8">
            <CardTitle className="text-2xl font-bold mb-4">Acceso Denegado</CardTitle>
            <CardDescription className="mb-6">
            Debes iniciar sesión para ver tus chats.
            </CardDescription>
            <Button asChild>
                <Link href="/login">
                <LogIn className="mr-2"/>
                Iniciar Sesión
                </Link>
            </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="container h-[calc(100vh-5rem)] py-10">
        <div className="h-full border rounded-lg flex">
            {/* Sidebar with conversations */}
            <aside className={`w-full md:w-1/3 border-r ${selectedConversation && 'hidden md:flex'} flex-col`}>
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Chats</h2>
                </div>
                <ScrollArea className="flex-1">
                    {conversations.map((convo) => (
                        <div
                            key={convo.id}
                            className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-muted ${selectedConversation === convo.id && 'bg-muted'}`}
                            onClick={() => setSelectedConversation(convo.id)}
                        >
                            <Avatar>
                                <AvatarImage src={convo.avatar} />
                                <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold">{convo.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </aside>

            {/* Main chat window */}
            <section className={`flex-1 flex-col ${!selectedConversation && 'hidden md:flex'} flex`}>
                {selectedConversation ? (
                    <>
                        <header className="p-4 border-b flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                                <ArrowLeft />
                            </Button>
                            <Avatar>
                                <AvatarImage src={conversations.find(c => c.id === selectedConversation)?.avatar}/>
                                <AvatarFallback>{conversations.find(c => c.id === selectedConversation)?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg font-semibold">{conversations.find(c => c.id === selectedConversation)?.name}</h3>
                        </header>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {(messagesMock[selectedConversation as keyof typeof messagesMock] || []).map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <footer className="p-4 border-t">
                            <form className="flex items-center gap-2">
                                <Input 
                                    placeholder="Escribe un mensaje..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    autoComplete="off"
                                />
                                <Button type="submit" size="icon">
                                    <Send />
                                </Button>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-lg font-medium">Selecciona una conversación</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Elige un chat de la lista para ver los mensajes.
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    </main>
  );
}
