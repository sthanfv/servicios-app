'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '@/services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Upload, Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServiceData {
  title: string;
  description: string;
  category: string;
  price: number;
  city: string;
  zone?: string;
  imageUrl: string;
  userId: string;
}

export default function EditService() {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const [service, setService] = useState<ServiceData | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [zone, setZone] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!serviceId) return;
    const fetchService = async () => {
      setPageLoading(true);
      const docRef = doc(db, 'services', serviceId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const serviceData = docSnap.data() as ServiceData;
        if (user && serviceData.userId === user.uid) {
            setService(serviceData);
            setTitle(serviceData.title);
            setDescription(serviceData.description);
            setCategory(serviceData.category);
            setPrice(serviceData.price?.toString() ?? '');
            setCity(serviceData.city ?? '');
            setZone(serviceData.zone ?? '');
            setPreview(serviceData.imageUrl);
        } else {
            toast({ variant: 'destructive', title: 'Acceso Denegado', description: 'No tienes permiso para editar este servicio.' });
            router.push('/my-services');
        }
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Servicio no encontrado.' });
        router.push('/my-services');
      }
      setPageLoading(false);
    };

    if(user || !authLoading){
        fetchService();
    }
  }, [serviceId, user, authLoading, router, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !description || !category || !price || !city) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, completa todos los campos obligatorios.' });
      return;
    }

    setLoading(true);
    let newImageUrl = service?.imageUrl || '';

    if (image) {
      if (service?.imageUrl) {
          try {
              await fetch('/api/upload', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: service.imageUrl }),
              });
          } catch (deleteError) {
              console.warn("Could not delete old image, proceeding with upload.", deleteError);
          }
      }

      const formData = new FormData();
      formData.append('file', image);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Image upload failed');
        const data = await res.json();
        newImageUrl = data.url;
      } catch (uploadError) {
        console.error(uploadError);
        toast({ variant: 'destructive', title: 'Error de carga', description: 'No se pudo subir la nueva imagen.' });
        setLoading(false);
        return;
      }
    }

    try {
      const docRef = doc(db, 'services', serviceId);
      await updateDoc(docRef, {
        title,
        description,
        category,
        price: parseFloat(price),
        city,
        zone,
        imageUrl: newImageUrl,
      });
      toast({ title: '¡Éxito!', description: 'Servicio actualizado correctamente.' });
      router.push('/my-services');
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el servicio.' });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading || authLoading) {
    return (
      <main className="container min-h-screen flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }

  if (!user && !authLoading) {
     return (
      <main className="container min-h-screen flex flex-col items-center justify-center text-center py-10">
        <Card className="w-full max-w-md p-8">
            <CardTitle className="text-2xl font-bold mb-4">Acceso Denegado</CardTitle>
            <CardDescription className="mb-6">
            Debes iniciar sesión para editar servicios.
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

  if (!service) {
      return null;
  }

  return (
    <main className="container min-h-screen flex flex-col items-center justify-center py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
           <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/my-services">
                        <ArrowLeft />
                    </Link>
                </Button>
                <div>
                    <CardTitle className="text-2xl font-bold">Editar Servicio</CardTitle>
                    <CardDescription>Actualiza la información de tu servicio.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} required />
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
                    <Image src={preview} alt="Preview" layout="fill" objectFit="cover" className="rounded-lg" />
                  ) : (
                    <Upload />
                  )}
                </div>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="flex-1" disabled={loading} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...</> : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
