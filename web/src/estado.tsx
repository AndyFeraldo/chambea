// Estado del recorrido. Vive solo en la memoria del navegador:
// no se guarda en ningún servidor ni en el teléfono. "Empezar de nuevo" lo borra.
import { createContext, useContext } from 'react';
import type {
  Competencia,
  Costo,
  Datos,
  Dimension,
  Horas,
  Modalidad,
  Perfil,
  ResultadoPrimerPaso,
  ResultadoRutas,
} from '@shared/tipos';
import type { Salud } from './api';
import type { Cuenta } from './cuenta';

export type Pantalla =
  | 'inicio'
  | 'situacion'
  | 'ocupacion'
  | 'pregunta'
  | 'intereses'
  | 'armando'
  | 'puente'
  | 'panal'
  | 'rutas'
  | 'paso'
  | 'resumen'
  | 'compartido'
  | 'cuenta'
  | 'banco'
  | 'unirse';

export interface Celda {
  id: string;
  dimension: Dimension;
  evidencia: string | null;
  tarea?: string | null;
  oficio?: string | null;
  /** Lo confirmó en las preguntas puente. */
  puente?: boolean;
  confirmada: boolean;
}

export interface Lugar {
  pantalla: Pantalla;
  pregunta: number;
}

export interface Estado {
  lugar: Lugar;
  historial: Lugar[];
  regionId: string;
  asesor: boolean;
  demo: string | null;
  perfil: Perfil | null;
  ocupacionActual: string | null;
  respuestas: string[];
  celdas: Celda[];
  rutas: ResultadoRutas | null;
  rutaElegida: string | null;
  horas: Horas | null;
  modalidad: Modalidad | null;
  costo: Costo | null;
  primerPaso: ResultadoPrimerPaso | null;
  /** Áreas que le interesan y condiciones que prefiere evitar. */
  intereses: string[];
  evitar: string[];
  /** Habilidades para las preguntas puente. */
  puente: string[];
  /** La persona aceptó guardar su progreso en este celular. */
  guardar: boolean;
  /** Pasos del plan que ya marcó como hechos. */
  plan: Record<string, boolean>;
  /** Panal que alguien compartió por enlace (solo lectura). */
  compartido: PanalCompartido | null;
  /** Cuenta con la que ingresó (demo: guardada solo en este navegador). */
  cuenta: Cuenta | null;
}

export interface PanalCompartido {
  region: string;
  celdas: { id: string; dimension: Dimension }[];
  frases: string[];
  ruta: string | null;
  paso: { titulo: string; detalle: string } | null;
}

export const NUM_PREGUNTAS = 4;

export function estadoInicial(regionId: string): Estado {
  return {
    lugar: { pantalla: 'inicio', pregunta: 0 },
    historial: [],
    regionId,
    asesor: false,
    demo: null,
    perfil: null,
    ocupacionActual: null,
    respuestas: Array(NUM_PREGUNTAS).fill(''),
    celdas: [],
    rutas: null,
    rutaElegida: null,
    horas: null,
    modalidad: null,
    costo: null,
    primerPaso: null,
    intereses: [],
    evitar: [],
    puente: [],
    guardar: false,
    plan: {},
    compartido: null,
    cuenta: null,
  };
}

// ---------- Guardar en este celular (solo si la persona acepta) ----------

const CLAVE = 'chambea:progreso:v1';

export function leerProgreso(): Estado | null {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const e = JSON.parse(crudo) as Estado;
    return e && e.guardar ? e : null;
  } catch {
    return null;
  }
}

export function escribirProgreso(e: Estado): void {
  try {
    if (e.guardar && !e.compartido) localStorage.setItem(CLAVE, JSON.stringify(e));
    else localStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento (modo privado): la app sigue igual, solo no guarda.
  }
}

// ---------- Compartir el panal por enlace (los datos viajan en el enlace, no en un servidor) ----------

function aBase64Url(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64Url(b64: string): string {
  const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function urlPublica(): string {
  return import.meta.env.VITE_URL_PUBLICA || location.origin + location.pathname;
}

export function enlaceCompartir(p: PanalCompartido): string {
  return `${urlPublica()}#panal=${aBase64Url(JSON.stringify(p))}`;
}

export function leerCompartido(hash: string): PanalCompartido | null {
  const m = hash.match(/^#panal=([A-Za-z0-9_-]+)$/);
  if (!m) return null;
  try {
    const p = JSON.parse(deBase64Url(m[1])) as PanalCompartido;
    return Array.isArray(p.celdas) ? p : null;
  } catch {
    return null;
  }
}

/** Paso del flyer (1 a 4) al que pertenece cada pantalla; 5 = resumen. */
export function pasoDe(p: Pantalla): number {
  switch (p) {
    case 'situacion':
    case 'ocupacion':
    case 'pregunta':
    case 'intereses':
    case 'armando':
    case 'puente':
      return 1;
    case 'panal':
      return 2;
    case 'rutas':
      return 3;
    case 'paso':
      return 4;
    case 'resumen':
    case 'cuenta':
    case 'banco':
    case 'unirse':
      return 5;
    default:
      return 0;
  }
}

export interface Contexto {
  datos: Datos;
  salud: Salud;
  estado: Estado;
  cambiar: (parcial: Partial<Estado>) => void;
  ir: (pantalla: Pantalla, pregunta?: number) => void;
  atras: () => void;
  reiniciar: () => void;
  comp: (id: string) => Competencia | undefined;
}

export const Ctx = createContext<Contexto | null>(null);

export function useApp(): Contexto {
  const c = useContext(Ctx);
  if (!c) throw new Error('Contexto no disponible');
  return c;
}

/** Etiqueta corta para el hexágono. Usa `nombre_corto` si el catálogo lo trae. */
export function etiquetaHex(c: Competencia | undefined): string {
  if (!c) return '';
  const corto = (c as Competencia & { nombre_corto?: string }).nombre_corto;
  if (corto) return corto;
  const base = c.nombre.replace(/\s*\(.*\)\s*/g, '');
  const corte = base.search(/ (con|según|de forma|en el|en horas|y deja|y su|que se) /);
  return corte > 0 ? base.slice(0, corte) : base;
}

export const ORDEN_DIMENSIONES: Dimension[] = ['conocimiento', 'habilidad', 'cualidad', 'competencia'];
