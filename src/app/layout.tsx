import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Weapon Comparator',
  description: 'Upload weapon screenshots and compare their stats.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&family=Source+Code+Pro:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css"
          integrity="sha512-vVNK9IqupEW8BgsP/dPuUfdfnC9VfEZq3lgshjSWTmH0Cve29iK/cD9nASCLqLzCQODP1/cIWE2j/B4Zf2/Zrg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js"
          integrity="sha512-JyCZjCOZqC4lMv7Jr3o+jc4KKT0LpGv+A3M/tT/V1jV70tJv04/aH2eP3dY5AnEPaN8BG+rQEZG+5J9yU/A1Ew=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          strategy="afterInteractive"
        ></Script>
      </head>
      <body className={cn('font-body antialiased')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
