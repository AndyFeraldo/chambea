// Cuenta de la DEMO: registro e ingreso guardados solo en este navegador.
// En producción, el registro se haría con la cuenta de Empleos Perú (MTPE), con consentimiento
// explícito y según la Ley N.° 29733 de Protección de Datos Personales. Ver docs/07-banco-de-talento.md.
import type { Estado } from './estado';

export interface Cuenta {
  nombre: string;
  celular: string;
  regionId: string;
  /** Aceptó aparecer en el Banco de talento (siempre opcional). */
  visible: boolean;
  /** Aceptó que un Centro de Empleo la contacte. */
  contacto: boolean;
  creada: string;
}

interface CuentaGuardada extends Cuenta {
  pin: string; // huella SHA-256 del PIN, nunca el PIN
  progreso: Estado | null;
}

const CLAVE = 'chambea:cuentas:v1';

function leerTodas(): Record<string, CuentaGuardada> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? '{}') as Record<string, CuentaGuardada>;
  } catch {
    return {};
  }
}

function escribirTodas(c: Record<string, CuentaGuardada>): boolean {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(c));
    return true;
  } catch {
    return false;
  }
}

async function huella(pin: string): Promise<string> {
  try {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`chambea:${pin}`));
    return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return `x${pin.split('').reverse().join('')}`;
  }
}

export const celularValido = (c: string) => /^9\d{8}$/.test(c.replace(/\D/g, ''));
export const pinValido = (p: string) => /^\d{4}$/.test(p);

export type ErrorCuenta = 'existe' | 'noExiste' | 'pin' | 'almacenamiento';

export async function registrar(datos: Cuenta, pin: string, progreso: Estado): Promise<Cuenta | ErrorCuenta> {
  const todas = leerTodas();
  const celular = datos.celular.replace(/\D/g, '');
  if (todas[celular]) return 'existe';
  const cuenta: Cuenta = { ...datos, celular };
  todas[celular] = { ...cuenta, pin: await huella(pin), progreso };
  return escribirTodas(todas) ? cuenta : 'almacenamiento';
}

export async function ingresar(celular: string, pin: string): Promise<{ cuenta: Cuenta; progreso: Estado | null } | ErrorCuenta> {
  const c = leerTodas()[celular.replace(/\D/g, '')];
  if (!c) return 'noExiste';
  if (c.pin !== (await huella(pin))) return 'pin';
  const { pin: _pin, progreso, ...cuenta } = c;
  return { cuenta, progreso };
}

/** Guarda el avance de la persona dentro de su cuenta (y sus preferencias de privacidad). */
export function actualizarCuenta(cuenta: Cuenta, progreso: Estado): void {
  const todas = leerTodas();
  const c = todas[cuenta.celular];
  if (!c) return;
  todas[cuenta.celular] = { ...c, ...cuenta, progreso: { ...progreso, cuenta: null } };
  escribirTodas(todas);
}

export function iniciales(nombre: string): string {
  return (
    nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}
