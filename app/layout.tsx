import type {Metadata} from 'next';
import {
  Plus_Jakarta_Sans,
  Cormorant_Garamond,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vixa — Digital Agency & AI Architecture',
  description:
    'Custom web development, UI/UX design, and AI integrations for ambitious brands.',
  openGraph: {
    title: 'Vixa — Digital Agency & AI Architecture',
    description:
      'Custom web development, UI/UX design, and AI integrations for ambitious brands.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vixa — Digital Agency & AI Architecture',
    description:
      'Custom web development, UI/UX design, and AI integrations for ambitious brands.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${cormorant.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#06090e] text-white font-sans antialiased selection:bg-[#00d2ff]/30 selection:text-white overflow-x-hidden"
      >
        {children}
      </body>
    </html>
  );
}
