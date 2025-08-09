'use client';
import { useState } from "react";
import { db, auth } from "@/services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, LogIn } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useAuthState } from "react-firebase-hooks/auth";


export default function AddService() {
  const [user, authLoading] = useAuthState(auth);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

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
    if (!user) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para agregar un servicio.",
      });
      return;
    }

    setLoading(true);
    
    let imageUrl = "";
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
           throw new Error('Image upload failed');
        }
        const data = await res.json();
        imageUrl = data.url;
      } catch(uploadError) {
         console.error(uploadError);
         toast({
            variant: "destructive",
            title: "Error de carga",
            description: "No se pudo subir la imagen.",
          });
         setLoading(false);
         return;
      }
    }


    try {
      await addDoc(collection(db, "services"), {
        title,
        description,
        category,
        imageUrl,
        userId: user.uid,
        createdAt: Timestamp.now(),
      });
      setTitle("");
      setDescription("");
      setCategory("");
      setImage(null);
      setPreview(null);
      toast({
        title: "¡Éxito!",
        description: "Servicio agregado correctamente.",
      });
      router.push('/my-services');
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

  if(authLoading) {
    return (
        <main className="container min-h-screen flex flex-col items-center justify-center py-10">
            <p>Cargando...</p>
        </main>
    )
  }

  if (!user && !authLoading) {
    return (
      <main className="container min-h-screen flex flex-col items-center justify-center text-center py-10">
        <Card className="w-full max-w-md p-8">
            <CardTitle className="text-2xl font-bold mb-4">Acceso Denegado</CardTitle>
            <CardDescription className="mb-6">
            Debes iniciar sesión para poder publicar un nuevo servicio.
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
    <main className="container min-h-screen flex flex-col items-center justify-center py-10">
       <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
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
              <div className="space-y-2">
                <Label htmlFor="image">Imagen del Servicio</Label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground relative">
                        {preview ? (
                            <Image src={preview} alt="Preview" layout="fill" objectFit="cover" className="rounded-lg"/>
                        ) : (
                            <Upload />
                        )}
                    </div>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1"
                      disabled={loading}
                    />
                </div>
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
