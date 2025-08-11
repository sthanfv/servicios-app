"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Loader2, Send } from "lucide-react"
import { supportChat } from "@/ai/flows/support-chat-flow"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "./ui/scroll-area"

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

export function SupportChatbot() {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [question, setQuestion] = React.useState('');
    const [messages, setMessages] = React.useState<Message[]>([]);
    const { toast } = useToast();
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
         setTimeout(() => {
             if (scrollAreaRef.current) {
                const viewport = scrollAreaRef.current.querySelector('div');
                if (viewport) viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        const userMessage: Message = { sender: 'user', text: question };
        setMessages(prev => [...prev, userMessage]);
        setQuestion('');
        setLoading(true);
        scrollToBottom();

        try {
            const aiResponse = await supportChat({ question });
            const aiMessage: Message = { sender: 'ai', text: aiResponse };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo contactar al asistente.'});
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors w-full text-left">
           <div className="p-2 bg-muted rounded-full">
                <Bot className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
                <p className="font-semibold">Pregúntale a Yani</p>
                <p className="text-sm text-muted-foreground">Asistente Virtual</p>
            </div>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Bot /> Asistente Virtual Yani
          </AlertDialogTitle>
          <AlertDialogDescription>
            Haz una pregunta sobre ServiYa. Estoy aquí para ayudarte.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <ScrollArea className="h-64 p-4 border rounded-lg" ref={scrollAreaRef}>
            <div className="space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                        <p>{msg.text}</p>
                    </div>
                </div>
            ))}
             {loading && (
                 <div className="flex justify-start">
                    <div className="p-3 rounded-lg bg-card border">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
            )}
            </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input 
                placeholder="Escribe tu pregunta..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
                autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={loading || !question.trim()}>
                <Send />
            </Button>
        </form>
        
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
