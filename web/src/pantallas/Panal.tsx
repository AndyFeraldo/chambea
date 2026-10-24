import { useState } from 'react';
import { rutas as pedirRutas } from '../api';
import { t } from '../i18n';
import { etiquetaHex, ORDEN_DIMENSIONES, useApp, type Celda } from '../estado';
import { Icono, NotaIlustrativa, Pantalla } from '../componentes/comunes';

export const COLOR_DIM = {
  conocimiento: 'var(--dim-sabe)',
  habilidad: 'var(--dim-hace)',
  cualidad: 'var(--dim-es)',
  competencia: 'var(--dim-logra)',
} as const;

export function Leyenda() {
  return (
    <div className="leyenda">
      {ORDEN_DIMENSIONES.map((d) => (
        <span key={d}>
          <i style={{ background: COLOR_DIM[d] }} />
          {t(`panal.dimensiones.${d}`)}
        </span>
      ))}
    </div>
  );
}

export function Colmena({ celdas, alTocar }: { celdas: Celda[]; alTocar?: (id: string) => void }) {
  const { comp } = useApp();
  const ordenadas = [...celdas].sort(
    (a, b) => ORDEN_DIMENSIONES.indexOf(a.dimension) - ORDEN_DIMENSIONES.indexOf(b.dimension),
  );
  return (
    <div className="colmena" aria-hidden={!alTocar}>
      {ordenadas.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`hex hex--${c.dimension}`}
          onClick={() => alTocar?.(c.id)}
          tabIndex={alTocar ? 0 : -1}
          aria-label={comp(c.id)?.nombre_simple}
        >
          {c.confirmada && <span className="hex__check">✓</span>}
          {etiquetaHex(comp(c.id))}
        </button>
      ))}
    </div>
  );
}

export function Panal() {
  const { datos, estado, cambiar, ir, comp } = useApp();
  const [agregando, setAgregando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const celdas = estado.celdas;

  const actualizar = (id: string, cambio: Partial<Celda> | null) =>
    cambiar({
      celdas: cambio === null ? celdas.filter((c) => c.id !== id) : celdas.map((c) => (c.id === id ? { ...c, ...cambio } : c)),
      rutas: null,
      rutaElegida: null,
      primerPaso: null,
    });

  const agregar = (id: string) => {
    const c = comp(id);
    if (!c) return;
    cambiar({
      celdas: [...celdas, { id, dimension: c.dimension, evidencia: null, confirmada: true }],
      rutas: null,
      rutaElegida: null,
      primerPaso: null,
    });
  };

  const verRutas = async () => {
    setCargando(true);
    const r = await pedirRutas(datos, {
      competencias_ids: celdas.map((c) => c.id),
      region_id: estado.regionId,
      perfil: estado.perfil ?? 'sin_empleo',
      ocupacion_actual: estado.ocupacionActual,
    });
    setCargando(false);
    cambiar({ rutas: r });
    ir('rutas');
  };

  const irACelda = (id: string) =>
    document.getElementById(`celda-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const faltantes = datos.competencias.filter((c) => !celdas.some((x) => x.id === c.id));
  const ordenadas = [...celdas].sort(
    (a, b) => ORDEN_DIMENSIONES.indexOf(a.dimension) - ORDEN_DIMENSIONES.indexOf(b.dimension),
  );

  return (
    <Pantalla>
      <div className="pila-chica">
        <h1>{t('panal.titulo')}</h1>
        <p className="ayuda">{t('panal.ayuda')}</p>
      </div>
      <Leyenda />

      {celdas.length > 0 ? (
        <>
          <Colmena celdas={celdas} alTocar={irACelda} />
          <p className="ayuda">{t('panal.celdas', { n: celdas.length })}</p>
        </>
      ) : (
        <p className="aviso-cert">{t('panal.vacio')}</p>
      )}

      {celdas.some((c) => !c.confirmada) && (
        <button
          type="button"
          className="boton boton--secundario"
          onClick={() =>
            cambiar({ celdas: celdas.map((c) => ({ ...c, confirmada: true })), rutas: null, rutaElegida: null, primerPaso: null })
          }
        >
          ✓ {t('panal.confirmarTodo')}
        </button>
      )}

      <div className="celdas">
        {ordenadas.map((c) => {
          const info = comp(c.id);
          return (
            <article key={c.id} id={`celda-${c.id}`} className={`celda ${c.confirmada ? 'celda--confirmada' : ''}`}>
              <div className="celda__cabeza">
                <span className="celda__marca" style={{ background: COLOR_DIM[c.dimension] }} />
                <div className="pila-chica" style={{ gap: 2 }}>
                  <span className="celda__dim">{t(`panal.dimensiones.${c.dimension}`)}</span>
                  <span className="celda__nombre">{info?.nombre_simple}</span>
                </div>
              </div>
              {c.evidencia && (
                <p className="evidencia">
                  <b>{t('panal.loDemuestra')}</b> «{c.evidencia}»
                </p>
              )}
              <div className="celda__acciones">
                <button
                  type="button"
                  className={`boton ${c.confirmada ? 'boton--secundario' : 'boton--primario'}`}
                  aria-pressed={c.confirmada}
                  onClick={() => actualizar(c.id, { confirmada: !c.confirmada })}
                >
                  {c.confirmada ? `✓ ${t('panal.confirmado')}` : t('panal.confirmar')}
                </button>
                <button type="button" className="boton boton--secundario" onClick={() => actualizar(c.id, null)}>
                  {t('panal.quitar')}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {agregando ? (
        <section className="catalogo" aria-label={t('panal.agregarTitulo')}>
          <h3>{t('panal.agregarTitulo')}</h3>
          {ORDEN_DIMENSIONES.map((d) => {
            const lista = faltantes.filter((c) => c.dimension === d);
            if (lista.length === 0) return null;
            return (
              <div key={d} className="catalogo__grupo">
                <span className="celda__dim">{t(`panal.dimensiones.${d}`)}</span>
                {lista.map((c) => (
                  <button key={c.id} type="button" className="catalogo__item" onClick={() => agregar(c.id)}>
                    <Icono nombre="mas" tam={20} />
                    {c.nombre_simple}
                  </button>
                ))}
              </div>
            );
          })}
          <button type="button" className="boton boton--secundario" onClick={() => setAgregando(false)}>
            {t('panal.agregarCerrar')}
          </button>
        </section>
      ) : (
        <button type="button" className="boton boton--secundario" onClick={() => setAgregando(true)}>
          <Icono nombre="mas" /> {t('panal.agregar')}
        </button>
      )}

      <NotaIlustrativa />
      <div className="barra-fija">
        <button type="button" className="boton boton--primario" disabled={celdas.length === 0 || cargando} onClick={verRutas}>
          {t('panal.verRutas')}
        </button>
      </div>
    </Pantalla>
  );
}
