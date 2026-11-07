import Navbar from '@/components/navbar';
import './globals.css';

export const metadata = {
  title: 'AmanetPRO - Gestiune Casă de Amanet',
  description: 'Sistem integrat de gestiune a contractelor de amanet și vânzare bunuri',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}