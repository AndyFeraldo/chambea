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

export type Pantalla =
  | 'inicio'
  | 'situacion'
  | 'ocupacion'
  | 'pregunta'
  | 'armando'
  | 'panal'
  | 'rutas'
  | 'paso'
  | 'resumen';

export interface Celda {
  id: string;
  dimension: Dimension;
  evidencia: string | null;
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
  };
}

/** Paso del flyer (1 a 4) al que pertenece cada pantalla; 5 = resumen. */
export function pasoDe(p: Pantalla): number {
  switch (p) {
    case 'situacion':
    case 'ocupacion':
    case 'pregunta':
    case 'armando':
      return 1;
    case 'panal':
      return 2;
    case 'rutas':
      return 3;
    case 'paso':
      return 4;
    case 'resumen':
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
