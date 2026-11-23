'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/auth-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Navbar({ session }) {
  const pathname = usePathname();
  const rol = session?.rol;

  const isStaff = rol === 'ADMIN' || rol === 'OPERATOR';

  const linkClass = (href) =>
    `text-sm font-medium transition-colors ${
      pathname === href
        ? 'text-amber-400'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight text-amber-400">
            Amanet<span className="text-foreground">Pro</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/" className={linkClass('/')}>
              Vitrină Magazin
            </Link>

            {isStaff && (
              <>
                <Link href="/dashboard" className={linkClass('/dashboard')}>
                  Dashboard
                </Link>
                <Link href="/contracte" className={linkClass('/contracte')}>
                  Contracte
                </Link>
                <Link href="/clienti" className={linkClass('/clienti')}>
                  Clienți
                </Link>
                <Link href="/vanzari" className={linkClass('/vanzari')}>
                  Vânzări
                </Link>
              </>
            )}

            {rol === 'CLIENT' && (
              <Link href="/contul-meu" className={linkClass('/contul-meu')}>
                Contul Meu
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="text-foreground font-medium">{session.nume_complet}</span>
                <Badge
                  variant="outline"
                  className={
                    rol === 'ADMIN'
                      ? 'border-rose-500/40 text-rose-400'
                      : rol === 'OPERATOR'
                      ? 'border-amber-500/40 text-amber-400'
                      : 'border-emerald-500/40 text-emerald-400'
                  }
                >
                  {rol}
                </Badge>
              </div>
              <form action={logoutAction}>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-border hover:bg-muted"
                >
                  Ieșire
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold">
                Autentificare
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}