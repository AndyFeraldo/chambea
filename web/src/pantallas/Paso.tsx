import { useEffect, useRef, type CSSProperties } from 'react';
import type { Horas, Modalidad, OpcionPaso, Perfil, ResultadoPrimerPaso, Ruta } from '@shared/tipos';
import { calcularPrimerPaso } from '@shared/motor';
import { primerPaso } from '../api';
import { t } from '../i18n';
import { useApp } from '../estado';
import { AvisoCertificacion, Enjambre, Icono, NotaIlustrativa, Pantalla, type NombreIcono } from '../componentes/comunes';

const ICONO: Record<OpcionPaso['tipo'], NombreIcono> = { capacitate: 'libro', empleos: 'maletin', asesor: 'persona' };

const HORAS: { valor: Horas; nivel: number }[] = [
  { valor: '1-3', nivel: 1 },
  { valor: '4-6', nivel: 2 },
  { valor: '7+', nivel: 3 },
];
const MODALIDADES: { valor: Modalidad; icono: NombreIcono }[] = [
  { valor: 'celular', icono: 'celular' },
  { valor: 'presencial', icono: 'edificio' },
  { valor: 'igual', icono: 'igual' },
];

/** Lo más probable según su situación (la persona lo puede cambiar). */
const SUGERIDO: Record<Perfil, { horas: Horas; modalidad: Modalidad }> = {
  sin_empleo: { horas: '7+', modalidad: 'igual' },
  informal: { horas: '1-3', modalidad: 'celular' },
  planilla_riesgo: { horas: '1-3', modalidad: 'celular' },
};

/** Enlace oficial configurable. */
export function enlaceDe(tipo: OpcionPaso['tipo'], enlaces: { empleos_peru: string | null; capacitate_peru: string | null }) {
  if (tipo === 'empleos') return enlaces.empleos_peru;
  if (tipo === 'capacitate') return enlaces.capacitate_peru;
  return null;
}

/** Hexágonos de la ruta: lo que tiene, lo que el curso le daría y lo que aún faltaría. */
function Progreso({ ruta, cubre }: { ruta: Ruta; cubre: string[] }) {
  const total = ruta.tiene.length + ruta.faltan.length;
  const gana = ruta.faltan.filter((id) => cubre.includes(id));
  const despues = ruta.tiene.length + gana.length;
  return (
    <div className="progreso-ruta">
      <div className="progreso-ruta__celdas" aria-hidden="true">
        {ruta.tiene.map((id) => (
          <span key={id} className="mini-hex mini-hex--tiene" />
        ))}
        {gana.map((id, i) => (
          <span key={id} className="mini-hex mini-hex--gana" style={{ '--i': i } as CSSProperties}>
            +
          </span>
        ))}
        {ruta.faltan
          .filter((id) => !gana.includes(id))
          .map((id) => (
            <span key={id} className="mini-hex" />
          ))}
      </div>
      <p className="progreso-ruta__texto">
        {gana.length > 0
          ? t('paso.proyeccion', { hoy: ruta.tiene.length, despues, total })
          : t('paso.proyeccionHoy', { hoy: ruta.tiene.length, total })}
      </p>
    </div>
  );
}

export function Paso() {
  const { estado } = useApp();
  // Sin ruta elegida (ninguna encajó): directo a la recomendación de un asesor.
  if (!estado.rutaElegida || estado.lugar.pregunta > 0) return <Resultado />;
  return <Preferencias />;
}

function Preferencias() {
  const { datos, estado, cambiar, ir, comp } = useApp();
  const ruta = estado.rutas?.rutas.find((r) => r.ocupacion_id === estado.rutaElegida) ?? null;
  const sugerido = SUGERIDO[estado.perfil ?? 'sin_empleo'];
  const horas = estado.horas ?? sugerido.horas;
  const modalidad = estado.modalidad ?? sugerido.modalidad;

  // Vista previa en vivo: qué te recomendaríamos con lo que elegiste.
  const vista: ResultadoPrimerPaso | null = ruta
    ? calcularPrimerPaso(datos, {
        ocupacion_id: ruta.ocupacion_id,
        competencias_ids: estado.celdas.map((c) => c.id),
        perfil: estado.perfil ?? 'sin_empleo',
        horas,
        modalidad,
        costo: 'gratis',
      })
    : null;
  const p = vista?.principal;

  const seguir = () => {
    cambiar({ horas, modalidad, costo: 'gratis', primerPaso: null });
    ir('paso', 1);
  };

  return (
    <Pantalla>
      <div className="pila-chica">
        <span className="etiqueta">{t('paso.etiqueta')}</span>
        <h1>{t('paso.prefTitulo')}</h1>
        <p className="ayuda">{t('paso.prefPorque')}</p>
      </div>

      {ruta && (
        <section className="meta-ruta">
          <p className="meta-ruta__titulo">
            {ruta.faltan.length ? t('paso.teFaltaPara', { ruta: ruta.nombre }) : t('paso.yaTienesTodo', { ruta: ruta.nombre })}
          </p>
          {ruta.faltan.length > 0 && (
            <div className="meta-ruta__chips">
              {ruta.faltan.map((id) => (
                <span key={id} className="chip-falta">
                  <span className="mini-hex" /> {comp(id)?.nombre_corto ?? id}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      <fieldset className="pref">
        <legend className="pref__titulo">
          <Icono nombre="reloj" tam={22} /> {t('paso.tiempoTitulo')}
        </legend>
        <div className="pref__opciones pref__opciones--3">
          {HORAS.map((h) => (
            <button
              key={h.valor}
              type="button"
              className="pref__opcion"
              aria-pressed={horas === h.valor}
              onClick={() => cambiar({ horas: h.valor, primerPaso: null })}
            >
              <span className="medidor" aria-hidden="true">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={`medidor__hex ${n <= h.nivel ? 'lleno' : ''}`} />
                ))}
              </span>
              <b>{t(`paso.horasOp.${h.valor}`)}</b>
              <small>{t(`paso.horasEquivale.${h.valor}`)}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="pref">
        <legend className="pref__titulo">
          <Icono nombre="libro" tam={22} /> {t('paso.lugarTitulo')}
        </legend>
        <div className="pref__opciones pref__opciones--3">
          {MODALIDADES.map((m) => (
            <button
              key={m.valor}
              type="button"
              className="pref__opcion"
              aria-pressed={modalidad === m.valor}
              onClick={() => cambiar({ modalidad: m.valor, primerPaso: null })}
            >
              <span className="pref__icono">
                <Icono nombre={m.icono} tam={26} />
              </span>
              <b>{t(`paso.modalidadOp.${m.valor}`)}</b>
              <small>{t(`paso.modalidadAyuda.${m.valor}`)}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <p className="pref__gratis">
        <Icono nombre="regalo" tam={20} /> {t('paso.todoGratis')}
      </p>
      {!estado.horas && !estado.modalidad && <p className="nota">{t('paso.sugeridoNota')}</p>}

      {p && ruta && (
        <section className="vista-previa" aria-live="polite">
          <span className="etiqueta">{t('paso.vistaPrevia')}</span>
          <div className="vista-previa__fila">
            <span className="vista-previa__icono">
              <Icono nombre={ICONO[p.tipo]} tam={24} />
            </span>
            <div className="vista-previa__textos">
              <b>{p.tipo === 'capacitate' ? p.detalle : p.titulo}</b>
              <small>
                {p.curso
                  ? t('paso.cursoCorto', {
                      semanas: p.curso.duracion_semanas,
                      horas: p.curso.horas_semana,
                      modalidad: t(`paso.cursoModalidad.${p.curso.modalidad}`),
                    })
                  : p.detalle}
              </small>
            </div>
          </div>
          {p.curso_ajustado && <p className="vista-previa__aviso">{t('paso.cursoAjustado')}</p>}
          <Progreso ruta={ruta} cubre={p.curso?.cubre ?? []} />
        </section>
      )}

      <div className="empuje" />
      <button type="button" className="boton boton--primario boton--grande" onClick={seguir}>
        {t('paso.ver')} <Icono nombre="adelante" />
      </button>
    </Pantalla>
  );
}

function Resultado() {
  const { datos, salud, estado, cambiar, ir, atras } = useApp();
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
      horas: estado.horas ?? '1-3',
      modalidad: estado.modalidad ?? 'igual',
      costo: 'gratis',
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

  // Línea de tiempo: qué hacer hoy, durante y después.
  const etapas: { cuando: string; que: string }[] = [];
  if (p.tipo === 'capacitate' && p.curso) {
    etapas.push({ cuando: t('paso.linea.hoy'), que: t('paso.linea.inscribete', { curso: p.detalle }) });
    etapas.push({
      cuando: t('paso.linea.semanas', { n: p.curso.duracion_semanas }),
      que: t('paso.linea.estudia', { horas: p.curso.horas_semana, modalidad: t(`paso.cursoModalidad.${p.curso.modalidad}`) }),
    });
    if (ruta) etapas.push({ cuando: t('paso.linea.luego'), que: t('paso.linea.postula', { ruta: ruta.nombre }) });
  } else if (p.tipo === 'empleos') {
    etapas.push({ cuando: t('paso.linea.hoy'), que: t('paso.linea.cuenta') });
    if (ruta) etapas.push({ cuando: t('paso.linea.estaSemana'), que: t('paso.linea.postula', { ruta: ruta.nombre }) });
  } else {
    etapas.push({ cuando: t('paso.linea.hoy'), que: t('paso.linea.centro') });
    etapas.push({ cuando: t('paso.linea.alli'), que: t('paso.linea.asesor') });
  }
  etapas.push({ cuando: t('paso.linea.despues'), que: t('paso.linea.certifica') });

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
        {p.curso && (
          <p className="recomendacion__meta">
            {t('paso.cursoCorto', {
              semanas: p.curso.duracion_semanas,
              horas: p.curso.horas_semana,
              modalidad: t(`paso.cursoModalidad.${p.curso.modalidad}`),
            })}{' '}
            · {t('paso.gratis')}
          </p>
        )}
        <p className="recomendacion__porque">{resultado.porque}</p>
        {ruta && <Progreso ruta={ruta} cubre={p.curso?.cubre ?? []} />}
        {p.curso && (
          <p className="recomendacion__meta">
            {p.curso.verificado ? t('paso.cursoReal') : t('paso.cursoEjemplo')} {t('paso.cursoAprox')}
          </p>
        )}
        {p.curso_ajustado && <p className="recomendacion__meta">{t('paso.cursoAjustado')}</p>}
        {url && p.tipo !== 'asesor' && (
          <a className="boton boton--miel" href={url} target="_blank" rel="noopener noreferrer">
            {t(`paso.ir.${p.tipo}`)}
          </a>
        )}
      </section>

      <section className="linea" aria-labelledby="linea">
        <h2 id="linea">{t('paso.linea.titulo')}</h2>
        <ol className="linea__lista">
          {etapas.map((e, i) => (
            <li key={i} className="linea__etapa aparecer" style={{ '--i': i } as CSSProperties}>
              <span className="linea__marca">{i + 1}</span>
              <div>
                <span className="linea__cuando">{e.cuando}</span>
                <p>{e.que}</p>
              </div>
            </li>
          ))}
        </ol>
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
              <span key={a.tipo} className="alternativa" title={a.tipo === 'asesor' ? t('paso.asesorTexto') : ''}>
                {contenido}
              </span>
            );
          })}
        </div>
      </div>

      <button type="button" className="boton boton--primario boton--grande" onClick={() => ir('resumen')}>
        {t('paso.verPanal')} <Icono nombre="adelante" />
      </button>
      {estado.rutaElegida && (
        <button type="button" className="boton boton--fantasma" onClick={atras}>
          {t('paso.cambiarPreferencias')}
        </button>
      )}
      <AvisoCertificacion />
      <NotaIlustrativa />
    </Pantalla>
  );
}
