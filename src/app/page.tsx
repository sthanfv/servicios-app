'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/services/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Service));
      setServices(servicesData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="container py-10">
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">
          Servicios Recientes
        </h1>
        <Button asChild>
            <Link href="/add">Agregar Servicio</Link>
        </Button>
      </div>
      
      {services.length === 0 ? (
         <div className="text-center py-20">
            <p className="text-muted-foreground">No hay servicios disponibles en este momento.</p>
            <p className="text-muted-foreground">¡Sé el primero en agregar uno!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
              <Card key={service.id} className="h-full flex flex-col">
                {service.imageUrl && (
                  <div className="relative w-full h-48">
                    <Image
                      src={service.imageUrl}
                      alt={service.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                      data-ai-hint="product image"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
                <CardFooter>
                  <Badge variant="secondary">{service.category}</Badge>
                </CardFooter>
              </Card>
          ))}
        </div>
      )}
    </div>
  );
}
