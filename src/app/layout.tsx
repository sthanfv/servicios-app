import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: {
    template: '%s | ServiciosApp Lite',
    default: 'ServiciosApp Lite - Tu plataforma para encontrar y ofrecer servicios locales',
  },
  description: 'Tu plataforma minimalista para encontrar y ofrecer servicios locales.',
  openGraph: {
    title: 'ServiciosApp Lite',
    description: 'Tu plataforma minimalista para encontrar y ofrecer servicios locales.',
    images: ['/og-image.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServiciosApp Lite',
    description: 'Tu plataforma minimalista para encontrar y ofrecer servicios locales.',
    images: ['/og-image.png']
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
