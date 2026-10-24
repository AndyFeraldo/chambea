// Textos de la interfaz. Para agregar otro idioma (por ejemplo quechua),
// crea qu.json con las mismas claves y cámbialo aquí.
import es from './es.json';

export const textos = es;

/** t('rutas.tienes', { x: 6, y: 7 }) -> "Tienes 6 de 7" */
export function t(clave: string, vars: Record<string, string | number> = {}): string {
  const valor = clave.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], es);
  if (typeof valor !== 'string') return clave;
  return valor.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
