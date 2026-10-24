import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Datos } from '@shared/tipos';
import { iniciar, type Salud } from './api';
import { Ctx, estadoInicial, type Contexto, type Estado, type Pantalla } from './estado';
import { Encabezado } from './componentes/comunes';
import { Inicio } from './pantallas/Inicio';
import { Situacion, Ocupacion } from './pantallas/Situacion';
import { Pregunta, Armando } from './pantallas/Preguntas';
import { Panal } from './pantallas/Panal';
import { Rutas } from './pantallas/Rutas';
import { Paso } from './pantallas/Paso';
import { Resumen } from './pantallas/Resumen';

export function App() {
  const [base, setBase] = useState<{ datos: Datos; salud: Salud } | null>(null);
  const [estado, setEstado] = useState<Estado | null>(null);

  useEffect(() => {
    iniciar().then((b) => {
      setBase(b);
      setEstado(estadoInicial(b.datos.regiones[0]?.id ?? ''));
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [estado?.lugar.pantalla, estado?.lugar.pregunta]);

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
        let historial = [...e.historial];
        let lugar = historial.pop()!;
        while (lugar.pantalla === 'armando' && historial.length) lugar = historial.pop()!;
        return { ...e, historial, lugar };
      }),
    [],
  );

  const reiniciar = useCallback(
    () => setEstado((e) => (e ? estadoInicial(e.regionId) : e)),
    [],
  );

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
        {p !== 'inicio' && <Encabezado />}
        {p === 'inicio' && <Inicio />}
        {p === 'situacion' && <Situacion />}
        {p === 'ocupacion' && <Ocupacion />}
        {p === 'pregunta' && <Pregunta key={ctx.estado.lugar.pregunta} />}
        {p === 'armando' && <Armando />}
        {p === 'panal' && <Panal />}
        {p === 'rutas' && <Rutas />}
        {p === 'paso' && <Paso />}
        {p === 'resumen' && <Resumen />}
      </div>
    </Ctx.Provider>
  );
}
