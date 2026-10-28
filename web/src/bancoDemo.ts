// Perfiles DE EJEMPLO para el Banco de talento (no son personas reales).
// Se generan siempre iguales a partir de data/: oficio, región y habilidades típicas,
// y se calculan sus coincidencias con el mismo motor que usan las personas.
import { calcularCobertura, calcularRutas } from '@shared/motor';
import type { Datos, Perfil } from '@shared/tipos';

export interface PerfilBanco {
  id: string;
  iniciales: string;
  ejemplo: boolean;
  regionId: string;
  ocupacionActual: string | null;
  perfil: Perfil;
  anios: number;
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

const LETRAS = 'ABCDEFGHIJLMNOPRSTVY';
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
            iniciales: `${LETRAS[Math.floor(rnd() * LETRAS.length)]}. ${LETRAS[Math.floor(rnd() * LETRAS.length)]}.`,
            ejemplo: true,
            regionId: region.id,
            ocupacionActual: o.id,
            perfil: PERFILES[Math.floor(rnd() * PERFILES.length)],
            anios: 1 + Math.floor(rnd() * 15),
            habilidades,
            enCurso: rnd() < 0.3,
          }),
        );
      }
    }
  }
  return lista;
}
