import { useCallback, useState, type CSSProperties } from 'react';
import type { Competencia, Dimension } from '@shared/tipos';
import { rutas as pedirRutas } from '../api';
import { t } from '../i18n';
import { etiquetaHex, ORDEN_DIMENSIONES, useApp, type Celda } from '../estado';
import { Hoja, Icono, Pantalla } from '../componentes/comunes';
import { AbejaVestida } from '../componentes/AbejaVestida';

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

export interface CeldaVisual {
  id: string;
  dimension: Dimension;
  confirmada?: boolean;
  falta?: boolean;
}

/** Colmena de hexágonos que brotan uno por uno. */
export function Colmena({
  celdas,
  alTocar,
  alTocarFalta,
  alAgregar,
  chica = false,
}: {
  celdas: CeldaVisual[];
  alTocar?: (id: string) => void;
  /** Para las celdas que faltan (en Rutas): "¿ya sabes hacer esto?". */
  alTocarFalta?: (id: string) => void;
  alAgregar?: () => void;
  chica?: boolean;
}) {
  const { comp } = useApp();
  return (
    <div className={`colmena ${chica ? 'colmena--chica' : ''}`}>
      {celdas.map((c, i) => {
        const clase = `hex ${c.falta ? 'hex--falta' : `hex--${c.dimension}`} ${c.confirmada ? 'hex--confirmada' : ''}`;
        const contenido = (
          <>
            {c.confirmada && (
              <span className="hex__check">
                <Icono nombre="check" tam={14} grosor={3} />
              </span>
            )}
            <span className="hex__texto">{etiquetaHex(comp(c.id))}</span>
            {c.falta && <span className="hex__falta">({t('rutas.falta')})</span>}
          </>
        );
        const estilo = { '--i': i } as CSSProperties;
        const accion = c.falta ? alTocarFalta : alTocar;
        return accion ? (
          <button key={c.id} type="button" className={clase} style={estilo} onClick={() => accion(c.id)} aria-label={comp(c.id)?.nombre_corto}>
            {contenido}
          </button>
        ) : (
          <span key={c.id} className={clase} style={estilo}>
            {contenido}
          </span>
        );
      })}
      {alAgregar && (
        <button type="button" className="hex hex--agregar" style={{ '--i': celdas.length } as CSSProperties} onClick={alAgregar}>
          <Icono nombre="mas" tam={26} />
          <span className="hex__texto">{t('panal.agregar')}</span>
        </button>
      )}
    </div>
  );
}

export function ordenar<T extends { dimension: Dimension }>(celdas: T[]): T[] {
  return [...celdas].sort((a, b) => ORDEN_DIMENSIONES.indexOf(a.dimension) - ORDEN_DIMENSIONES.indexOf(b.dimension));
}

/** Fila para agregar una habilidad: nombre claro + qué significa. */
function ItemHabilidad({ c, alAgregar }: { c: Competencia; alAgregar: () => void }) {
  return (
    <button type="button" className="catalogo__item" onClick={alAgregar}>
      <span className="catalogo__marca" style={{ background: COLOR_DIM[c.dimension] }} />
      <span className="catalogo__textos">
        <b>{c.nombre_corto ?? c.nombre_simple}</b>
        <small>{c.nombre_simple}</small>
      </span>
      <Icono nombre="mas" tam={20} />
    </button>
  );
}

export function Panal() {
  const { datos, estado, cambiar, ir, comp } = useApp();
  const [abierta, setAbierta] = useState<string | null>(null);
  const [agregando, setAgregando] = useState(false);
  const [objetivo, setObjetivo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const celdas = estado.celdas;
  const cerrar = useCallback(() => {
    setAbierta(null);
    setAgregando(false);
  }, []);

  const guardar = (nuevas: Celda[]) => cambiar({ celdas: nuevas, rutas: null, rutaElegida: null, primerPaso: null });
  const agregar = (c: Competencia) => guardar([...celdas, { id: c.id, dimension: c.dimension, evidencia: null, confirmada: true }]);

  const verRutas = async () => {
    setCargando(true);
    // Seguir con "Sí, ese es mi panal" confirma todas las celdas.
    const confirmadas = celdas.map((c) => ({ ...c, confirmada: true }));
    const r = await pedirRutas(datos, {
      competencias_ids: confirmadas.map((c) => c.id),
      region_id: estado.regionId,
      perfil: estado.perfil ?? 'sin_empleo',
      ocupacion_actual: estado.ocupacionActual,
      intereses: estado.intereses,
      evitar: estado.evitar,
    });
    setCargando(false);
    cambiar({ celdas: confirmadas, rutas: r });
    ir('rutas');
  };

  const celda = celdas.find((c) => c.id === abierta);
  const info = celda ? comp(celda.id) : undefined;
  const tiene = new Set(celdas.map((c) => c.id));
  const faltantes = datos.competencias.filter((c) => !tiene.has(c.id));
  const ocupObjetivo = datos.ocupaciones.find((o) => o.id === objetivo);
  const faltanParaObjetivo = (ocupObjetivo?.requeridas ?? []).filter((id) => !tiene.has(id)).map((id) => comp(id)!).filter(Boolean);

  return (
    <Pantalla>
      <div className="titulo-con-dato">
        <h1>{t('panal.titulo')}</h1>
        {celdas.length > 0 && <span className="contador-celdas">{t('panal.celdas', { n: celdas.length })}</span>}
      </div>
      <p className="ayuda">{celdas.length ? t('panal.ayuda') : t('panal.vacio')}</p>
      <Leyenda />

      <Colmena celdas={ordenar(celdas)} alTocar={setAbierta} alAgregar={() => setAgregando(true)} />

      <button type="button" className="boton boton--secundario" onClick={() => setAgregando(true)}>
        <Icono nombre="mas" /> {t('panal.agregarMas')}
      </button>

      <div className="empuje" />
      <div className="barra-fija">
        <button type="button" className="boton boton--primario boton--grande" disabled={celdas.length === 0 || cargando} onClick={verRutas}>
          <Icono nombre="check" /> {t('panal.seguir')}
        </button>
      </div>

      <Hoja abierta={!!celda} alCerrar={cerrar} titulo={info?.nombre_corto ?? ''}>
        {celda && (
          <div className="detalle-celda">
            <span className={`detalle-celda__hex hex--${celda.dimension}`} />
            <span className="etiqueta">{t(`panal.dimension.${celda.dimension}`)}</span>
            <h2>{info?.nombre_corto ?? info?.nombre_simple}</h2>
            <p className="ayuda">{info?.nombre_simple}</p>
            {celda.tarea && (
              <p className="viene-de">
                <Icono nombre="hexagono" tam={18} /> {t('panal.vieneDe')} <b>{celda.tarea}</b>
              </p>
            )}
            {celda.oficio && (
              <p className="viene-de">
                <Icono nombre="maletin" tam={18} /> {t('panal.deTuOficio')} <b>{celda.oficio}</b>
              </p>
            )}
            {celda.puente && (
              <p className="viene-de">
                <Icono nombre="check" tam={18} /> {t('panal.dePuente')}
              </p>
            )}
            {celda.evidencia && (
              <p className="evidencia">
                <b>{t('panal.loDemuestra')}</b> «{celda.evidencia}»
              </p>
            )}
            <div className="fila-botones">
              <button
                type="button"
                className="boton boton--secundario"
                onClick={() => {
                  guardar(celdas.filter((c) => c.id !== celda.id));
                  cerrar();
                }}
              >
                {t('panal.quitar')}
              </button>
              <button
                type="button"
                className="boton boton--primario"
                onClick={() => {
                  guardar(celdas.map((c) => (c.id === celda.id ? { ...c, confirmada: true } : c)));
                  cerrar();
                }}
              >
                <Icono nombre="check" /> {t('panal.confirmar')}
              </button>
            </div>
          </div>
        )}
      </Hoja>

      <Hoja abierta={agregando} alCerrar={cerrar} titulo={t('panal.agregarTitulo')}>
        <h2>{t('panal.agregarTitulo')}</h2>

        <section className="pila-chica">
          <span className="etiqueta">{t('panal.acercarte')}</span>
          <div className="objetivos">
            {datos.ocupaciones
              .filter((o) => o.id !== estado.ocupacionActual)
              .map((o) => (
                <button key={o.id} type="button" className="objetivo" aria-pressed={objetivo === o.id} onClick={() => setObjetivo(objetivo === o.id ? null : o.id)}>
                  <AbejaVestida ocupacion={o.id} tam={44} />
                  <span>{o.nombre}</span>
                </button>
              ))}
          </div>
          {ocupObjetivo && (
            <div className="catalogo__grupo aparecer">
              <p className="ayuda">
                {faltanParaObjetivo.length === 0
                  ? t('panal.yaTodo', { ocupacion: ocupObjetivo.nombre })
                  : t('panal.paraSer', { ocupacion: ocupObjetivo.nombre })}
              </p>
              {faltanParaObjetivo.map((c) => (
                <ItemHabilidad key={c.id} c={c} alAgregar={() => agregar(c)} />
              ))}
            </div>
          )}
        </section>

        <section className="catalogo">
          <span className="etiqueta">{t('panal.todas')}</span>
          {ORDEN_DIMENSIONES.map((d) => {
            const lista = faltantes.filter((c) => c.dimension === d);
            if (lista.length === 0) return null;
            return (
              <div key={d} className="catalogo__grupo">
                <span className="catalogo__dim">{t(`panal.dimensiones.${d}`)}</span>
                {lista.map((c) => (
                  <ItemHabilidad key={c.id} c={c} alAgregar={() => agregar(c)} />
                ))}
              </div>
            );
          })}
        </section>
      </Hoja>
    </Pantalla>
  );
}
