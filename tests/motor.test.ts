// Pruebas del motor con los 2 casos SIMULADOS de data/casos-demo.json.
// Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cargarDatos } from '../server/src/datos';
import { completarConOficios, extraerPorPalabrasClave } from '../shared/src/extraccion';
import { calcularPrimerPaso, calcularRutas } from '../shared/src/motor';

const datos = cargarDatos();

function recorrido(casoId: string, horas: '1-3' | '4-6' | '7+' = '1-3') {
  const caso = datos.casos.find((c) => c.id === casoId)!;
  const comps = completarConOficios(
    datos.competencias,
    datos.ocupaciones,
    extraerPorPalabrasClave(datos.competencias, caso.respuestas, datos.tareas),
    caso.respuestas,
    caso.ocupacion_actual,
  );
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
  assert.match(paso.porque, /solo te falta Técnicas de venta/);
  assert.equal(paso.alternativas.length, 2);
  const honestidad = comps.find((c) => c.id === 'cua_honestidad');
  assert.match(honestidad!.evidencia!, /cerrar la caja sola/);
});

test('Marleny: conserje y reponedor/a, ambos 5 de 7; para reponedor/a, curso de almacén', () => {
  const caso = datos.casos.find((c) => c.id === 'marleny')!;
  const { rutas, ids } = recorrido('marleny');
  // Al sumar lo típico de su oficio (limpieza), Conserje queda primero.
  assert.deepEqual(rutas.rutas.slice(0, 2).map((r) => r.ocupacion_id), ['conserje', 'reponedor']);
  const rep = rutas.rutas[1];
  assert.equal(`${rep.tiene.length} de ${rep.tiene.length + rep.faltan.length}`, '5 de 7');
  const paso = calcularPrimerPaso(datos, { ocupacion_id: 'reponedor', competencias_ids: ids, perfil: caso.perfil, horas: '1-3', modalidad: 'celular', costo: 'gratis' });
  assert.equal(paso.principal.curso?.id, 'c_almacen');
});

test('Solo rutas operativas, distintas a la actual, máximo 5', () => {
  const { rutas } = recorrido('rosa');
  assert.ok(rutas.rutas.length <= 5);
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

// Lámina del workshop "Descubriendo el valor de cada tarea".
const extraer = (texto: string) =>
  extraerPorPalabrasClave(datos.competencias, [texto], datos.tareas).map((c) => c.id);

test('Cada tarea revela habilidades transferibles (lámina del workshop)', () => {
  const casos: [string, string[]][] = [
    ['Limpio oficinas en San Isidro.', ['cua_orden', 'cua_cumple_protocolos', 'hab_limpieza_tecnica']],
    ['Cobro en la caja de una farmacia.', ['cua_precision', 'con_manejo_dinero', 'hab_atencion_cliente']],
    ['Cocino en un restaurante de menú.', ['hab_organizacion_tiempos', 'con_higiene_alimentos', 'cua_trabajo_presion']],
    ['Vendo en una tienda de ropa.', ['hab_comunicacion', 'hab_identifica_necesidades', 'hab_atencion_cliente']],
  ];
  for (const [texto, esperadas] of casos) {
    const ids = extraer(texto);
    for (const e of esperadas) assert.ok(ids.includes(e), `${texto} debería revelar ${e}`);
  }
});

test('La competencia deducida guarda de qué tarea viene', () => {
  const c = extraerPorPalabrasClave(datos.competencias, ['Cobro en la caja.'], datos.tareas).find((x) => x.id === 'cua_precision');
  assert.equal(c?.tarea, 'Cobrar en caja');
});

test('Oficios distintos llevan a rutas distintas (no siempre limpieza)', () => {
  const primera = (texto: string, actual: string | null = null) =>
    calcularRutas(datos, { competencias_ids: extraer(texto), region_id: 'lima-metropolitana', perfil: 'sin_empleo', ocupacion_actual: actual })
      .rutas.map((r) => r.ocupacion_id);
  assert.ok(primera('Cocino menú para 50 personas, todo a la hora, con mucha presión. Lavo las verduras con higiene.').includes('ayudante_cocina'));
  assert.ok(primera('Hago delivery en moto, entrego los pedidos a tiempo y cobro en efectivo.').includes('repartidor'));
  assert.ok(primera('Cuido a mi abuelita y a niños del barrio, les cocino y soy paciente.').includes('cuidador'));
  const vendedor = primera('Vendo celulares, le ofrezco al cliente lo que necesita y le explico.');
  assert.ok(!vendedor.slice(0, 2).includes('limpieza'), `vendedor no debería ir a limpieza: ${vendedor}`);
});

test('"Soy almacenero": el panal suma las habilidades típicas del oficio', () => {
  const texto = ['Soy almacenero hace 5 años.'];
  const comps = completarConOficios(datos.competencias, datos.ocupaciones, extraerPorPalabrasClave(datos.competencias, texto, datos.tareas), texto, null);
  const ids = comps.map((c) => c.id);
  for (const e of ['cua_orden', 'hab_inventario', 'hab_carga_descarga', 'hab_registro_datos', 'cua_resistencia']) assert.ok(ids.includes(e), `falta ${e}`);
  assert.equal(comps.find((c) => c.id === 'cua_orden')?.oficio, 'Auxiliar de almacén');
  assert.equal(datos.competencias.find((c) => c.id === 'cua_orden')?.nombre_corto, 'Organización y orden');
});

test('El oficio elegido también suma sus habilidades, sin repetir', () => {
  const comps = completarConOficios(datos.competencias, datos.ocupaciones, [], [], 'mozo');
  assert.equal(new Set(comps.map((c) => c.id)).size, comps.length);
  assert.ok(comps.some((c) => c.id === 'hab_servicio_mesa'));
});

test('"Cuento las cajas" (de mercadería) no es cobrar en caja', () => {
  const ids = extraer('Recibo la mercadería y cuento las cajas.');
  assert.ok(!ids.includes('hab_cobro_caja') && !ids.includes('con_manejo_dinero'));
  assert.ok(extraer('Trabajo en la caja del mercado.').includes('hab_cobro_caja'));
});
