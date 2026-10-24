// Carga data/*.json. Agregar una región, ocupación o curso solo requiere editar esos archivos.
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ } from './config';
import type { Datos } from '../../shared/src/tipos';

function leer<T>(archivo: string): T {
  return JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', archivo), 'utf8')) as T;
}

export function cargarDatos(): Datos {
  const competencias = leer<{ ilustrativo?: boolean; competencias: Datos['competencias'] }>('competencias.json');
  const ocupaciones = leer<{ ilustrativo?: boolean; ocupaciones: Datos['ocupaciones'] }>('ocupaciones.json');
  const regiones = leer<{ ilustrativo?: boolean; regiones: Datos['regiones'] }>('regiones.json');
  const capacitaciones = leer<{ ilustrativo?: boolean; capacitaciones: Datos['capacitaciones'] }>('capacitaciones.json');
  const casos = leer<{ casos: Datos['casos'] }>('casos-demo.json');
  return {
    competencias: competencias.competencias,
    ocupaciones: ocupaciones.ocupaciones,
    regiones: regiones.regiones,
    capacitaciones: capacitaciones.capacitaciones,
    casos: casos.casos,
    ilustrativo: [competencias, ocupaciones, regiones, capacitaciones].some((d) => d.ilustrativo !== false),
  };
}
