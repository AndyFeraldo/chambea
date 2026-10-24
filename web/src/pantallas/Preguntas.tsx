import { useEffect, useRef } from 'react';
import { extraer } from '../api';
import { t, textos } from '../i18n';
import { NUM_PREGUNTAS, useApp } from '../estado';
import { Icono, Pantalla } from '../componentes/comunes';

export function Pregunta() {
  const { estado, cambiar, ir } = useApp();
  const n = estado.lugar.pregunta;
  const pregunta = textos.preguntas.lista[n];
  const valor = estado.respuestas[n] ?? '';

  const escribir = (texto: string) => {
    const respuestas = [...estado.respuestas];
    respuestas[n] = texto;
    cambiar({ respuestas });
  };

  const seguir = () => (n + 1 < NUM_PREGUNTAS ? ir('pregunta', n + 1) : ir('armando'));

  return (
    <Pantalla>
      <p className="contador">{t('preguntas.contador', { n: n + 1, total: NUM_PREGUNTAS })}</p>
      <label htmlFor={`respuesta-${n}`} className="burbuja">
        {pregunta.texto}
      </label>
      <textarea
        id={`respuesta-${n}`}
        className="caja-texto"
        placeholder={pregunta.ejemplo}
        value={valor}
        onChange={(e) => escribir(e.target.value)}
        aria-label={t('preguntas.etiqueta')}
      />
      <div className="voz">
        <button type="button" className="voz__boton" disabled aria-label={t('preguntas.voz')}>
          <Icono nombre="micro" />
        </button>
        <span>{t('preguntas.voz')}</span>
      </div>
      <div className="empuje" />
      <div className="pila">
        <button type="button" className="boton boton--primario" onClick={seguir} disabled={!valor.trim()}>
          {t('comun.siguiente')}
        </button>
        <button
          type="button"
          className="boton boton--fantasma"
          onClick={() => {
            escribir('');
            seguir();
          }}
        >
          {t('comun.saltar')}
        </button>
      </div>
    </Pantalla>
  );
}

/** Pantalla breve mientras se extraen las competencias (mock o QVAC). */
export function Armando() {
  const { datos, estado, cambiar, ir } = useApp();
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;
    const minimo = new Promise((r) => setTimeout(r, 900));
    Promise.all([extraer(datos, estado.respuestas), minimo]).then(([detectadas]) => {
      // Conserva lo que la persona ya había confirmado o agregado.
      const previas = new Map(estado.celdas.map((c) => [c.id, c]));
      const celdas = detectadas.map((d) => ({ ...d, confirmada: previas.get(d.id)?.confirmada ?? false }));
      for (const c of estado.celdas) if (c.confirmada && !celdas.some((x) => x.id === c.id)) celdas.push(c);
      cambiar({ celdas, rutas: null, rutaElegida: null, primerPaso: null });
      ir('panal');
    });
  }, [datos, estado.respuestas, estado.celdas, cambiar, ir]);

  return (
    <div className="cargando" role="status">
      <div className="cargando__hex" />
      <h2>{t('preguntas.armando')}</h2>
    </div>
  );
}
