'use client';
import { useState } from "react";
import { db, auth } from "@/services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


const addServiceSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  category: z.string({ required_error: "Por favor, selecciona una categoría." }),
  price: z.coerce.number().positive({ message: "El precio debe ser un número positivo." }),
  city: z.string().min(3, { message: "La ciudad debe tener al menos 3 caracteres." }),
  zone: z.string().optional(),
});

type AddServiceFormValues = z.infer<typeof addServiceSchema>;

export default function AddService() {
  const [user, authLoading] = useAuthState(auth);
  const { providerData, loading: providerLoading } = useProviderData();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const router = useRouter();

  const form = useForm<AddServiceFormValues>({
    resolver: zodResolver(addServiceSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      city: "",
      zone: "",
    },
  });
  
  const isLoading = form.formState.isSubmitting || imageUploading || generatingDesc;


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
            variant: "success",
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
    const title = form.getValues("title");
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
        form.setValue("description", result);
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

  const onSubmit = async (data: AddServiceFormValues) => {
    if (!user || !providerData) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para agregar un servicio.",
      });
      return;
    }

    try {
      await addDoc(collection(db, "services"), {
        ...data,
        imageUrl: imageUrl ?? "",
        userId: user.uid,
        providerName: providerData.displayName,
        providerImage: providerData.photoURL,
        providerVerified: providerData.verified || false,
        createdAt: Timestamp.now(),
        // Denormalized fields for reviews
        reviewCount: 0,
        averageRating: 0,
      });
      form.reset();
      setImageUrl(null);
      setPreview(null);
      toast({
        variant: "success",
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                 <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Fontanería de emergencia" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                       <div className="flex justify-between items-center">
                          <FormLabel>Descripción</FormLabel>
                          <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={generatingDesc || !form.getValues("title")}>
                              {generatingDesc ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                              Sugerir con IA
                          </Button>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Describe tu servicio en detalle o usa la IA para generar una sugerencia."
                          rows={5}
                          {...field}
                          disabled={isLoading || generatingDesc}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                           <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                              </SelectTrigger>
                           </FormControl>
                            <SelectContent>
                                <SelectItem value="Hogar">Hogar</SelectItem>
                                <SelectItem value="Tecnologia">Tecnología</SelectItem>
                                <SelectItem value="Transporte">Transporte</SelectItem>
                                <SelectItem value="Belleza">Belleza</SelectItem>
                                <SelectItem value="Educacion">Educación</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                       <FormItem>
                          <FormLabel>Precio (COP)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Ej: 50000" {...field} disabled={isLoading} min="0"/>
                          </FormControl>
                          <FormMessage />
                       </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Bogotá" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="zone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barrio/Zona (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Chapinero" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <div className="space-y-2">
                  <FormLabel>Imagen del Servicio</FormLabel>
                  <div className="flex items-center gap-4">
                      <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground relative">
                          {preview ? (
                              <Image src={preview} alt="Preview" fill objectFit="cover" className="rounded-lg"/>
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
                        disabled={isLoading}
                      />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  Guardar Servicio
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
    </main>
  );
}
