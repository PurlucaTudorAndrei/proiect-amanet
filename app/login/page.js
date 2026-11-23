'use client';

import { useState } from 'react';
import { loginAction, registerClientAction } from '@/app/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const res =
      mode === 'login'
        ? await loginAction(formData)
        : await registerClientAction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8">
      <Card className="w-full max-w-md border-border bg-card shadow-xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-amber-400">
            {mode === 'login' ? 'Autentificare AmanetPro' : 'Creare Cont Client'}
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Introdu datele contului pentru a accesa platforma'
              : 'Înregistrează-te pentru a-ți urmări contractele și achizițiile'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Nume Complet *</label>
                  <Input name="nume_complet" placeholder="Ex: Popescu Andrei" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">CNP *</label>
                    <Input name="cnp" maxLength={13} placeholder="1950101..." required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Serie / Nr. CI</label>
                    <Input name="seria_nr_ci" placeholder="GL 123456" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Telefon</label>
                  <Input name="telefon" placeholder="0740..." />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Email *</label>
              <Input type="email" name="email" placeholder="exemplu@amanet.ro" required />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Parolă *</label>
              <Input type="password" name="parola" placeholder="••••••" required />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold mt-2"
            >
              {loading
                ? 'Se procesează...'
                : mode === 'login'
                ? 'Intră în cont'
                : 'Creează cont client'}
            </Button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-xs text-amber-400 hover:underline"
            >
              {mode === 'login'
                ? 'Nu ai cont de client? Înregistrează-te aici'
                : 'Ai deja un cont? Autentifică-te'}
            </button>
          </div>

          {mode === 'login' && (
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground">Conturi de test (Parolă: 123456):</p>
              <div className="flex justify-between">
                <span>ADMIN:</span>
                <code className="text-amber-400">admin@amanet.ro</code>
              </div>
              <div className="flex justify-between">
                <span>OPERATOR:</span>
                <code className="text-amber-400">operator1@amanet.ro</code>
              </div>
              <div className="flex justify-between">
                <span>CLIENT:</span>
                <code className="text-amber-400">vasile.p@yahoo.com</code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}