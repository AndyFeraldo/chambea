import { useEffect, useRef, type CSSProperties } from 'react';
import type { Costo, Horas, Modalidad, OpcionPaso } from '@shared/tipos';
import { primerPaso } from '../api';
import { t, textos } from '../i18n';
import { useApp, type Estado } from '../estado';
import { AvisoCertificacion, Enjambre, Icono, NotaIlustrativa, Pantalla, type NombreIcono } from '../componentes/comunes';

const ICONO: Record<OpcionPaso['tipo'], NombreIcono> = { capacitate: 'libro', empleos: 'maletin', asesor: 'persona' };

type Campo = 'horas' | 'modalidad' | 'costo';
const OPCIONES: Record<Campo, { valor: string; icono: NombreIcono }[]> = {
  horas: [
    { valor: '1-3', icono: 'reloj' },
    { valor: '4-6', icono: 'reloj' },
    { valor: '7+', icono: 'reloj' },
  ],
  modalidad: [
    { valor: 'celular', icono: 'celular' },
    { valor: 'presencial', icono: 'edificio' },
    { valor: 'igual', icono: 'igual' },
  ],
  costo: [
    { valor: 'gratis', icono: 'regalo' },
    { valor: 'poco', icono: 'moneda' },
  ],
};
const ETIQUETAS: Record<Campo, string> = { horas: 'paso.horasOp', modalidad: 'paso.modalidadOp', costo: 'paso.costoOp' };

/** Enlace oficial configurable (TODO hasta que el equipo lo confirme). */
export function enlaceDe(tipo: OpcionPaso['tipo'], enlaces: { empleos_peru: string | null; capacitate_peru: string | null }) {
  if (tipo === 'empleos') return enlaces.empleos_peru;
  if (tipo === 'capacitate') return enlaces.capacitate_peru;
  return null;
}

function detalleCurso(o: OpcionPaso): string | null {
  if (!o.curso) return null;
  return t('paso.curso', {
    semanas: o.curso.duracion_semanas,
    horas: o.curso.horas_semana,
    modalidad: t(`paso.cursoModalidad.${o.curso.modalidad}`),
    costo: t(`paso.cursoCosto.${o.curso.costo}`),
  });
}

export function Paso() {
  const { estado } = useApp();
  return estado.lugar.pregunta < 3 ? <PreguntaPaso /> : <Resultado />;
}

function PreguntaPaso() {
  const { estado, cambiar, ir } = useApp();
  const n = estado.lugar.pregunta;
  const p = textos.paso.preguntas[n];
  const campo = p.id as Campo;
  const actual = estado[campo] as string | null;

  return (
    <Pantalla>
      <div className="puntos">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`puntos__hex ${i < n ? 'hecho' : ''} ${i === n ? 'actual' : ''}`} />
        ))}
      </div>
      <h1>{p.texto}</h1>
      <div className="tarjetas">
        {OPCIONES[campo].map((o, i) => (
          <button
            key={o.valor}
            type="button"
            className="tarjeta-opcion aparecer"
            style={{ '--i': i } as CSSProperties}
            aria-pressed={actual === o.valor}
            onClick={() => {
              cambiar({ [campo]: o.valor, primerPaso: null } as Partial<Estado>);
              ir('paso', n + 1);
            }}
          >
            <span className="tarjeta-opcion__icono">
              <Icono nombre={o.icono} tam={30} />
            </span>
            <span>{t(`${ETIQUETAS[campo]}.${o.valor}`)}</span>
          </button>
        ))}
      </div>
    </Pantalla>
  );
}

function Resultado() {
  const { datos, salud, estado, cambiar, ir } = useApp();
  const ruta = estado.rutas?.rutas.find((r) => r.ocupacion_id === estado.rutaElegida) ?? null;
  const resultado = estado.primerPaso;
  const pedido = useRef(false);

  useEffect(() => {
    if (resultado || pedido.current) return;
    pedido.current = true;
    primerPaso(datos, {
      ocupacion_id: estado.rutaElegida ?? '',
      competencias_ids: estado.celdas.map((c) => c.id),
      perfil: estado.perfil ?? 'sin_empleo',
      horas: (estado.horas ?? '1-3') as Horas,
      modalidad: (estado.modalidad ?? 'igual') as Modalidad,
      costo: (estado.costo ?? 'gratis') as Costo,
    }).then((r) => cambiar({ primerPaso: r }));
  }, [resultado, datos, estado, cambiar]);

  if (!resultado) {
    return (
      <div className="armando entrar" role="status">
        <div className="armando__panal">
          <span className="armando__hex" style={{ '--i': 0 } as CSSProperties} />
        </div>
      </div>
    );
  }

  const p = resultado.principal;
  const url = enlaceDe(p.tipo, salud.enlaces);
  return (
    <Pantalla clase="pantalla--resultado">
      <div className="pila-chica">
        <h1>{t('paso.tuPrimerPaso')}</h1>
        {ruta && <p className="etiqueta">{t('paso.ruta', { ocupacion: ruta.nombre })}</p>}
      </div>

      <section className="recomendacion revelar">
        <Enjambre cantidad={2} />
        <span className="recomendacion__icono">
          <Icono nombre={ICONO[p.tipo]} tam={34} />
        </span>
        <h2 className="recomendacion__titulo">{p.titulo}</h2>
        <p className="recomendacion__detalle">{p.detalle}</p>
        {detalleCurso(p) && <p className="recomendacion__meta">{detalleCurso(p)}</p>}
        <p className="recomendacion__porque">{resultado.porque}</p>
        {p.curso && (
          <p className="recomendacion__meta">
            {p.curso.verificado ? t('paso.cursoReal') : t('paso.cursoEjemplo')} {t('paso.cursoAprox')}
          </p>
        )}
        {p.curso_ajustado && <p className="recomendacion__meta">{t('paso.cursoAjustado')}</p>}
        {p.tipo === 'asesor' ? (
          <p className="recomendacion__meta">{t('paso.asesorTexto')}</p>
        ) : url ? (
          <a className="boton boton--miel" href={url} target="_blank" rel="noopener noreferrer">
            {t(`paso.ir.${p.tipo}`)}
          </a>
        ) : (
          <p className="enlace-todo">{t('comun.enlaceTodo')}</p>
        )}
      </section>

      <div className="pila-chica">
        <span className="etiqueta">{t('paso.otrasOpciones')}</span>
        <div className="alternativas">
          {resultado.alternativas.map((a) => {
            const u = enlaceDe(a.tipo, salud.enlaces);
            const contenido = (
              <>
                <Icono nombre={ICONO[a.tipo]} />
                <span>{a.titulo}</span>
              </>
            );
            return u ? (
              <a key={a.tipo} className="alternativa" href={u} target="_blank" rel="noopener noreferrer">
                {contenido}
              </a>
            ) : (
              <span key={a.tipo} className="alternativa" title={a.tipo === 'asesor' ? t('paso.asesorTexto') : t('comun.enlaceTodo')}>
                {contenido}
              </span>
            );
          })}
        </div>
      </div>

      <p className="certificacion">
        <Icono nombre="medalla" /> {t('paso.certificacion')}
      </p>

      <button type="button" className="boton boton--primario boton--grande" onClick={() => ir('resumen')}>
        {t('paso.verPanal')} <Icono nombre="adelante" />
      </button>
      <AvisoCertificacion />
      <NotaIlustrativa />
    </Pantalla>
  );
}
