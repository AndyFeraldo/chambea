// Cliente de la API. Si no hay servidor (por ejemplo, en el enlace de demostración),
// usa el mismo motor directamente en el navegador: nada sale del teléfono.
import { extraerPorPalabrasClave } from '@shared/extraccion';
import { calcularPrimerPaso, calcularRutas } from '@shared/motor';
import type {
  CompetenciaDetectada,
  Costo,
  Datos,
  Horas,
  Modalidad,
  Perfil,
  ResultadoPrimerPaso,
  ResultadoRutas,
} from '@shared/tipos';
import competencias from '@data/competencias.json';
import ocupaciones from '@data/ocupaciones.json';
import regiones from '@data/regiones.json';
import capacitaciones from '@data/capacitaciones.json';
import casos from '@data/casos-demo.json';

export interface Salud {
  modo: 'servidor' | 'navegador';
  ia: { proveedor: 'mock' | 'qvac'; conectado: boolean; detalle: string };
  enlaces: { empleos_peru: string | null; capacitate_peru: string | null };
}

const datosLocales = {
  competencias: competencias.competencias,
  ocupaciones: ocupaciones.ocupaciones,
  regiones: regiones.regiones,
  capacitaciones: capacitaciones.capacitaciones,
  casos: casos.casos,
  ilustrativo: true,
} as unknown as Datos;

const enlacesLocales = {
  empleos_peru: import.meta.env.VITE_EMPLEOS_PERU_URL || null,
  capacitate_peru: import.meta.env.VITE_CAPACITATE_PERU_URL || null,
};

let modo: Salud['modo'] = 'navegador';

async function pedir<T>(ruta: string, cuerpo?: unknown, timeoutMs = 4000): Promise<T> {
  const resp = await fetch(ruta, {
    method: cuerpo === undefined ? 'GET' : 'POST',
    headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!resp.ok || !(resp.headers.get('content-type') ?? '').includes('json')) throw new Error(`HTTP ${resp.status}`);
  return resp.json() as Promise<T>;
}

export async function iniciar(): Promise<{ datos: Datos; salud: Salud }> {
  if (import.meta.env.VITE_SOLO_NAVEGADOR !== '1') {
    try {
      const [salud, datos] = await Promise.all([
        pedir<Omit<Salud, 'modo'>>('/api/salud'),
        pedir<Datos>('/api/catalogo'),
      ]);
      modo = 'servidor';
      return { datos, salud: { ...salud, modo } };
    } catch {
      // Sin servidor: seguimos en el navegador.
    }
  }
  modo = 'navegador';
  return {
    datos: datosLocales,
    salud: {
      modo,
      ia: { proveedor: 'mock', conectado: true, detalle: 'Motor en el navegador, sin servidor.' },
      enlaces: enlacesLocales,
    },
  };
}

export async function extraer(datos: Datos, respuestas: string[]): Promise<CompetenciaDetectada[]> {
  if (modo === 'servidor') {
    try {
      // QVAC puede tardar con un modelo local: damos más tiempo.
      const r = await pedir<{ competencias: CompetenciaDetectada[] }>(
        '/api/extraer',
        { respuestas_guiadas: respuestas },
        90000,
      );
      return r.competencias;
    } catch {
      // Si el servidor falla, el motor local responde igual.
    }
  }
  return extraerPorPalabrasClave(datos.competencias, respuestas);
}

export async function rutas(
  datos: Datos,
  e: { competencias_ids: string[]; region_id: string; perfil: Perfil; ocupacion_actual: string | null },
): Promise<ResultadoRutas> {
  if (modo === 'servidor') {
    try {
      return await pedir<ResultadoRutas>('/api/rutas', e);
    } catch {
      /* respaldo local */
    }
  }
  return calcularRutas(datos, e);
}

export async function primerPaso(
  datos: Datos,
  e: {
    ocupacion_id: string;
    competencias_ids: string[];
    perfil: Perfil;
    horas: Horas;
    modalidad: Modalidad;
    costo: Costo;
  },
): Promise<ResultadoPrimerPaso> {
  if (modo === 'servidor') {
    try {
      return await pedir<ResultadoPrimerPaso>('/api/primer-paso', { ...e, horas_semana: e.horas });
    } catch {
      /* respaldo local */
    }
  }
  return calcularPrimerPaso(datos, e);
}
