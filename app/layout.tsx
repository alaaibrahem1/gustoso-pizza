import React, { type ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gustoso Pizza Co. | Artisan Stone-Baked Pizza',
  description:
    'Artisanal stone-baked pizza restaurant e-commerce platform with live customization, seamless checkout, and real-time order tracking.',
  openGraph: {
    title: 'Gustoso Pizza Co. | Artisan Stone-Baked Pizza',
    description:
      'Artisanal stone-baked pizza restaurant e-commerce platform with live customization, seamless checkout, and real-time order tracking.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#fdfbf7] text-stone-900 font-sans selection:bg-red-500 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
