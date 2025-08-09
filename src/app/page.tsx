'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container min-h-screen flex flex-col justify-center items-center text-center">
      <h1
        className="text-5xl md:text-6xl font-bold text-primary drop-shadow-lg"
      >
        Bienvenido a ServiciosApp
      </h1>
      <p
        className="mt-4 max-w-2xl text-lg text-muted-foreground"
      >
        Tu plataforma minimalista para encontrar y ofrecer servicios locales. Conectando a la comunidad, un servicio a la vez.
      </p>
      <div
        className="mt-8 flex gap-4"
      >
        <Button asChild size="lg">
          <Link href="/login">Empezar ahora</Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Link href="/#features">Descubrir servicios</Link>
        </Button>
      </div>
    </div>
  );
}
