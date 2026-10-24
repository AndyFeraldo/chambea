import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(RAIZ, '.env') });

function texto(nombre: string): string | null {
  const v = process.env[nombre]?.trim();
  return v ? v : null;
}

export const config = {
  puerto: Number(process.env.PORT ?? 3001),
  proveedor: (process.env.AI_PROVIDER ?? 'mock').toLowerCase() === 'qvac' ? 'qvac' : 'mock',
  qvac: {
    baseUrl: (texto('QVAC_BASE_URL') ?? 'http://127.0.0.1:11434').replace(/\/+$/, ''),
    modelo: texto('QVAC_MODEL') ?? 'chambea-llm',
    apiKey: texto('QVAC_API_KEY'),
    timeoutMs: Number(process.env.QVAC_TIMEOUT_MS ?? 60000),
  },
  // TODO: el equipo debe confirmar los enlaces oficiales antes de llenarlos en .env
  enlaces: {
    empleos_peru: texto('EMPLEOS_PERU_URL'),
    capacitate_peru: texto('CAPACITATE_PERU_URL'),
  },
} as const;
