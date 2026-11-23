import { Suspense } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navbar';
import { getSession } from '@/lib/auth';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'AmanetPro — Gestiune Casă de Amanet & Magazin',
  description: 'Sistem informatic pentru administrarea contractelor de amanet și vânzări',
};

async function NavbarWithSession() {
  const session = await getSession();
  return <Navbar session={session} />;
}

export default function RootLayout({ children }) {
  return (
    <html lang="ro" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <Suspense fallback={<div className="h-14 border-b border-border bg-card/80" />}>
          <NavbarWithSession />
        </Suspense>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}