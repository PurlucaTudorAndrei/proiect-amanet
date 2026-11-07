import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-amber-500">
              AMANET<span className="text-foreground">PRO</span>
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Vitrină Magazin
            </Link>
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Panou Ghișeu
            </Link>
            <Link
              href="/contracte"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contracte Active
            </Link>
            <Link
              href="/vanzari"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Istoric Vânzări
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Sistem Activ
          </span>
        </div>
      </div>
    </header>
  );
}