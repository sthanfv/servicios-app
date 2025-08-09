'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/services/firebase';
import { collection, query, where, onSnapshot, addDoc, Timestamp, orderBy, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, Loader2, LogIn, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id?: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
}

interface Conversation {
    id: string;
    otherUserName: string;
    otherUserAvatar: string;
    lastMessage: string;
}

// Helper to create a consistent chat ID
const getChatId = (uid1: string, uid2: string) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}


export default function ChatPage() {
  const [user, authLoading] = useAuthState(auth);
  const searchParams = useSearchParams();
  const contactId = searchParams.get('contact');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Effect to manage conversations list
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const convos: Conversation[] = [];
        for (const chatDoc of snapshot.docs) {
            const data = chatDoc.data();
            const otherUserId = data.participants.find((p: string) => p !== user.uid);
            
            if(otherUserId) {
                // We need to get the other user's info (name, avatar)
                // For simplicity, we assume we have a 'users' collection with this info
                // This part is a mock for now, but should be a fetch from a 'users' collection
                convos.push({
                    id: chatDoc.id,
                    otherUserName: data.participantNames?.[otherUserId] ?? 'Usuario',
                    otherUserAvatar: 'https://placehold.co/40x40.png',
                    lastMessage: data.lastMessage?.text ?? 'No hay mensajes aún',
                });
            }
        }
        setConversations(convos);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

   // Effect to auto-select conversation from URL param
  useEffect(() => {
    const setupInitialChat = async () => {
        if (contactId && user && user.uid !== contactId) {
            setChatLoading(true);
            const chatId = getChatId(user.uid, contactId);
            const chatRef = doc(db, 'chats', chatId);
            const chatSnap = await getDoc(chatRef);
            
            let convo: Conversation;

            if (chatSnap.exists()) {
                 const data = chatSnap.data();
                 convo = {
                    id: chatId,
                    otherUserName: data.participantNames?.[contactId] ?? 'Usuario',
                    otherUserAvatar: 'https://placehold.co/40x40.png',
                    lastMessage: data.lastMessage?.text ?? 'Inicia la conversación',
                };
            } else {
                // Create a new chat placeholder if it doesn't exist
                // Ideally, fetch user names from a 'users' collection
                const newChatData = {
                    participants: [user.uid, contactId],
                    participantNames: {
                        [user.uid]: user.displayName ?? 'Yo',
                        [contactId]: 'Nuevo Contacto' // This should be fetched
                    },
                    createdAt: Timestamp.now(),
                    lastMessage: null,
                };
                await setDoc(chatRef, newChatData);
                 convo = {
                    id: chatId,
                    otherUserName: 'Nuevo Contacto',
                    otherUserAvatar: 'https://placehold.co/40x40.png',
                    lastMessage: 'Inicia la conversación',
                };
            }
            setSelectedConversation(convo);
            setChatLoading(false);
        }
    }
    if (contactId && user) {
        setupInitialChat();
    }
  }, [contactId, user]);


  // Effect for fetching messages of selected conversation
  useEffect(() => {
    if (!selectedConversation) {
        setMessages([]);
        return;
    };
    setChatLoading(true);

    const q = query(
        collection(db, 'chats', selectedConversation.id, 'messages'),
        orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Message));
        setMessages(msgs);
        setChatLoading(false);
        // Scroll to bottom
        setTimeout(() => {
             if (scrollAreaRef.current) {
                const viewport = scrollAreaRef.current.querySelector('div');
                if (viewport) viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    });

    return () => unsubscribe();
  }, [selectedConversation]);


  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || !user || !selectedConversation) return;

    const newMessage: Omit<Message, 'id'> = {
        text: message,
        senderId: user.uid,
        createdAt: Timestamp.now(),
    };
    
    const chatRef = doc(db, 'chats', selectedConversation.id);
    const messagesRef = collection(chatRef, 'messages');

    await addDoc(messagesRef, newMessage);
    
    // Update last message on chat document
    await setDoc(chatRef, { lastMessage: { text: message, createdAt: newMessage.createdAt } }, { merge: true });

    setMessage('');
  };

  if(authLoading || loading){
      return (
        <main className="container min-h-screen flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      )
  }

  if (!user && !authLoading) {
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
                            className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-muted ${selectedConversation?.id === convo.id && 'bg-muted'}`}
                            onClick={() => setSelectedConversation(convo)}
                        >
                            <Avatar>
                                <AvatarImage src={convo.otherUserAvatar} />
                                <AvatarFallback>{convo.otherUserName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold">{convo.otherUserName}</p>
                                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <div className='text-center p-8 text-muted-foreground'>
                            No tienes conversaciones activas.
                        </div>
                    )}
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
                                <AvatarImage src={selectedConversation.otherUserAvatar}/>
                                <AvatarFallback>{selectedConversation.otherUserName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg font-semibold">{selectedConversation.otherUserName}</h3>
                        </header>
                        <ScrollArea className="flex-1 p-4 bg-muted/20" ref={scrollAreaRef}>
                            {chatLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.senderId === user.uid ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                                                <p>{msg.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                        <footer className="p-4 border-t bg-background">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <Input 
                                    placeholder="Escribe un mensaje..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    autoComplete="off"
                                    disabled={chatLoading}
                                />
                                <Button type="submit" size="icon" disabled={!message.trim() || chatLoading}>
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
