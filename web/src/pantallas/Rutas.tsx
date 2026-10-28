import { useRef, useState } from 'react';
import type { Ocupacion, Ruta } from '@shared/tipos';
import { rutas as pedirRutas, type Salud } from '../api';
import { t } from '../i18n';
import { useApp } from '../estado';
import { Hoja, Icono, NotaIlustrativa, Pantalla } from '../componentes/comunes';
import { BONO_INTERES, CASTIGO_EVITAR, PESOS } from '@shared/motor';
import { AbejaVestida } from '../componentes/AbejaVestida';
import { Colmena, ordenar, type CeldaVisual } from './Panal';

function celdasDeRuta(r: Ruta, dimension: (id: string) => CeldaVisual['dimension']): CeldaVisual[] {
  // Primero lo que ya tiene, al final lo que falta (como en el flyer).
  return [
    ...ordenar(r.tiene.map((id) => ({ id, dimension: dimension(id) }))),
    ...r.faltan.map((id) => ({ id, dimension: dimension(id), falta: true })),
  ];
}

function slug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Enlaces a ofertas reales y vigentes: búsquedas en vivo por puesto. */
export function enlacesOfertas(o: Ocupacion | undefined, enlaces: Salud['enlaces']) {
  const lista: { nombre: string; url: string }[] = [];
  if (enlaces.empleos_peru) lista.push({ nombre: 'Empleos Perú', url: enlaces.empleos_peru });
  if (o?.busqueda) lista.push({ nombre: 'Computrabajo', url: `https://pe.computrabajo.com/trabajo-de-${slug(o.busqueda)}` });
  return lista;
}

type Sentido = 1 | -1;

export function Rutas() {
  const { datos, salud, estado, cambiar, ir, comp } = useApp();
  const resultado = estado.rutas;
  const rutas = resultado?.rutas ?? [];
  const inicial = Math.max(0, rutas.findIndex((r) => r.ocupacion_id === estado.rutaElegida));
  const [indice, setIndice] = useState(inicial);
  const [sentido, setSentido] = useState<Sentido>(1);
  const [saliente, setSaliente] = useState<{ id: string; sentido: Sentido; n: number } | null>(null);
  const toque = useRef<number | null>(null);
  const escena = useRef<HTMLDivElement>(null);
  const [preguntaFalta, setPreguntaFalta] = useState<string | null>(null);
  const [porQue, setPorQue] = useState(false);
  const contador = useRef(0);

  if (!resultado) return null;
  const ruta = rutas[indice];

  const mover = (s: Sentido) => {
    if (rutas.length < 2) return;
    contador.current += 1;
    setSaliente({ id: ruta.ocupacion_id, sentido: s, n: contador.current });
    setSentido(s);
    setPorQue(false);
    setIndice((indice + s + rutas.length) % rutas.length);
    // Que se vea a la abeja entrar volando.
    const arriba = (escena.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 80;
    if (window.scrollY > arriba) window.scrollTo({ top: Math.max(0, arriba), behavior: 'smooth' });
  };

  const irAlPaso = (id: string | null) => {
    cambiar({ rutaElegida: id, primerPaso: null, horas: null, modalidad: null, costo: null });
    ir('paso', 0);
  };

  // "Sí, ya sé hacerlo": se suma al panal y las rutas se recalculan sin perder la ruta que se ve.
  const agregarHabilidad = async (id: string) => {
    const c = comp(id);
    setPreguntaFalta(null);
    if (!c || !ruta) return;
    const actual = ruta.ocupacion_id;
    const celdas = [...estado.celdas, { id, dimension: c.dimension, evidencia: null, confirmada: true }];
    const r = await pedirRutas(datos, {
      competencias_ids: celdas.map((x) => x.id),
      region_id: estado.regionId,
      perfil: estado.perfil ?? 'sin_empleo',
      ocupacion_actual: estado.ocupacionActual,
      intereses: estado.intereses,
      evitar: estado.evitar,
    });
    // La ruta que estaba viendo se mantiene en el carrusel aunque cambie el orden.
    if (!r.rutas.some((x) => x.ocupacion_id === actual)) {
      const vista = rutas.find((x) => x.ocupacion_id === actual);
      if (vista) r.rutas.push({ ...vista, tiene: [...vista.tiene, id], faltan: vista.faltan.filter((f) => f !== id) });
    }
    cambiar({ celdas, rutas: r, primerPaso: null });
    setIndice(Math.max(0, r.rutas.findIndex((x) => x.ocupacion_id === actual)));
  };
  const infoFalta = preguntaFalta ? comp(preguntaFalta) : undefined;

  const ocupacion = datos.ocupaciones.find((o) => o.id === ruta?.ocupacion_id);
  const ofertas = enlacesOfertas(ocupacion, salud.enlaces);

  return (
    <Pantalla>
      <h1>{t('rutas.titulo')}</h1>

      {resultado.aviso_demanda && (
        <p className="alerta" role="alert">
          <Icono nombre="alerta" tam={20} />
          {t('rutas.avisoDemanda', { ocupacion: resultado.aviso_demanda.nombre })}
        </p>
      )}

      {!ruta ? (
        <div className="pila">
          <p className="aviso-cert">{t('rutas.ninguna')}</p>
          <button type="button" className="boton boton--primario" onClick={() => irAlPaso(null)}>
            {t('rutas.irAsesor')}
          </button>
        </div>
      ) : (
        <section
          className="carrusel"
          aria-roledescription="carrusel"
          onPointerDown={(e) => (toque.current = e.clientX)}
          onPointerUp={(e) => {
            if (toque.current === null) return;
            const dx = e.clientX - toque.current;
            toque.current = null;
            if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
          }}
        >
          <div className="escenario" aria-hidden="true" ref={escena}>
            {saliente && (
              <div
                key={`sale-${saliente.n}`}
                className={`abeja-escena ${saliente.sentido === 1 ? 'sale-izquierda' : 'sale-derecha'}`}
                onAnimationEnd={() => setSaliente(null)}
              >
                <span className="insignia insignia--grande">
                  <AbejaVestida ocupacion={saliente.id} tam={150} className={saliente.sentido === -1 ? 'mirar-derecha' : ''} />
                </span>
              </div>
            )}
            <div key={`entra-${ruta.ocupacion_id}-${contador.current}`} className={`abeja-escena ${sentido === 1 ? 'entra-derecha' : 'entra-izquierda'}`}>
              <div className="abeja-escena__flota">
                <span className="insignia insignia--grande">
                  <AbejaVestida ocupacion={ruta.ocupacion_id} tam={150} className="abeja--estela" />
                  <AbejaVestida ocupacion={ruta.ocupacion_id} tam={150} />
                </span>
              </div>
            </div>
            <span className="escenario__sombra" />
          </div>

          {rutas.length > 1 && (
            <div className="carrusel__control">
              <button type="button" className="carrusel__flecha" onClick={() => mover(-1)} aria-label={t('rutas.anterior')}>
                <Icono nombre="atras" />
              </button>
              <div className="carrusel__puntos" aria-label={t('rutas.cuenta', { n: indice + 1, total: rutas.length })}>
                {rutas.map((r, i) => (
                  <span key={r.ocupacion_id} className={`puntos__hex ${i === indice ? 'actual' : ''}`} />
                ))}
              </div>
              <button type="button" className="carrusel__flecha carrusel__flecha--siguiente" onClick={() => mover(1)} aria-label={t('rutas.siguiente')}>
                {t('rutas.siguiente')} <Icono nombre="adelante" />
              </button>
            </div>
          )}

          <div key={`tarjeta-${ruta.ocupacion_id}`} className={`ruta-hero ${sentido === 1 ? 'desliza-derecha' : 'desliza-izquierda'}`}>
            {ocupacion?.sector && <span className="ruta-hero__sector">{ocupacion.sector}</span>}
            <p className="ruta-hero__lema">
              {t('rutas.celdasPara', { x: ruta.tiene.length, y: ruta.tiene.length + ruta.faltan.length })}
            </p>
            <h2 className="ruta-hero__nombre">{ruta.nombre}</h2>
            {ocupacion?.descripcion && <p className="ruta-hero__descripcion">{ocupacion.descripcion}</p>}
            {(ruta.interes || (ruta.conflictos?.length ?? 0) > 0) && (
              <div className="ruta-hero__marcas">
                {ruta.interes && (
                  <span className="marca marca--si">
                    <Icono nombre="corazon" tam={14} /> {t('rutas.teInteresa')}
                  </span>
                )}
                {ruta.conflictos?.map((c) => (
                  <span key={c} className="marca marca--aviso">
                    <Icono nombre="alerta" tam={14} /> {t('rutas.sueleExigir', { cosa: datos.entrevista.evitar.find((e) => e.id === c)?.texto.toLowerCase() ?? c })}
                  </span>
                ))}
              </div>
            )}
            <Colmena chica celdas={celdasDeRuta(ruta, (id) => comp(id)?.dimension ?? 'habilidad')} alTocarFalta={setPreguntaFalta} />
            {ruta.faltan.length > 0 && <p className="toca-falta">{t('rutas.tocaFalta')}</p>}
            <div className="ruta-hero__datos">
              {ruta.demanda && <span className={`demanda demanda--${ruta.demanda}`}>{t(`rutas.demanda.${ruta.demanda}`)}</span>}
              {ruta.alias.length > 0 && (
                <p className="alias">
                  {t('rutas.alias')} <b>{ruta.alias.slice(0, 2).join(' · ')}</b>
                </p>
              )}
              {ruta.requisitos_minimos.length > 0 && (
                <p className="alias">
                  {t('rutas.requisitos')} {ruta.requisitos_minimos.join(' · ')}
                </p>
              )}
            </div>
            {ofertas.length > 0 && (
              <div className="ofertas">
                <span className="ofertas__titulo">{t('rutas.verOfertas')}</span>
                <div className="ofertas__enlaces">
                  {ofertas.map((o) => (
                    <a key={o.nombre} href={o.url} target="_blank" rel="noopener noreferrer" className="ofertas__enlace">
                      {o.nombre} <Icono nombre="adelante" tam={16} />
                    </a>
                  ))}
                </div>
              </div>
            )}
            <button type="button" className="por-que" aria-expanded={porQue} onClick={() => setPorQue(!porQue)}>
              <Icono nombre="hexagono" tam={16} /> {t('rutas.porQue')}
            </button>
            {porQue && (
              <div className="por-que__detalle">
                <p>{t('rutas.porQueIntro')}</p>
                <table className="por-que__tabla">
                  <tbody>
                    {[...ruta.tiene, ...ruta.faltan].map((id) => {
                      const c = comp(id);
                      const tiene = ruta.tiene.includes(id);
                      return (
                        <tr key={id} className={tiene ? '' : 'falta'}>
                          <td>{tiene ? '✓' : '○'}</td>
                          <td>{c?.nombre_corto ?? id}</td>
                          <td>{c ? t(`panal.dimensionCorta.${c.dimension}`) : ''}</td>
                          <td className="num">{c ? PESOS[c.dimension] : 1}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="por-que__formula">
                  {t('rutas.porQueFormula', { pct: Math.round(ruta.cobertura * 100) })}
                </p>
                <p className="por-que__nota">
                  {t('rutas.porQueOrden', { bono: BONO_INTERES * 100, castigo: CASTIGO_EVITAR * 100 })}
                </p>
              </div>
            )}
            <button type="button" className="boton boton--miel boton--grande" onClick={() => irAlPaso(ruta.ocupacion_id)}>
              {t('rutas.elegir')} <Icono nombre="adelante" />
            </button>
          </div>

        </section>
      )}
      <NotaIlustrativa />

      <Hoja abierta={!!infoFalta} alCerrar={() => setPreguntaFalta(null)} titulo={t('rutas.saberTitulo')}>
        {infoFalta && (
          <div className="detalle-celda">
            <span className="etiqueta">{t('rutas.saberTitulo')}</span>
            <h2>{infoFalta.nombre_corto ?? infoFalta.nombre_simple}</h2>
            <p className="ayuda">{infoFalta.nombre_simple}</p>
            <div className="fila-botones">
              <button type="button" className="boton boton--secundario" onClick={() => setPreguntaFalta(null)}>
                {t('rutas.saberNo')}
              </button>
              <button type="button" className="boton boton--primario" onClick={() => agregarHabilidad(infoFalta.id)}>
                <Icono nombre="check" /> {t('rutas.saberSi')}
              </button>
            </div>
          </div>
        )}
      </Hoja>
    </Pantalla>
  );
}
