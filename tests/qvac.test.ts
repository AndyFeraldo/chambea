// Pruebas del validador de QvacProvider (sin necesidad de un servidor QVAC).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cargarDatos } from '../server/src/datos';
import { parsearJson, validar } from '../server/src/ia/qvac';

const { competencias } = cargarDatos();
const textos = ['Me dejan cerrar la caja sola, nunca me falta plata.'];

test('Descarta ids fuera del catálogo y competencias sin evidencia real', () => {
  const bruto = parsearJson(
    'Claro: ```json {"competencias":[' +
      '{"id":"cua_honestidad","evidencia":"Me dejan cerrar la caja sola"},' +
      '{"id":"jefe_de_tienda","evidencia":"x"},' +
      '{"id":"hab_tecnicas_venta","evidencia":"vendo de todo"}]} ```',
  );
  const r = validar(competencias, textos, bruto);
  // hab_tecnicas_venta se descarta: la persona no dijo "vendo de todo".
  assert.deepEqual(r.map((c) => c.id), ['cua_honestidad']);
  assert.equal(r[0].evidencia, 'Me dejan cerrar la caja sola');
});

test('Falla si el modelo no devuelve JSON (y entonces se usa mock)', () => {
  assert.throws(() => parsearJson('no sé'));
});
