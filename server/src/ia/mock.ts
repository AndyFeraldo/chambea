import { extraerPorPalabrasClave } from '../../../shared/src/extraccion';
import type { AIProvider } from './provider';

/** Sin modelo: busca las palabras clave del catálogo. Funciona siempre. */
export class MockProvider implements AIProvider {
  nombre = 'mock' as const;

  async extraer(datos: Parameters<AIProvider['extraer']>[0], textos: string[]) {
    return extraerPorPalabrasClave(datos.competencias, textos, datos.tareas);
  }

  async salud() {
    return { proveedor: 'mock' as const, conectado: true, detalle: 'Modo simulado: palabras clave, sin modelo.' };
  }
}
