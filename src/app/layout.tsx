import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});


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
    <html lang="es" suppressHydrationWarning className={inter.className}>
      <body className="antialiased">
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
