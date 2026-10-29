// Perfiles DE EJEMPLO para el Banco de talento (no son personas reales).
// Se generan siempre iguales a partir de data/: oficio, región y habilidades típicas,
// y se calculan sus coincidencias con el mismo motor que usan las personas.
import { calcularCobertura, calcularRutas } from '@shared/motor';
import type { Datos, Perfil } from '@shared/tipos';
import { EXPERIENCIA, HORARIOS, INICIOS, JORNADAS, nombreVisible, type Cuenta, type Experiencia, type Horario, type Inicio, type Jornada, type PerfilLaboral } from './cuenta';
import type { Estado } from './estado';

export interface PerfilBanco {
  id: string;
  /** Como en Yape: primer nombre + inicial del apellido. */
  nombre: string;
  ejemplo: boolean;
  regionId: string;
  ocupacionActual: string | null;
  perfil: Perfil;
  experiencia: Experiencia;
  jornada: Jornada;
  horarios: Horario[];
  inicio: Inicio;
  zonas: string;
  documentos: string[];
  presentacion: string;
  /** Acepta coordinar por Keet (sin mostrar su enlace). */
  keet?: boolean;
  habilidades: string[];
  enCurso: boolean;
  /** Coincidencia con cada profesión (0..1), incluida la actual. */
  cobertura: Record<string, number>;
  /** Las 3 mejores rutas distintas de la actual. */
  mejores: { ocupacion_id: string; cobertura: number }[];
}

/** Generador pseudoaleatorio con semilla: los ejemplos siempre salen iguales. */
function azar(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Nombres de ejemplo (no son personas reales): solo primer nombre e inicial, como en Yape.
const NOMBRES = 'Rosa Juan María Luis Carmen José Ana Carlos Lucía Miguel Elena Jorge Marleny Wilmer Yesenia Percy Flor Edwin Gladys Jhon Milagros Raúl Sonia Víctor Karina Alex Nelly Hugo Liz Fredy Maribel Óscar Roxana Walter Silvia Iván'.split(' ');
const APELLIDOS = 'Quispe Mamani Huamán Flores Rojas Chávez García Torres Sánchez Vásquez Pérez López Díaz Ramos Castillo Yupanqui Condori Mendoza'.split(' ');
// Distritos de ejemplo por región (para "dónde puede trabajar"). Una región sin lista no muestra zonas.
const ZONAS: Record<string, string[]> = {
  'lima-metropolitana': ['San Juan de Lurigancho', 'Comas', 'Ate', 'Villa El Salvador', 'San Martín de Porres', 'Los Olivos', 'Cercado de Lima'],
  arequipa: ['Cerro Colorado', 'Paucarpata', 'Cayma', 'José Luis Bustamante y Rivero', 'Arequipa'],
  'la-libertad': ['Trujillo', 'La Esperanza', 'El Porvenir', 'Víctor Larco', 'Florencia de Mora'],
};
const DOCS = ['identidad', 'antecedentes', 'sanidad', 'secundaria', 'curso'];
const PERFILES: Perfil[] = ['sin_empleo', 'informal', 'planilla_riesgo'];

export function coberturas(datos: Datos, habilidades: string[]): Record<string, number> {
  const tiene = new Set(habilidades);
  return Object.fromEntries(datos.ocupaciones.map((o) => [o.id, calcularCobertura(datos, o.requeridas, tiene)]));
}

export function perfilBanco(
  datos: Datos,
  base: Omit<PerfilBanco, 'cobertura' | 'mejores'>,
): PerfilBanco {
  const r = calcularRutas(datos, {
    competencias_ids: base.habilidades,
    region_id: base.regionId,
    perfil: base.perfil,
    ocupacion_actual: base.ocupacionActual,
  });
  return {
    ...base,
    cobertura: coberturas(datos, base.habilidades),
    mejores: r.rutas.slice(0, 3).map((x) => ({ ocupacion_id: x.ocupacion_id, cobertura: x.cobertura })),
  };
}

export function perfilesDeEjemplo(datos: Datos): PerfilBanco[] {
  const rnd = azar(2026);
  const todas = datos.competencias.map((c) => c.id);
  const elegir = <T,>(lista: readonly T[]): T => lista[Math.floor(rnd() * lista.length)];
  const lista: PerfilBanco[] = [];
  let n = 1;
  for (const region of datos.regiones) {
    for (const o of datos.ocupaciones) {
      const cuantos = 1 + Math.floor(rnd() * 3);
      for (let k = 0; k < cuantos; k++) {
        // Lo típico de su oficio (a veces le falta algo) + algunas habilidades de otros trabajos.
        const propias = o.requeridas.filter(() => rnd() > 0.15);
        const extra = Array.from({ length: 2 + Math.floor(rnd() * 4) }, () => todas[Math.floor(rnd() * todas.length)]);
        const habilidades = [...new Set([...propias, ...extra])];
        lista.push(
          perfilBanco(datos, {
            id: `EJ-${String(n++).padStart(3, '0')}`,
            nombre: nombreVisible(elegir(NOMBRES), elegir(APELLIDOS)),
            ejemplo: true,
            regionId: region.id,
            ocupacionActual: o.id,
            perfil: elegir(PERFILES),
            experiencia: elegir(EXPERIENCIA),
            jornada: elegir(JORNADAS),
            horarios: HORARIOS.filter(() => rnd() > 0.5),
            inicio: elegir(INICIOS),
            zonas: ZONAS[region.id] ? [...new Set([elegir(ZONAS[region.id]), elegir(ZONAS[region.id])])].join(', ') : '',
            documentos: ['identidad', ...DOCS.slice(1).filter(() => rnd() > 0.55)],
            presentacion: '',
            habilidades,
            enCurso: rnd() < 0.3,
          }),
        );
      }
    }
  }
  return lista;
}

/** El perfil de la persona tal como lo verían las empresas (para el banco y la vista previa). */
export function perfilPropio(datos: Datos, estado: Estado, cuenta: Cuenta, laboral: Omit<PerfilLaboral, 'publicado'>): PerfilBanco {
  return perfilBanco(datos, {
    id: 'TU-PERFIL',
    nombre: nombreVisible(cuenta.nombres, cuenta.apellidos),
    ejemplo: false,
    regionId: cuenta.regionId,
    ocupacionActual: estado.ocupacionActual,
    perfil: estado.perfil ?? 'sin_empleo',
    experiencia: laboral.experiencia,
    jornada: laboral.jornada,
    horarios: laboral.horarios,
    inicio: laboral.inicio,
    zonas: laboral.zonas || cuenta.distrito,
    documentos: laboral.documentos,
    presentacion: laboral.presentacion,
    keet: laboral.contactoPor === 'keet',
    habilidades: estado.celdas.map((c) => c.id),
    enCurso: estado.primerPaso?.principal.tipo === 'capacitate',
  });
}
