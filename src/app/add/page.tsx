'use client';
import { useState } from "react";
import { db, auth } from "@/services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, LogIn, CheckCircle, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useAuthState } from "react-firebase-hooks/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProviderData } from "@/hooks/use-provider-data";
import { suggestDescription } from "@/ai/flows/suggestion-flow";


export default function AddService() {
  const [user, authLoading] = useAuthState(auth);
  const { providerData, loading: providerLoading } = useProviderData();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const router = useRouter();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      setImageUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
           throw new Error('Image upload failed');
        }
        const data = await res.json();
        setImageUrl(data.url);
        toast({
            title: "¡Éxito!",
            description: "Imagen subida correctamente.",
        });
      } catch(uploadError) {
         console.error(uploadError);
         toast({
            variant: "destructive",
            title: "Error de carga",
            description: "No se pudo subir la imagen.",
          });
         setPreview(null);
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleGenerateDescription = async () => {
    if (!title) {
        toast({
            variant: "destructive",
            title: "Falta el título",
            description: "Por favor, escribe un título para generar la descripción.",
        });
        return;
    }
    setGeneratingDesc(true);
    try {
        const result = await suggestDescription({ title });
        setDescription(result);
    } catch(e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Error de IA",
            description: "No se pudo generar la descripción. Revisa la consola para más detalles.",
        });
    } finally {
        setGeneratingDesc(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !description || !category || !price || !city) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios.",
      });
      return;
    }
    if (!user || !providerData) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para agregar un servicio.",
      });
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "services"), {
        title,
        description,
        category,
        price: parseFloat(price),
        city,
        zone,
        imageUrl: imageUrl ?? "",
        userId: user.uid,
        providerName: providerData.displayName,
        providerImage: providerData.photoURL,
        providerVerified: providerData.verified || false,
        createdAt: Timestamp.now(),
      });
      setTitle("");
      setDescription("");
      setCategory("");
      setPrice("");
      setCity("");
      setZone("");
      setImageUrl(null);
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

  if(authLoading || providerLoading) {
    return (
        <main className="container min-h-screen flex flex-col items-center justify-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
                  required
                />
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <Label htmlFor="description">Descripción</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={generatingDesc || !title}>
                        {generatingDesc ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        Sugerir con IA
                    </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe tu servicio en detalle o usa la IA para generar una sugerencia."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading || generatingDesc}
                  required
                  rows={5}
                />
              </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                         <Select onValueChange={setCategory} value={category} required>
                            <SelectTrigger id="category" disabled={loading}>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Hogar">Hogar</SelectItem>
                                <SelectItem value="Tecnologia">Tecnología</SelectItem>
                                <SelectItem value="Transporte">Transporte</SelectItem>
                                <SelectItem value="Belleza">Belleza</SelectItem>
                                <SelectItem value="Educacion">Educación</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Precio (COP)</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="Ej: 50000"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          disabled={loading}
                          required
                          min="0"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          placeholder="Ej: Bogotá"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          disabled={loading}
                          required
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="zone">Barrio/Zona (Opcional)</Label>
                        <Input
                          id="zone"
                          placeholder="Ej: Chapinero"
                          value={zone}
                          onChange={(e) => setZone(e.target.value)}
                          disabled={loading}
                        />
                    </div>
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
                        {imageUploading && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                            </div>
                        )}
                         {imageUrl && !imageUploading && (
                            <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                                <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                        )}
                    </div>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1"
                      disabled={loading || imageUploading}
                    />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading || imageUploading || generatingDesc}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Guardar Servicio
              </Button>
            </CardFooter>
          </form>
        </Card>
    </main>
  );
}
