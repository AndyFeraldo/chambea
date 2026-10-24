// Extracción por palabras clave (modo "mock"): funciona siempre, sin internet ni modelo.
// Usa el campo `keywords` de data/competencias.json.

import type { Competencia, CompetenciaDetectada } from './tipos';

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

export function extraerPorPalabrasClave(
  catalogo: Competencia[],
  textos: string[],
): CompetenciaDetectada[] {
  const todas = textos.flatMap((t) => frases(t ?? ''));
  const resultado: CompetenciaDetectada[] = [];
  for (const c of catalogo) {
    const estricto = c.dimension === 'competencia';
    const frase = todas.find((f) => c.keywords.some((k) => contiene(f, k, estricto)));
    if (frase) resultado.push({ id: c.id, dimension: c.dimension, evidencia: recortar(frase) });
  }
  return resultado;
}
