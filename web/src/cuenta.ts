// Cuenta de la DEMO: registro e ingreso guardados solo en este navegador.
// En producción, el registro se haría con la cuenta de Empleos Perú (MTPE), con consentimiento
// explícito y según la Ley N.° 29733 de Protección de Datos Personales. Ver docs/07-banco-de-talento.md.
import type { Estado } from './estado';

export type TipoDocumento = 'dni' | 'ce' | 'ptp';
export type Educacion = 'primaria' | 'secundaria_incompleta' | 'secundaria' | 'tecnica' | 'superior_incompleta' | 'superior';
export type Experiencia = 'menos1' | '1a2' | '3a5' | '6a10' | 'mas10';
export type Jornada = 'completo' | 'medio' | 'horas' | 'fines';
export type Horario = 'manana' | 'tarde' | 'noche';
export type Inicio = 'ya' | 'dos_semanas' | 'mes';
export type ContactoPor = 'llamada' | 'whatsapp' | 'centro';

export const TIPOS_DOCUMENTO: TipoDocumento[] = ['dni', 'ce', 'ptp'];
export const EDUCACION: Educacion[] = ['primaria', 'secundaria_incompleta', 'secundaria', 'tecnica', 'superior_incompleta', 'superior'];
export const EXPERIENCIA: Experiencia[] = ['menos1', '1a2', '3a5', '6a10', 'mas10'];
export const JORNADAS: Jornada[] = ['completo', 'medio', 'horas', 'fines'];
export const HORARIOS: Horario[] = ['manana', 'tarde', 'noche'];
export const INICIOS: Inicio[] = ['ya', 'dos_semanas', 'mes'];
export const CONTACTOS: ContactoPor[] = ['llamada', 'whatsapp', 'centro'];
/** Documentos que suelen pedir en trabajos operativos. `clave` se busca en requisitos_minimos. */
export const DOCUMENTOS: { id: string; clave?: string }[] = [
  { id: 'identidad' },
  { id: 'antecedentes' },
  { id: 'sanidad', clave: 'sanidad' },
  { id: 'brevete', clave: 'brevete' },
  { id: 'secundaria', clave: 'secundaria' },
  { id: 'curso' },
];

/** Lo que la persona completa para aparecer en el Banco de talento. */
export interface PerfilLaboral {
  experiencia: Experiencia;
  jornada: Jornada;
  horarios: Horario[];
  inicio: Inicio;
  zonas: string;
  contactoPor: ContactoPor;
  documentos: string[];
  /** Frase corta que ven las empresas (opcional). */
  presentacion: string;
  /** Alguien que puede hablar de su trabajo. Solo la ve el asesor, nunca se publica. */
  referencia: string;
  publicado: string;
}

export interface Cuenta {
  nombres: string;
  apellidos: string;
  /** En la demo solo se guardan los últimos 3 dígitos del documento. */
  documento: { tipo: TipoDocumento; final: string } | null;
  nacimiento: string;
  educacion: Educacion | null;
  celular: string;
  correo: string;
  regionId: string;
  distrito: string;
  /** Opcional: para ver ofertas de empleo inclusivo. */
  discapacidad: boolean;
  /** Está publicada en el Banco de talento (siempre opcional y reversible). */
  visible: boolean;
  /** Aceptó que un Centro de Empleo la contacte. */
  contacto: boolean;
  creada: string;
  laboral: PerfilLaboral | null;
}

interface CuentaGuardada extends Cuenta {
  pin: string; // huella SHA-256 del PIN, nunca el PIN
  progreso: Estado | null;
}

const CLAVE = 'chambea:cuentas:v1';

/** Cuentas creadas con la versión anterior (solo `nombre`) siguen funcionando. */
export function normalizarCuenta<T extends Partial<Cuenta> & { nombre?: string }>(c: T): T & Cuenta {
  const { nombre, ...resto } = c;
  return {
    apellidos: '',
    documento: null,
    nacimiento: '',
    educacion: null,
    correo: '',
    distrito: '',
    discapacidad: false,
    visible: false,
    contacto: false,
    creada: '',
    laboral: null,
    celular: '',
    regionId: '',
    ...resto,
    nombres: resto.nombres ?? nombre ?? '',
  } as T & Cuenta;
}

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
export const correoValido = (c: string) => !c.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.trim());
export function documentoValido(tipo: TipoDocumento, numero: string): boolean {
  const n = numero.trim();
  return tipo === 'dni' ? /^\d{8}$/.test(n) : /^[A-Za-z0-9]{6,12}$/.test(n);
}
export function edad(nacimiento: string, hoy = new Date()): number | null {
  const d = new Date(`${nacimiento}T00:00:00`);
  if (!nacimiento || Number.isNaN(d.getTime())) return null;
  let anios = hoy.getFullYear() - d.getFullYear();
  if (hoy.getMonth() < d.getMonth() || (hoy.getMonth() === d.getMonth() && hoy.getDate() < d.getDate())) anios--;
  return anios;
}

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
  return { cuenta: normalizarCuenta(cuenta), progreso };
}

/** Guarda el avance de la persona dentro de su cuenta (y sus preferencias de privacidad). */
export function actualizarCuenta(cuenta: Cuenta, progreso: Estado): void {
  const todas = leerTodas();
  const c = todas[cuenta.celular];
  if (!c) return;
  todas[cuenta.celular] = { ...c, ...cuenta, progreso: { ...progreso, cuenta: null } };
  escribirTodas(todas);
}

const palabras = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const mayuscula = (s: string) => (s ? s[0].toLocaleUpperCase('es') + s.slice(1).toLocaleLowerCase('es') : s);

/** Como en Yape: primer nombre y la inicial del apellido → "Rosa Q." */
export function nombreVisible(nombres: string, apellidos = ''): string {
  const nombre = mayuscula(palabras(nombres)[0] ?? '');
  const inicial = palabras(apellidos)[0]?.[0]?.toLocaleUpperCase('es');
  return [nombre, inicial && `${inicial}.`].filter(Boolean).join(' ') || '?';
}

export const nombreCompleto = (c: Pick<Cuenta, 'nombres' | 'apellidos'>) =>
  [...palabras(c.nombres), ...palabras(c.apellidos)].map(mayuscula).join(' ');

export function iniciales(c: Pick<Cuenta, 'nombres' | 'apellidos'>): string {
  const n = palabras(c.nombres);
  const a = palabras(c.apellidos);
  const letras = a.length ? [n[0]?.[0], a[0][0]] : n.slice(0, 2).map((p) => p[0]);
  return letras.filter(Boolean).join('').toLocaleUpperCase('es') || '?';
}
