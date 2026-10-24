// Proveedor QVAC: modelo local servido por `qvac serve --openai` (paquete oficial @qvac/cli).
// Ruta usada: POST {QVAC_BASE_URL}/v1/chat/completions (API compatible con OpenAI).
// El texto de la persona solo viaja a este servidor propio; nunca a terceros.
import { extraerPorPalabrasClave, normalizar, tareasMencionadas } from '../../../shared/src/extraccion';
import type { Competencia, CompetenciaDetectada, Datos, Tarea } from '../../../shared/src/tipos';
import { config } from '../config';
import { MockProvider } from './mock';
import type { AIProvider, EstadoIA } from './provider';

const SISTEMA = `Eres un orientador laboral peruano. Recibes lo que una persona cuenta sobre su trabajo, con sus palabras.
Tu tarea: identificar SOLO competencias del catálogo dado (por id) que el texto respalde.
Razona así: primero identifica las TAREAS que la persona hace (limpiar, cobrar, cocinar, vender...).
Luego, cada tarea revela habilidades transferibles. Ejemplos:
- Limpiar oficinas -> organización, atención al detalle y cumplimiento de protocolos.
- Cobrar en caja -> precisión, manejo de dinero y atención al cliente.
- Cocinar -> organización de tiempos, higiene y trabajo bajo presión.
- Vender en tienda -> comunicación, identificación de necesidades y orientación al cliente.
Reglas: no inventes; si no hay evidencia, no la incluyas. Para cada una, copia la frase exacta de la persona que la respalda.
Devuelve únicamente JSON: {"competencias":[{"id":"...","evidencia":"frase textual"}]}`;

function cabeceras(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.qvac.apiKey) h.Authorization = `Bearer ${config.qvac.apiKey}`;
  return h;
}

/** Saca el primer objeto JSON del texto del modelo (por si agrega texto o bloques ```). */
export function parsearJson(contenido: string): unknown {
  const limpio = contenido.replace(/<think>[\s\S]*?<\/think>/g, '');
  const inicio = limpio.indexOf('{');
  const fin = limpio.lastIndexOf('}');
  if (inicio < 0 || fin <= inicio) throw new Error('La respuesta del modelo no trae JSON');
  return JSON.parse(limpio.slice(inicio, fin + 1));
}

/**
 * Valida contra el catálogo: descarta ids inexistentes.
 * Si la evidencia no es una frase que la persona dijo, solo se acepta la competencia
 * cuando las palabras clave también la respaldan (y se usa esa frase como evidencia).
 */
export function validar(
  catalogo: Competencia[],
  textos: string[],
  bruto: unknown,
  tareas: Tarea[] = [],
): CompetenciaDetectada[] {
  const lista = (bruto as { competencias?: unknown })?.competencias;
  if (!Array.isArray(lista)) throw new Error('JSON sin "competencias"');
  const porId = new Map(catalogo.map((c) => [c.id, c]));
  const todo = normalizar(textos.join(' '));
  const respaldo = new Map(extraerPorPalabrasClave(catalogo, textos, tareas).map((c) => [c.id, c]));
  const vistos = new Set<string>();
  const salida: CompetenciaDetectada[] = [];
  for (const item of lista) {
    const id = typeof item?.id === 'string' ? item.id : '';
    const c = porId.get(id);
    if (!c || vistos.has(id)) continue;
    let evidencia = typeof item.evidencia === 'string' ? item.evidencia.trim().replace(/^[«"“]|[»"”]$/g, '') : '';
    if (!evidencia || !todo.includes(normalizar(evidencia))) {
      if (!respaldo.has(id)) continue; // sin evidencia real: no se inventa
      evidencia = respaldo.get(id)?.evidencia ?? '';
    }
    vistos.add(id);
    salida.push({ id, dimension: c.dimension, evidencia: evidencia || null, tarea: respaldo.get(id)?.tarea ?? null });
  }
  return salida;
}

export class QvacProvider implements AIProvider {
  nombre = 'qvac' as const;
  private respaldo = new MockProvider();

  async extraer(datos: Pick<Datos, 'competencias' | 'tareas'>, textos: string[]): Promise<CompetenciaDetectada[]> {
    const catalogo = datos.competencias;
    const relato = textos.filter((t) => t?.trim()).join('\n');
    if (!relato) return [];
    try {
      const lista = catalogo.map((c) => `${c.id} | ${c.nombre} | ${c.dimension}`).join('\n');
      const guia = tareasMencionadas(textos, datos.tareas)
        .map((t) => `- ${t.nombre} -> ${t.aporta.join(', ')}`)
        .join('\n');
      const resp = await fetch(`${config.qvac.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: cabeceras(),
        signal: AbortSignal.timeout(config.qvac.timeoutMs),
        body: JSON.stringify({
          model: config.qvac.modelo,
          temperature: 0,
          max_tokens: 1200,
          messages: [
            {
              role: 'system',
              content: `${SISTEMA}\nCatálogo:\n${lista}${guia ? `\nTareas detectadas y lo que suelen revelar (ids):\n${guia}` : ''}`,
            },
            { role: 'user', content: relato },
          ],
        }),
      });
      if (!resp.ok) throw new Error(`QVAC respondió ${resp.status}`);
      const json = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
      const contenido = json.choices?.[0]?.message?.content ?? '';
      const resultado = validar(catalogo, textos, parsearJson(contenido), datos.tareas);
      // Si el modelo no encontró nada, el mock al menos da un punto de partida.
      return resultado.length > 0 ? resultado : this.respaldo.extraer(datos, textos);
    } catch (e) {
      // Nunca registrar el texto de la persona: solo el motivo técnico.
      console.warn(`[qvac] falló la extracción, uso mock: ${(e as Error).message}`);
      return this.respaldo.extraer(datos, textos);
    }
  }

  async salud(): Promise<EstadoIA> {
    try {
      const resp = await fetch(`${config.qvac.baseUrl}/v1/models`, {
        headers: cabeceras(),
        signal: AbortSignal.timeout(3000),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = (await resp.json()) as { data?: { id: string; state?: string }[] };
      const modelo = json.data?.find((m) => m.id === config.qvac.modelo);
      if (!modelo) {
        return { proveedor: 'qvac', conectado: false, detalle: `QVAC responde, pero no tiene el modelo "${config.qvac.modelo}". Se usa mock.` };
      }
      return { proveedor: 'qvac', conectado: true, detalle: `QVAC conectado: ${modelo.id}${modelo.state ? ` (${modelo.state})` : ''}.` };
    } catch (e) {
      return { proveedor: 'qvac', conectado: false, detalle: `No se pudo conectar a QVAC (${(e as Error).message}). Se usa mock.` };
    }
  }
}
