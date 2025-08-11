import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import { ContactMenu } from '@/components/contact-menu';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});


export const metadata: Metadata = {
  title: {
    template: '%s | ServiYa',
    default: 'ServiYa - Encuentra lo que necesitas, ahora.',
  },
  description: 'Encuentra lo que necesitas, ahora.',
  openGraph: {
    title: 'ServiYa',
    description: 'Encuentra lo que necesitas, ahora.',
    images: ['/og-image.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServiYa',
    description: 'Encuentra lo que necesitas, ahora.',
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
          <ContactMenu />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
