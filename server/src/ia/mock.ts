import { extraerPorPalabrasClave } from '../../../shared/src/extraccion';
import type { AIProvider } from './provider';

/** Sin modelo: busca las palabras clave del catálogo. Funciona siempre. */
export class MockProvider implements AIProvider {
  nombre = 'mock' as const;

  async extraer(...args: Parameters<AIProvider['extraer']>) {
    return extraerPorPalabrasClave(...args);
  }

  async salud() {
    return { proveedor: 'mock' as const, conectado: true, detalle: 'Modo simulado: palabras clave, sin modelo.' };
  }
}
