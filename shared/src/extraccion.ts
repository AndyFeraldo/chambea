// Extracción por palabras clave (modo "mock"): funciona siempre, sin internet ni modelo.
// Usa el campo `keywords` de data/competencias.json.

import type { Competencia, CompetenciaDetectada, Ocupacion, Tarea } from './tipos';

/** Minúsculas y sin tildes: "Dónde" -> "donde". */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function palabras(texto: string): string[] {
  return normalizar(texto).split(/[^a-zñ0-9]+/).filter(Boolean);
}

/** Separa en frases para poder citar la evidencia textual. */
export function frases(texto: string): string[] {
  return texto
    .split(/(?<=[.!?¡¿;\n])\s*/)
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
}

/**
 * ¿La frase contiene la palabra clave?
 * - Frases de varias palabras ("no se mezclan"): se buscan tal cual.
 * - Palabras sueltas: se acepta la misma raíz ("repongo" ~ "repongan"),
 *   salvo en logros (dimensión competencia), donde se exige la palabra exacta.
 */
function contiene(frase: string, keyword: string, estricto: boolean): boolean {
  const k = normalizar(keyword).trim();
  if (k.includes(' ')) {
    return (' ' + palabras(frase).join(' ') + ' ').includes(' ' + palabras(k).join(' ') + ' ');
  }
  const tokens = palabras(frase);
  if (estricto || k.length < 5) {
    return tokens.some((t) => t === k || t === k + 's' || t === k + 'es');
  }
  const raiz = k.replace(/[aeiou]$/, '');
  return tokens.some((t) => t.startsWith(raiz) && t.length <= k.length + 3);
}

function recortar(frase: string, max = 160): string {
  return frase.length <= max ? frase : frase.slice(0, max - 1).trimEnd() + '…';
}

/**
 * 1) Busca cada competencia por sus palabras clave.
 * 2) Busca las tareas que la persona cuenta y suma las habilidades que esa tarea revela
 *    (por ejemplo, "cobrar en caja" -> precisión, manejo de dinero y atención al cliente).
 */
export function extraerPorPalabrasClave(
  catalogo: Competencia[],
  textos: string[],
  tareas: Tarea[] = [],
): CompetenciaDetectada[] {
  const todas = textos.flatMap((t) => frases(t ?? ''));
  const resultado: CompetenciaDetectada[] = [];
  for (const c of catalogo) {
    const estricto = c.dimension === 'competencia';
    const frase = todas.find((f) => c.keywords.some((k) => contiene(f, k, estricto)));
    if (frase) resultado.push({ id: c.id, dimension: c.dimension, evidencia: recortar(frase) });
  }
  return [...resultado, ...deducirDeTareas(catalogo, todas, tareas, new Set(resultado.map((r) => r.id)))];
}

function deducirDeTareas(
  catalogo: Competencia[],
  frasesPersona: string[],
  tareas: Tarea[],
  yaTiene: Set<string>,
): CompetenciaDetectada[] {
  const porId = new Map(catalogo.map((c) => [c.id, c]));
  const salida: CompetenciaDetectada[] = [];
  for (const t of tareas) {
    const frase = frasesPersona.find((f) => t.keywords.some((k) => contiene(f, k, false)));
    if (!frase) continue;
    for (const id of t.aporta) {
      const c = porId.get(id);
      if (!c || yaTiene.has(id)) continue;
      yaTiene.add(id);
      salida.push({ id, dimension: c.dimension, evidencia: recortar(frase), tarea: t.nombre });
    }
  }
  return salida;
}

/** Las tareas que aparecen en el relato (para guiar al modelo de IA). */
export function tareasMencionadas(textos: string[], tareas: Tarea[]): Tarea[] {
  const todas = textos.flatMap((t) => frases(t ?? ''));
  return tareas.filter((t) => todas.some((f) => t.keywords.some((k) => contiene(f, k, false))));
}

/** Oficios que la persona menciona al hablar ("soy almacenero", "trabajé de mesera"). */
export function oficiosMencionados(textos: string[], ocupaciones: Ocupacion[]): Ocupacion[] {
  const todas = textos.flatMap((t) => frases(t ?? ''));
  return ocupaciones.filter((o) => (o.menciones ?? []).some((k) => todas.some((f) => contiene(f, k, false))));
}

/**
 * Suma las habilidades típicas del oficio de la persona (el que eligió o el que mencionó),
 * sin repetir las que ya salieron de su relato. Quedan por confirmar.
 */
export function completarConOficios(
  catalogo: Competencia[],
  ocupaciones: Ocupacion[],
  detectadas: CompetenciaDetectada[],
  textos: string[],
  ocupacionActual: string | null,
): CompetenciaDetectada[] {
  const porId = new Map(catalogo.map((c) => [c.id, c]));
  const oficios = [
    ...ocupaciones.filter((o) => o.id === ocupacionActual),
    ...oficiosMencionados(textos, ocupaciones).filter((o) => o.id !== ocupacionActual),
  ];
  const ya = new Set(detectadas.map((d) => d.id));
  const extra: CompetenciaDetectada[] = [];
  for (const o of oficios) {
    for (const id of o.requeridas) {
      const c = porId.get(id);
      if (!c || ya.has(id)) continue;
      ya.add(id);
      extra.push({ id, dimension: c.dimension, evidencia: null, oficio: o.nombre });
    }
  }
  return [...detectadas, ...extra];
}
