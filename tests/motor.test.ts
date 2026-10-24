// Pruebas del motor con los 2 casos SIMULADOS de data/casos-demo.json.
// Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cargarDatos } from '../server/src/datos';
import { extraerPorPalabrasClave } from '../shared/src/extraccion';
import { calcularPrimerPaso, calcularRutas } from '../shared/src/motor';

const datos = cargarDatos();

function recorrido(casoId: string, horas: '1-3' | '4-6' | '7+' = '1-3') {
  const caso = datos.casos.find((c) => c.id === casoId)!;
  const comps = extraerPorPalabrasClave(datos.competencias, caso.respuestas);
  const ids = comps.map((c) => c.id);
  const rutas = calcularRutas(datos, {
    competencias_ids: ids,
    region_id: caso.region_id,
    perfil: caso.perfil,
    ocupacion_actual: caso.ocupacion_actual,
  });
  const paso = calcularPrimerPaso(datos, {
    ocupacion_id: rutas.rutas[0].ocupacion_id,
    competencias_ids: ids,
    perfil: caso.perfil,
    horas,
    modalidad: 'celular',
    costo: 'gratis',
  });
  return { comps, ids, rutas, paso };
}

test('Rosa: extrae lo esperado, primera ruta vendedor/a de tienda 6 de 7, curso de ventas', () => {
  const { ids, rutas, paso, comps } = recorrido('rosa');
  const esperadas = [
    'hab_cobro_caja', 'hab_cuadre_caja', 'con_medios_pago', 'hab_atencion_cliente', 'cua_honestidad',
    'cua_paciencia', 'comp_caja_sin_faltantes', 'comp_resuelve_reclamos', 'hab_inventario',
    'hab_reposicion', 'cua_puntualidad', 'con_ubicacion_productos',
  ];
  for (const e of esperadas) assert.ok(ids.includes(e), `falta ${e}`);
  const r = rutas.rutas[0];
  assert.equal(r.ocupacion_id, 'vendedor_tienda');
  assert.equal(`${r.tiene.length} de ${r.tiene.length + r.faltan.length}`, '6 de 7');
  assert.deepEqual(r.faltan, ['hab_tecnicas_venta']);
  assert.equal(rutas.aviso_demanda?.ocupacion_id, 'cajero');
  assert.equal(paso.principal.tipo, 'capacitate');
  assert.equal(paso.principal.curso?.id, 'c_ventas');
  assert.match(paso.porque, /solo te falta «Sé ofrecer y convencer para vender»/);
  assert.equal(paso.alternativas.length, 2);
  const honestidad = comps.find((c) => c.id === 'cua_honestidad');
  assert.match(honestidad!.evidencia!, /cerrar la caja sola/);
});

test('Marleny: primera ruta reponedor/a 5 de 7, curso de almacén', () => {
  const { rutas, paso } = recorrido('marleny');
  const r = rutas.rutas[0];
  assert.equal(r.ocupacion_id, 'reponedor');
  assert.equal(`${r.tiene.length} de ${r.tiene.length + r.faltan.length}`, '5 de 7');
  assert.equal(paso.principal.tipo, 'capacitate');
  assert.equal(paso.principal.curso?.id, 'c_almacen');
});

test('Solo rutas operativas, distintas a la actual, máximo 3', () => {
  const { rutas } = recorrido('rosa');
  assert.ok(rutas.rutas.length <= 3);
  assert.ok(rutas.rutas.every((r) => r.ocupacion_id !== 'cajero'));
});

test('Sin evidencia suficiente: recomienda un asesor', () => {
  const paso = calcularPrimerPaso(datos, {
    ocupacion_id: 'auxiliar_administrativo',
    competencias_ids: ['cua_puntualidad'],
    perfil: 'sin_empleo',
    horas: '1-3',
    modalidad: 'igual',
    costo: 'gratis',
  });
  assert.equal(paso.principal.tipo, 'asesor');
});

test('Cobertura alta y sin empleo: postular en Empleos Perú', () => {
  const occ = datos.ocupaciones.find((o) => o.id === 'vendedor_tienda')!;
  const paso = calcularPrimerPaso(datos, {
    ocupacion_id: occ.id,
    competencias_ids: occ.requeridas.slice(0, 6),
    perfil: 'sin_empleo',
    horas: '1-3',
    modalidad: 'igual',
    costo: 'gratis',
  });
  assert.equal(paso.principal.tipo, 'empleos');
});
