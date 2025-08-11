# ServiciosApp Lite

ServiciosApp Lite es una plataforma minimalista construida con Next.js y Firebase, diseñada para conectar a proveedores de servicios con clientes locales. Los usuarios pueden publicar, buscar y contactar a profesionales de diversas áreas de manera rápida y segura.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (con App Router)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **Backend y Base de Datos:** [Firebase](https://firebase.google.com/) (Authentication, Firestore)
*   **UI:** [Tailwind CSS](https://tailwindcss.com/) y [ShadCN UI](https://ui.shadcn.com/)
*   **Despliegue:** Vercel (para el frontend) y Firebase Hosting.
*   **Inteligencia Artificial:** [Genkit](https://firebase.google.com/docs/genkit)

## Primeros Pasos

Para levantar el proyecto en tu entorno local, sigue estos pasos.

### Prerrequisitos

*   Node.js (v18 o superior)
*   npm o yarn

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/servicios-app-lite.git
    cd servicios-app-lite
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura las variables de entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Firebase. Puedes usar `.env.local.example` como plantilla.
    ```env
    # Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

    # Vercel Blob (para subida de imágenes)
    BLOB_READ_WRITE_TOKEN=vercel_blob_...
    ```

### Ejecutar el Servidor de Desarrollo

Una vez completada la instalación, puedes iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Scripts Disponibles

*   `npm run dev`: Inicia el servidor de desarrollo.
*   `npm run build`: Compila la aplicación para producción.
*   `npm run start`: Inicia un servidor de producción.
*   `npm run lint`: Ejecuta el linter (ESLint) para analizar el código.
*   `npm run typecheck`: Ejecuta el compilador de TypeScript para comprobar tipos sin generar archivos.
