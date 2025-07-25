import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Script from 'next/script';

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
          integrity="sha512-UtLoMN+MDFtdaJDMBIAnJ+C9amB1a1CTly4S/PqW4S2dLzooTZS1K48/i1vDkD1VqQBErW5wT42S4L/h7Jp/Q=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        {children}
        <Toaster />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js"
          integrity="sha512-JyCZjCOZPLjPA7/i+LItbC5C2p1lJAUl8n5S0/M3hNuaLD7+xSkz9J42B4l25D2_xM3K0W36N/lFj_vtnE/sA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        ></Script>
      </body>
    </html>
  );
}
