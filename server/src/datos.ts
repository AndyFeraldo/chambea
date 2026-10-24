// Carga data/*.json. Agregar una región, ocupación o curso solo requiere editar esos archivos.
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ } from './config';
import type { Datos } from '../../shared/src/tipos';

function leer<T>(archivo: string, siFalta?: T): T {
  const ruta = path.join(RAIZ, 'data', archivo);
  if (siFalta !== undefined && !fs.existsSync(ruta)) return siFalta;
  return JSON.parse(fs.readFileSync(ruta, 'utf8')) as T;
}

export function cargarDatos(): Datos {
  const competencias = leer<{ ilustrativo?: boolean; competencias: Datos['competencias'] }>('competencias.json');
  const ocupaciones = leer<{ ilustrativo?: boolean; ocupaciones: Datos['ocupaciones'] }>('ocupaciones.json');
  const regiones = leer<{ ilustrativo?: boolean; regiones: Datos['regiones'] }>('regiones.json');
  const capacitaciones = leer<{ ilustrativo?: boolean; capacitaciones: Datos['capacitaciones'] }>('capacitaciones.json');
  const tareas = leer<{ tareas: Datos['tareas'] }>('tareas.json', { tareas: [] });
  const casos = leer<{ casos: Datos['casos'] }>('casos-demo.json');
  return {
    competencias: competencias.competencias,
    ocupaciones: ocupaciones.ocupaciones,
    regiones: regiones.regiones,
    capacitaciones: capacitaciones.capacitaciones,
    tareas: tareas.tareas,
    casos: casos.casos,
    ilustrativo: [competencias, ocupaciones, regiones, capacitaciones].some((d) => d.ilustrativo !== false),
  };
}
