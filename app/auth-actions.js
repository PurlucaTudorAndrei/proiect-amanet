'use server';

import pool from '@/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { encryptSession } from '@/lib/auth';

export async function loginAction(formData) {
  const email = formData.get('email')?.trim().toLowerCase();
  const parola = formData.get('parola');

  if (!email || !parola) {
    return { error: 'Te rugăm să completezi email-ul și parola.' };
  }

  const res = await pool.query(
    'SELECT id_utilizator, nume_complet, email, parola_hash, rol FROM utilizatori WHERE LOWER(email) = $1',
    [email]
  );

  if (res.rows.length === 0) {
    return { error: 'Email sau parolă incorectă.' };
  }

  const user = res.rows[0];
  const parolaValida = await bcrypt.compare(parola, user.parola_hash);

  if (!parolaValida) {
    return { error: 'Email sau parolă incorectă.' };
  }

  // Creare token sesiune
  const token = await encryptSession({
    id_utilizator: user.id_utilizator,
    nume_complet: user.nume_complet,
    email: user.email,
    rol: user.rol,
  });

  const cookieStore = await cookies();
  cookieStore.set('amanet_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 ore
  });

  // Redirecționare în funcție de rol
  if (user.rol === 'CLIENT') {
    redirect('/contul-meu');
  } else {
    redirect('/dashboard');
  }
}

export async function registerClientAction(formData) {
  const nume_complet = formData.get('nume_complet')?.trim();
  const email = formData.get('email')?.trim().toLowerCase();
  const telefon = formData.get('telefon')?.trim();
  const cnp = formData.get('cnp')?.trim();
  const seria_nr_ci = formData.get('seria_nr_ci')?.trim();
  const parola = formData.get('parola');

  if (!nume_complet || !email || !cnp || !parola) {
    return { error: 'Toate câmpurile obligatorii trebuie completate.' };
  }

  try {
    const parolaHash = await bcrypt.hash(parola, 10);

    const res = await pool.query(
      `INSERT INTO utilizatori (nume_complet, email, parola_hash, telefon, cnp, seria_nr_ci, rol)
       VALUES ($1, $2, $3, $4, $5, $6, 'CLIENT')
       RETURNING id_utilizator, nume_complet, email, rol`,
      [nume_complet, email, parolaHash, telefon, cnp, seria_nr_ci || 'GL000000']
    );

    const user = res.rows[0];
    const token = await encryptSession({
      id_utilizator: user.id_utilizator,
      nume_complet: user.nume_complet,
      email: user.email,
      rol: user.rol,
    });

    const cookieStore = await cookies();
    cookieStore.set('amanet_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  } catch (error) {
    if (error.code === '23505') {
      return { error: 'Există deja un cont cu acest Email sau CNP.' };
    }
    return { error: 'Eroare la crearea contului: ' + error.message };
  }

  redirect('/contul-meu');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('amanet_session');
  redirect('/login');
}