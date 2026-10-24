import type { Competencia, CompetenciaDetectada } from '../../../shared/src/tipos';

export interface EstadoIA {
  proveedor: 'mock' | 'qvac';
  conectado: boolean;
  detalle: string;
}

/** Capa de IA intercambiable (AI_PROVIDER=mock|qvac). */
export interface AIProvider {
  nombre: 'mock' | 'qvac';
  extraer(catalogo: Competencia[], textos: string[]): Promise<CompetenciaDetectada[]>;
  salud(): Promise<EstadoIA>;
}
