'use client';
import { useState } from "react";
import { db } from "@/services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";


export default function AddService() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !description || !category) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, completa todos los campos.",
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "services"), {
        title,
        description,
        category,
        createdAt: Timestamp.now(),
      });
      setTitle("");
      setDescription("");
      setCategory("");
      toast({
        title: "¡Éxito!",
        description: "Servicio agregado correctamente.",
      });
      router.push('/');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar el servicio.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container min-h-screen flex flex-col items-center justify-center py-10">
       <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft />
                    </Link>
                </Button>
                <div>
                    <CardTitle className="text-2xl font-bold">Agregar Servicio</CardTitle>
                    <CardDescription>Publica un nuevo servicio para que otros lo vean.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ej: Fontanería de emergencia"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu servicio en detalle"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  placeholder="Ej: Hogar"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Servicio"}
              </Button>
            </CardFooter>
          </form>
        </Card>
    </main>
  );
}
