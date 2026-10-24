// Motor de coincidencias (rutas) y de "primer paso". Ver CLAUDE.md, sección 7.
// No depende de ningún nombre de ocupación ni de región: todo sale de data/.

import type {
  Capacitacion,
  Competencia,
  Costo,
  Datos,
  Dimension,
  Horas,
  Modalidad,
  NivelDemanda,
  OpcionPaso,
  Perfil,
  ResultadoPrimerPaso,
  ResultadoRutas,
  Ruta,
} from './tipos';

export const PESOS: Record<Dimension, number> = {
  competencia: 3,
  habilidad: 2,
  conocimiento: 2,
  cualidad: 1,
};

const ORDEN_DEMANDA: Record<NivelDemanda, number> = { alta: 3, media: 2, baja: 1 };
export const MAX_RUTAS = 3;
export const UMBRAL_POSTULAR = 0.85;
export const UMBRAL_CURSO = 0.5;
export const UMBRAL_SIN_EMPLEO = 0.8;

function indice(datos: Datos): Map<string, Competencia> {
  return new Map(datos.competencias.map((c) => [c.id, c]));
}

function peso(cat: Map<string, Competencia>, id: string): number {
  const c = cat.get(id);
  return c ? PESOS[c.dimension] : 1;
}

export function calcularCobertura(datos: Datos, requeridas: string[], tiene: Set<string>): number {
  const cat = indice(datos);
  const total = requeridas.reduce((s, id) => s + peso(cat, id), 0);
  if (total === 0) return 0;
  const logrado = requeridas.filter((id) => tiene.has(id)).reduce((s, id) => s + peso(cat, id), 0);
  return logrado / total;
}

export function calcularRutas(
  datos: Datos,
  entrada: {
    competencias_ids: string[];
    region_id: string;
    perfil: Perfil;
    ocupacion_actual?: string | null;
  },
): ResultadoRutas {
  const tiene = new Set(entrada.competencias_ids);
  const region = datos.regiones.find((r) => r.id === entrada.region_id) ?? null;
  const actual = entrada.ocupacion_actual ?? null;

  const rutas: Ruta[] = datos.ocupaciones
    // Recolocar, no ascender: solo nivel operativo y distinta a la actual.
    .filter((o) => o.nivel === 'operativo' && o.id !== actual)
    .map((o) => ({
      ocupacion_id: o.id,
      nombre: o.nombre,
      alias: o.alias,
      requisitos_minimos: o.requisitos_minimos,
      cobertura: calcularCobertura(datos, o.requeridas, tiene),
      tiene: o.requeridas.filter((id) => tiene.has(id)),
      faltan: o.requeridas.filter((id) => !tiene.has(id)),
      demanda: region?.demanda[o.id] ?? null,
    }))
    .filter((r) => r.tiene.length > 0);

  const dem = (r: Ruta) => (r.demanda ? ORDEN_DEMANDA[r.demanda] : 0);
  rutas.sort((a, b) => {
    if (entrada.perfil === 'sin_empleo') {
      // Sin empleo: primero lo que ya puede ejercer.
      const ya = Number(b.cobertura >= UMBRAL_SIN_EMPLEO) - Number(a.cobertura >= UMBRAL_SIN_EMPLEO);
      if (ya !== 0) return ya;
    }
    return b.cobertura - a.cobertura || dem(b) - dem(a);
  });

  let aviso_demanda: ResultadoRutas['aviso_demanda'] = null;
  if (actual && region && region.demanda[actual] === 'baja') {
    const occ = datos.ocupaciones.find((o) => o.id === actual);
    if (occ) aviso_demanda = { ocupacion_id: occ.id, nombre: occ.nombre, region: region.nombre };
  }

  return { rutas: rutas.slice(0, MAX_RUTAS), aviso_demanda };
}

// ---------- Primer paso ----------

function encajaHoras(c: Capacitacion, horas: Horas): boolean {
  if (horas === '1-3') return c.horas_semana <= 3;
  if (horas === '4-6') return c.horas_semana <= 6;
  return true;
}

function encajaModalidad(c: Capacitacion, modalidad: Modalidad): boolean {
  return modalidad === 'igual' || c.modalidad === modalidad;
}

function encajaCosto(c: Capacitacion, costo: Costo): boolean {
  return costo === 'poco' || c.costo === 'gratuito';
}

/** El curso que cubra más de lo que falta, respetando horas, modalidad y costo si se puede. */
export function elegirCurso(
  datos: Datos,
  faltan: string[],
  perfil: Perfil,
  horas: Horas,
  modalidad: Modalidad,
  costo: Costo,
): { curso: Capacitacion; ajustado: boolean } | null {
  const candidatos = datos.capacitaciones
    .map((c) => ({ c, cubiertos: c.cubre.filter((id) => faltan.includes(id)).length }))
    .filter((x) => x.cubiertos > 0);
  if (candidatos.length === 0) return null;

  const puntaje = (x: { c: Capacitacion; cubiertos: number }) => {
    let p = x.cubiertos * 10;
    // Informal: cursos cortos, pocas horas y desde el celular, para no dejar de trabajar.
    if (perfil === 'informal' && x.c.duracion_semanas <= 4 && x.c.horas_semana <= 3 && x.c.modalidad === 'celular') p += 3;
    if (x.c.costo === 'gratuito') p += 1;
    return p - x.c.duracion_semanas * 0.1;
  };
  const ordenar = (lista: typeof candidatos) => [...lista].sort((a, b) => puntaje(b) - puntaje(a));

  const queEncajan = candidatos.filter(
    (x) => encajaHoras(x.c, horas) && encajaModalidad(x.c, modalidad) && encajaCosto(x.c, costo),
  );
  if (queEncajan.length > 0) return { curso: ordenar(queEncajan)[0].c, ajustado: false };
  return { curso: ordenar(candidatos)[0].c, ajustado: true };
}

/** "medios de pago (efectivo…)" -> "medios de pago" */
export function nombreCorto(c: Competencia | undefined): string {
  if (!c) return '';
  const base = c.nombre.replace(/\s*\(.*\)\s*/g, '').trim();
  return base.charAt(0).toLowerCase() + base.slice(1);
}

function enumerar(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return items.slice(0, -1).join(', ') + ' y ' + items[items.length - 1];
}

export function calcularPrimerPaso(
  datos: Datos,
  entrada: {
    ocupacion_id: string;
    competencias_ids: string[];
    perfil: Perfil;
    horas: Horas;
    modalidad: Modalidad;
    costo: Costo;
  },
): ResultadoPrimerPaso {
  const cat = indice(datos);
  const occ = datos.ocupaciones.find((o) => o.id === entrada.ocupacion_id);
  const tiene = new Set(entrada.competencias_ids);
  const requeridas = occ?.requeridas ?? [];
  const tenidas = requeridas.filter((id) => tiene.has(id));
  const faltan = requeridas.filter((id) => !tiene.has(id));
  const cobertura = occ ? calcularCobertura(datos, requeridas, tiene) : 0;
  const nombreOcc = occ?.nombre.toLowerCase() ?? '';

  const elegido = elegirCurso(datos, faltan, entrada.perfil, entrada.horas, entrada.modalidad, entrada.costo);

  const opCurso: OpcionPaso | null = elegido
    ? {
        tipo: 'capacitate',
        titulo: 'Capacítate Perú',
        detalle: elegido.curso.titulo,
        curso: elegido.curso,
        curso_ajustado: elegido.ajustado,
      }
    : null;
  const opEmpleos: OpcionPaso = {
    tipo: 'empleos',
    titulo: 'Empleos Perú',
    detalle: `Postula a vacantes de ${nombreOcc}`,
  };
  const opAsesor: OpcionPaso = {
    tipo: 'asesor',
    titulo: 'Hablar con un asesor',
    detalle: 'En un Centro de Empleo, sin costo',
  };

  let principal: OpcionPaso;
  if (!occ || tenidas.length === 0 || cobertura < UMBRAL_CURSO) {
    principal = opAsesor;
  } else if (cobertura >= UMBRAL_POSTULAR) {
    // En planilla, pero en riesgo: primero prepararse, aunque ya esté cerca.
    principal = entrada.perfil === 'planilla_riesgo' && opCurso ? opCurso : opEmpleos;
  } else {
    principal = opCurso ?? opAsesor;
  }

  // Porqué en una línea.
  const fuertes = [...tenidas]
    .sort((a, b) => peso(cat, b) - peso(cat, a))
    .slice(0, 2)
    .map((id) => `«${cat.get(id)?.nombre_simple ?? id}»`);
  const faltanNombres = faltan.map((id) => `«${cat.get(id)?.nombre_simple ?? id}»`);
  let porque: string;
  if (principal.tipo === 'asesor') {
    porque = tenidas.length
      ? `Ya tienes ${enumerar(fuertes)}. Un asesor te ayuda a ver la mejor ruta para ti.`
      : 'Porque un asesor te ayuda a ver qué rutas encajan con lo que sabes.';
  } else if (faltan.length === 0) {
    porque = `Porque ya tienes todo lo que suelen pedir para ${nombreOcc}.`;
  } else if (faltan.length === 1) {
    porque = `Porque ya tienes ${enumerar(fuertes)}, y solo te falta ${faltanNombres[0]}.`;
  } else {
    porque = `Porque ya tienes ${enumerar(fuertes)}. Te faltan ${faltan.length}: ${enumerar(faltanNombres.slice(0, 3))}.`;
  }

  const alternativas = [opCurso, opEmpleos, opAsesor].filter(
    (o): o is OpcionPaso => o !== null && o.tipo !== principal.tipo,
  );

  return { principal, porque, alternativas: alternativas.slice(0, 2) };
}
