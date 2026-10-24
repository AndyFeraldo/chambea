import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { config, RAIZ } from './config';
import { cargarDatos } from './datos';
import { MockProvider } from './ia/mock';
import { QvacProvider } from './ia/qvac';
import type { AIProvider } from './ia/provider';
import { calcularPrimerPaso, calcularRutas } from '../../shared/src/motor';
import type { Costo, Horas, Modalidad, Perfil } from '../../shared/src/tipos';

const datos = cargarDatos();
const ia: AIProvider = config.proveedor === 'qvac' ? new QvacProvider() : new MockProvider();
const app = express();
app.use(express.json({ limit: '100kb' }));

const PERFILES: Perfil[] = ['sin_empleo', 'informal', 'planilla_riesgo'];
const perfil = (v: unknown): Perfil => (PERFILES.includes(v as Perfil) ? (v as Perfil) : 'sin_empleo');
const ids = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);

app.get('/api/salud', async (_req, res) => {
  res.json({ ok: true, ia: await ia.salud(), ilustrativo: datos.ilustrativo, enlaces: config.enlaces });
});

/** Todo el catálogo que la interfaz necesita para dibujar (sin datos personales). */
app.get('/api/catalogo', (_req, res) => res.json(datos));

app.get('/api/regiones', (_req, res) => res.json({ regiones: datos.regiones.map(({ id, nombre }) => ({ id, nombre })) }));

app.post('/api/extraer', async (req, res) => {
  const { texto, respuestas_guiadas } = req.body ?? {};
  const textos = [...ids(respuestas_guiadas), ...(typeof texto === 'string' ? [texto] : [])];
  res.json({ competencias: await ia.extraer(datos, textos), proveedor: ia.nombre });
});

app.post('/api/rutas', (req, res) => {
  const b = req.body ?? {};
  res.json(
    calcularRutas(datos, {
      competencias_ids: ids(b.competencias_ids),
      region_id: String(b.region_id ?? ''),
      perfil: perfil(b.perfil),
      ocupacion_actual: typeof b.ocupacion_actual === 'string' ? b.ocupacion_actual : null,
    }),
  );
});

app.post('/api/primer-paso', (req, res) => {
  const b = req.body ?? {};
  res.json(
    calcularPrimerPaso(datos, {
      ocupacion_id: String(b.ocupacion_id ?? ''),
      competencias_ids: ids(b.competencias_ids),
      perfil: perfil(b.perfil),
      horas: (['1-3', '4-6', '7+'].includes(b.horas_semana) ? b.horas_semana : '1-3') as Horas,
      modalidad: (['celular', 'presencial', 'igual'].includes(b.modalidad) ? b.modalidad : 'igual') as Modalidad,
      costo: (b.costo === 'poco' ? 'poco' : 'gratis') as Costo,
    }),
  );
});

// En producción, el mismo servidor entrega la web ya construida (web/dist).
const web = path.join(RAIZ, 'web', 'dist');
if (fs.existsSync(web)) {
  app.use(express.static(web));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(web, 'index.html')));
}

app.listen(config.puerto, '0.0.0.0', async () => {
  const estado = await ia.salud();
  console.log(`Chambea API en http://localhost:${config.puerto}  ·  IA: ${estado.detalle}`);
});
