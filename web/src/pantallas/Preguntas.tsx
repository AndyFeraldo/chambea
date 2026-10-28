import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Datos, PreguntaEntrevista } from '@shared/tipos';
import { completarConOficios } from '@shared/extraccion';
import { calcularRutas, preguntasPuente } from '@shared/motor';
import { extraer } from '../api';
import { t } from '../i18n';
import { NUM_PREGUNTAS, useApp, type Celda, type Estado } from '../estado';
import { Abeja, BotonEscuchar, Icono, Pantalla, type NombreIcono } from '../componentes/comunes';
import { useVoz, type ErrorVoz } from '../voz';
import { COLOR_DIM } from './Panal';

const MENSAJE_ERROR: Record<Exclude<ErrorVoz, null>, string> = {
  permiso: 'preguntas.errorPermiso',
  red: 'preguntas.errorRed',
  nada: 'preguntas.errorNada',
  otro: 'preguntas.errorOtro',
};

/** Las 3 preguntas por dimensión + 1 que se adapta al oficio de la persona. */
export function preguntasDe(datos: Datos, ocupacionActual: string | null): PreguntaEntrevista[] {
  const e = datos.entrevista;
  const delOficio = ocupacionActual ? e.por_oficio[ocupacionActual] : undefined;
  return [...e.preguntas, delOficio ? { ...delOficio, apunta: t('preguntas.deTuOficio') } : e.general].slice(0, NUM_PREGUNTAS);
}

export function Pregunta() {
  const { datos, estado, cambiar, ir } = useApp();
  const n = estado.lugar.pregunta;
  const pregunta = preguntasDe(datos, estado.ocupacionActual)[n];
  const valor = estado.respuestas[n] ?? '';
  const caja = useRef<HTMLTextAreaElement>(null);

  const escribir = (texto: string) => {
    cambiar({ respuestas: estado.respuestas.map((r, i) => (i === n ? texto : r)) });
  };
  // La voz escribe sobre la respuesta de esta pregunta, aunque el estado cambie mientras habla.
  const escribirRef = useRef(escribir);
  escribirRef.current = escribir;
  const voz = useVoz((texto) => escribirRef.current(texto));
  const [teclado, setTeclado] = useState(!voz.disponible);

  useEffect(() => {
    if (voz.error === 'permiso' || voz.error === 'otro') setTeclado(true);
  }, [voz.error]);

  const seguir = () => {
    voz.detener();
    if (n + 1 < NUM_PREGUNTAS) ir('pregunta', n + 1);
    else ir('intereses', 0);
  };

  const alternarMicro = () => (voz.escuchando ? voz.detener() : voz.empezar(valor));

  return (
    <Pantalla clase="pantalla--pregunta">
      <div className="puntos" aria-label={`${n + 1} / ${NUM_PREGUNTAS}`}>
        {Array.from({ length: NUM_PREGUNTAS }, (_, i) => (
          <span key={i} className={`puntos__hex ${i < n ? 'hecho' : ''} ${i === n ? 'actual' : ''}`} />
        ))}
        {pregunta.apunta && <span className="puntos__tema">{pregunta.apunta}</span>}
      </div>

      <div className="charla">
        <Abeja tam={52} className="abeja--flota" />
        <div className="burbuja">
          <p id={`pregunta-${n}`}>{pregunta.texto}</p>
          <BotonEscuchar texto={pregunta.texto} />
        </div>
      </div>
      {pregunta.pista && <p className="pista">💡 {pregunta.pista}</p>}

      {voz.disponible && !teclado ? (
        <div className="micro">
          <button
            type="button"
            className={`micro__boton ${voz.escuchando ? 'micro__boton--activo' : ''}`}
            aria-pressed={voz.escuchando}
            aria-label={voz.escuchando ? t('preguntas.escuchando') : t('preguntas.tocaYHabla')}
            onClick={alternarMicro}
          >
            <span className="micro__onda" />
            <span className="micro__onda micro__onda--2" />
            <Icono nombre={voz.escuchando ? 'detener' : 'micro'} tam={36} />
          </button>
          <p className="micro__estado" aria-live="polite">
            {voz.escuchando ? t('preguntas.escuchando') : t('preguntas.tocaYHabla')}
          </p>
          {valor && (
            <p className="respuesta-viva" aria-live="polite">
              {valor}
            </p>
          )}
          {!valor && !voz.escuchando && <p className="ejemplo">«{pregunta.ejemplo}»</p>}
          {voz.error && <p className="error-voz">{t(MENSAJE_ERROR[voz.error])}</p>}
          <button
            type="button"
            className="enlace"
            onClick={() => {
              voz.detener();
              setTeclado(true);
              setTimeout(() => caja.current?.focus(), 50);
            }}
          >
            <Icono nombre="teclado" tam={20} /> {t('preguntas.escribir')}
          </button>
        </div>
      ) : (
        <div className="pila">
          <textarea
            ref={caja}
            id={`respuesta-${n}`}
            className="caja-texto"
            placeholder={pregunta.ejemplo}
            value={valor}
            onChange={(e) => escribir(e.target.value)}
            aria-labelledby={`pregunta-${n}`}
          />
          {voz.error && <p className="error-voz">{t(MENSAJE_ERROR[voz.error])}</p>}
          {voz.disponible && (
            <button type="button" className="enlace" onClick={() => setTeclado(false)}>
              <Icono nombre="micro" tam={20} /> {t('preguntas.hablar')}
            </button>
          )}
        </div>
      )}

      <div className="empuje" />
      <div className="fila-botones">
        <button type="button" className="boton boton--fantasma" onClick={() => (escribir(''), seguir())}>
          {t('comun.saltar')}
        </button>
        <button type="button" className="boton boton--primario" onClick={seguir} disabled={!valor.trim()}>
          {t('comun.siguiente')} <Icono nombre="adelante" />
        </button>
      </div>
    </Pantalla>
  );
}

/** Dos pantallas cortas: qué te gustaría hacer (0) y qué prefieres evitar (1). */
export function Intereses() {
  const { datos, estado, cambiar, ir } = useApp();
  const n = estado.lugar.pregunta;
  const campo: 'intereses' | 'evitar' = n === 0 ? 'intereses' : 'evitar';
  const opciones = datos.entrevista[campo];
  const elegidos = estado[campo];

  const alternar = (id: string) =>
    cambiar({ [campo]: elegidos.includes(id) ? elegidos.filter((x) => x !== id) : [...elegidos, id] } as Partial<Estado>);

  return (
    <Pantalla>
      <div className="pila-chica">
        <h1>{t(`intereses.titulo.${campo}`)}</h1>
        <p className="ayuda">{t(`intereses.ayuda.${campo}`)}</p>
      </div>
      <div className="mosaico mosaico--chips">
        {opciones.map((o, i) => (
          <button
            key={o.id}
            type="button"
            className="mosaico__item mosaico__item--chico aparecer"
            style={{ '--i': i } as CSSProperties}
            aria-pressed={elegidos.includes(o.id)}
            onClick={() => alternar(o.id)}
          >
            <span className="mosaico__hex">
              <Icono nombre={o.icono as NombreIcono} tam={26} />
            </span>
            <span>{o.texto}</span>
          </button>
        ))}
      </div>
      <div className="empuje" />
      <div className="fila-botones">
        <button type="button" className="boton boton--fantasma" onClick={() => (n === 0 ? ir('intereses', 1) : ir('armando'))}>
          {elegidos.length ? t('comun.siguiente') : t('comun.saltar')}
        </button>
        {elegidos.length > 0 && (
          <button type="button" className="boton boton--primario" onClick={() => (n === 0 ? ir('intereses', 1) : ir('armando'))}>
            {t('comun.siguiente')} <Icono nombre="adelante" />
          </button>
        )}
      </div>
    </Pantalla>
  );
}

/** Mientras se arma el panal: celdas que se llenan y abejas trabajando. */
export function Armando() {
  const { datos, estado, cambiar, ir } = useApp();
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;
    const minimo = new Promise((r) => setTimeout(r, 1800));
    Promise.all([extraer(datos, estado.respuestas), minimo]).then(([delRelato]) => {
      // Lo que contó + lo típico de su oficio (el que eligió o el que mencionó).
      const detectadas = completarConOficios(datos.competencias, datos.ocupaciones, delRelato, estado.respuestas, estado.ocupacionActual);
      // Conserva lo que la persona ya había confirmado o agregado.
      const previas = new Map(estado.celdas.map((c) => [c.id, c]));
      const celdas: Celda[] = detectadas.map((d) => ({ ...d, confirmada: previas.get(d.id)?.confirmada ?? false }));
      for (const c of estado.celdas) if (c.confirmada && !celdas.some((x) => x.id === c.id)) celdas.push(c);
      // Preguntas puente: lo que más la acerca a sus mejores rutas.
      const ids = celdas.map((c) => c.id);
      const r = calcularRutas(datos, {
        competencias_ids: ids,
        region_id: estado.regionId,
        perfil: estado.perfil ?? 'sin_empleo',
        ocupacion_actual: estado.ocupacionActual,
        intereses: estado.intereses,
        evitar: estado.evitar,
      });
      const puente = preguntasPuente(datos, ids, r.rutas);
      cambiar({ celdas, puente, rutas: null, rutaElegida: null, primerPaso: null });
      ir(puente.length ? 'puente' : 'panal');
    });
  }, [datos, estado, cambiar, ir]);

  return (
    <div className="armando entrar" role="status">
      <div className="armando__panal">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className="armando__hex" style={{ '--i': i } as CSSProperties} />
        ))}
        <Abeja tam={44} className="armando__abeja" />
        <Abeja tam={32} className="armando__abeja armando__abeja--2" />
      </div>
      <h2>{t('preguntas.armando')}</h2>
    </div>
  );
}

/** "¿También sabes...?": la IA pregunta lo que más te acerca a otra profesión. */
export function Puente() {
  const { estado, cambiar, ir, comp } = useApp();
  const [respuestas, setRespuestas] = useState<Record<string, boolean>>({});
  const pendientes = estado.puente.filter((id) => !(id in respuestas));

  const responder = (id: string, si: boolean) => setRespuestas({ ...respuestas, [id]: si });

  const terminar = () => {
    const nuevas: Celda[] = estado.puente
      .filter((id) => respuestas[id])
      .map((id) => ({ id, dimension: comp(id)!.dimension, evidencia: null, puente: true, confirmada: true }));
    cambiar({ celdas: [...estado.celdas.filter((c) => !respuestas[c.id]), ...nuevas] });
    ir('panal');
  };

  return (
    <Pantalla>
      <div className="charla">
        <Abeja tam={52} className="abeja--flota" />
        <div className="burbuja">
          <p>{t('puente.titulo')}</p>
        </div>
      </div>
      <p className="ayuda">{t('puente.ayuda')}</p>

      <div className="pila">
        {estado.puente.map((id, i) => {
          const c = comp(id);
          if (!c) return null;
          const r = respuestas[id];
          return (
            <article key={id} className={`puente aparecer ${r === true ? 'puente--si' : r === false ? 'puente--no' : ''}`} style={{ '--i': i } as CSSProperties}>
              <span className="catalogo__marca" style={{ background: COLOR_DIM[c.dimension] }} />
              <div className="puente__textos">
                <b>{c.nombre_corto ?? c.nombre_simple}</b>
                <small>{c.nombre_simple}</small>
              </div>
              <div className="puente__botones">
                <button type="button" className="chip" aria-pressed={r === true} onClick={() => responder(id, true)}>
                  {t('puente.si')}
                </button>
                <button type="button" className="chip" aria-pressed={r === false} onClick={() => responder(id, false)}>
                  {t('puente.no')}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="empuje" />
      <button type="button" className="boton boton--primario boton--grande" onClick={terminar}>
        {pendientes.length ? t('puente.saltar') : t('puente.verPanal')} <Icono nombre="adelante" />
      </button>
    </Pantalla>
  );
}
