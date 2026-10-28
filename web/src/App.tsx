import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Datos } from '@shared/tipos';
import { iniciar, type Salud } from './api';
import {
  Ctx,
  escribirProgreso,
  estadoInicial,
  leerCompartido,
  leerProgreso,
  type Contexto,
  type Estado,
  type Pantalla,
} from './estado';
import { Encabezado } from './componentes/comunes';
import { Inicio } from './pantallas/Inicio';
import { Situacion, Ocupacion } from './pantallas/Situacion';
import { Pregunta, Armando, Intereses, Puente } from './pantallas/Preguntas';
import { Panal } from './pantallas/Panal';
import { Rutas } from './pantallas/Rutas';
import { Paso } from './pantallas/Paso';
import { Resumen, Compartido } from './pantallas/Resumen';
import { CuentaPantalla } from './pantallas/Cuenta';
import { Banco } from './pantallas/Banco';
import { actualizarCuenta } from './cuenta';

function estadoAlAbrir(regionId: string): Estado {
  // 1) Alguien abrió un panal compartido por enlace.
  const compartido = leerCompartido(location.hash);
  if (compartido) return { ...estadoInicial(regionId), compartido, lugar: { pantalla: 'compartido', pregunta: 0 } };
  // 2) La persona guardó su progreso en este celular: vuelve al inicio con "Continuar".
  const guardado = leerProgreso();
  if (guardado) return { ...guardado, historial: [...guardado.historial, guardado.lugar], lugar: { pantalla: 'inicio', pregunta: 0 } };
  return estadoInicial(regionId);
}

export function App() {
  const [base, setBase] = useState<{ datos: Datos; salud: Salud } | null>(null);
  const [estado, setEstado] = useState<Estado | null>(null);

  useEffect(() => {
    iniciar().then((b) => {
      setBase(b);
      setEstado(estadoAlAbrir(b.datos.regiones[0]?.id ?? ''));
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [estado?.lugar.pantalla, estado?.lugar.pregunta]);

  // Solo se guarda si la persona lo pidió, y solo en este celular.
  useEffect(() => {
    if (estado) escribirProgreso(estado);
    // Con cuenta, el avance también se guarda dentro de ella.
    if (estado?.cuenta) actualizarCuenta(estado.cuenta, estado);
  }, [estado]);

  const cambiar = useCallback((parcial: Partial<Estado>) => setEstado((e) => (e ? { ...e, ...parcial } : e)), []);

  const ir = useCallback(
    (pantalla: Pantalla, pregunta = 0) =>
      setEstado((e) => (e ? { ...e, historial: [...e.historial, e.lugar], lugar: { pantalla, pregunta } } : e)),
    [],
  );

  const atras = useCallback(
    () =>
      setEstado((e) => {
        if (!e || e.historial.length === 0) return e;
        // "Armando…" es una pantalla de paso: al volver, la saltamos.
        const historial = [...e.historial];
        let lugar = historial.pop()!;
        while (lugar.pantalla === 'armando' && historial.length) lugar = historial.pop()!;
        return { ...e, historial, lugar };
      }),
    [],
  );

  const reiniciar = useCallback(() => {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    setEstado((e) => (e ? estadoInicial(e.regionId) : e));
  }, []);

  const ctx = useMemo<Contexto | null>(() => {
    if (!base || !estado) return null;
    const indice = new Map(base.datos.competencias.map((c) => [c.id, c]));
    return { ...base, estado, cambiar, ir, atras, reiniciar, comp: (id) => indice.get(id) };
  }, [base, estado, cambiar, ir, atras, reiniciar]);

  if (!ctx) {
    return (
      <div className="cargando">
        <div className="cargando__hex" />
      </div>
    );
  }

  const p = ctx.estado.lugar.pantalla;
  return (
    <Ctx.Provider value={ctx}>
      <div className="app">
        {!['inicio', 'compartido', 'resumen', 'cuenta', 'banco'].includes(p) && <Encabezado />}
        {p === 'inicio' && <Inicio />}
        {p === 'situacion' && <Situacion />}
        {p === 'ocupacion' && <Ocupacion />}
        {p === 'pregunta' && <Pregunta key={ctx.estado.lugar.pregunta} />}
        {p === 'intereses' && <Intereses key={ctx.estado.lugar.pregunta} />}
        {p === 'armando' && <Armando />}
        {p === 'puente' && <Puente />}
        {p === 'panal' && <Panal />}
        {p === 'rutas' && <Rutas />}
        {p === 'paso' && <Paso />}
        {p === 'resumen' && <Resumen />}
        {p === 'compartido' && <Compartido />}
        {p === 'cuenta' && <CuentaPantalla key={ctx.estado.lugar.pregunta} />}
        {p === 'banco' && <Banco />}
      </div>
    </Ctx.Provider>
  );
}
