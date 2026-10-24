import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { completarConOficios } from '@shared/extraccion';
import { extraer } from '../api';
import { t, textos } from '../i18n';
import { NUM_PREGUNTAS, useApp } from '../estado';
import { Abeja, Icono, Pantalla } from '../componentes/comunes';
import { useVoz, type ErrorVoz } from '../voz';

const MENSAJE_ERROR: Record<Exclude<ErrorVoz, null>, string> = {
  permiso: 'preguntas.errorPermiso',
  red: 'preguntas.errorRed',
  nada: 'preguntas.errorNada',
  otro: 'preguntas.errorOtro',
};

export function Pregunta() {
  const { estado, cambiar, ir } = useApp();
  const n = estado.lugar.pregunta;
  const pregunta = textos.preguntas.lista[n];
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
    else ir('armando');
  };

  const alternarMicro = () => (voz.escuchando ? voz.detener() : voz.empezar(valor));

  return (
    <Pantalla clase="pantalla--pregunta">
      <div className="puntos" aria-label={`${n + 1} / ${NUM_PREGUNTAS}`}>
        {Array.from({ length: NUM_PREGUNTAS }, (_, i) => (
          <span key={i} className={`puntos__hex ${i < n ? 'hecho' : ''} ${i === n ? 'actual' : ''}`} />
        ))}
      </div>

      <div className="charla">
        <Abeja tam={52} className="abeja--flota" />
        <p className="burbuja" id={`pregunta-${n}`}>
          {pregunta.texto}
        </p>
      </div>

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
      const celdas = detectadas.map((d) => ({ ...d, confirmada: previas.get(d.id)?.confirmada ?? false }));
      for (const c of estado.celdas) if (c.confirmada && !celdas.some((x) => x.id === c.id)) celdas.push(c);
      cambiar({ celdas, rutas: null, rutaElegida: null, primerPaso: null });
      ir('panal');
    });
  }, [datos, estado.respuestas, estado.celdas, estado.ocupacionActual, cambiar, ir]);

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
