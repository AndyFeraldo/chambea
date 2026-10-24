import { useState } from 'react';
import type { Costo, Horas, Modalidad, OpcionPaso } from '@shared/tipos';
import { primerPaso } from '../api';
import { t } from '../i18n';
import { useApp } from '../estado';
import { AvisoCertificacion, Icono, NotaIlustrativa, Pantalla, type NombreIcono } from '../componentes/comunes';

const ICONO: Record<OpcionPaso['tipo'], NombreIcono> = { capacitate: 'libro', empleos: 'maletin', asesor: 'persona' };

function Grupo<T extends string>(props: {
  id: string;
  titulo: string;
  opciones: T[];
  valor: T | null;
  etiqueta: (v: T) => string;
  alElegir: (v: T) => void;
}) {
  return (
    <fieldset className="grupo-pregunta">
      <legend>{props.titulo}</legend>
      <div className="chips">
        {props.opciones.map((o) => (
          <button
            key={o}
            id={`${props.id}-${o}`}
            type="button"
            className="chip"
            aria-pressed={props.valor === o}
            onClick={() => props.alElegir(o)}
          >
            {props.etiqueta(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Enlace oficial configurable. Si no está confirmado, se muestra el TODO. */
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
  const { datos, salud, estado, cambiar, ir } = useApp();
  const [cargando, setCargando] = useState(false);
  const ruta = estado.rutas?.rutas.find((r) => r.ocupacion_id === estado.rutaElegida) ?? null;
  const listo = estado.horas && estado.modalidad && estado.costo;
  const resultado = estado.primerPaso;

  const calcular = async () => {
    if (!estado.horas || !estado.modalidad || !estado.costo) return;
    setCargando(true);
    const r = await primerPaso(datos, {
      ocupacion_id: estado.rutaElegida ?? '',
      competencias_ids: estado.celdas.map((c) => c.id),
      perfil: estado.perfil ?? 'sin_empleo',
      horas: estado.horas,
      modalidad: estado.modalidad,
      costo: estado.costo,
    });
    setCargando(false);
    cambiar({ primerPaso: r });
  };

  if (!resultado) {
    return (
      <Pantalla>
        <div className="pila-chica">
          <h1>{t('paso.titulo')}</h1>
          <p className="ayuda">{t('paso.ayuda')}</p>
          {ruta && <p className="etiqueta">{t('paso.ruta', { ocupacion: ruta.nombre })}</p>}
        </div>
        <Grupo<Horas>
          id="horas"
          titulo={t('paso.horas')}
          opciones={['1-3', '4-6', '7+']}
          valor={estado.horas}
          etiqueta={(v) => t(`paso.horasOp.${v}`)}
          alElegir={(v) => cambiar({ horas: v })}
        />
        <Grupo<Modalidad>
          id="modalidad"
          titulo={t('paso.modalidad')}
          opciones={['celular', 'presencial', 'igual']}
          valor={estado.modalidad}
          etiqueta={(v) => t(`paso.modalidadOp.${v}`)}
          alElegir={(v) => cambiar({ modalidad: v })}
        />
        <Grupo<Costo>
          id="costo"
          titulo={t('paso.costo')}
          opciones={['gratis', 'poco']}
          valor={estado.costo}
          etiqueta={(v) => t(`paso.costoOp.${v}`)}
          alElegir={(v) => cambiar({ costo: v })}
        />
        <div className="empuje" />
        <button type="button" className="boton boton--primario" disabled={!listo || cargando} onClick={calcular}>
          {t('paso.ver')}
        </button>
      </Pantalla>
    );
  }

  const p = resultado.principal;
  const url = enlaceDe(p.tipo, salud.enlaces);
  return (
    <Pantalla>
      <div className="pila-chica">
        <h1>{t('paso.tuPrimerPaso')}</h1>
        {ruta && <p className="etiqueta">{t('paso.ruta', { ocupacion: ruta.nombre })}</p>}
      </div>

      <section className="recomendacion">
        <div className="recomendacion__tipo">
          <Icono nombre={ICONO[p.tipo]} tam={28} />
          {p.titulo}
        </div>
        <p style={{ fontWeight: 600, fontSize: '1.08rem' }}>{p.detalle}</p>
        {detalleCurso(p) && <p className="recomendacion__meta">{detalleCurso(p)}</p>}
        <p className="recomendacion__porque">{resultado.porque}</p>
        {p.curso_ajustado && <p className="recomendacion__meta">{t('paso.cursoAjustado')}</p>}
        {p.curso?.ilustrativo && <p className="recomendacion__meta">{t('paso.cursoEjemplo')}</p>}
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

      <div className="pila">
        <h3>{t('paso.otrasOpciones')}</h3>
        {resultado.alternativas.map((a) => {
          const u = enlaceDe(a.tipo, salud.enlaces);
          return (
            <div key={a.tipo} className="alternativa">
              <Icono nombre={ICONO[a.tipo]} />
              <div className="pila-chica">
                <h3>{a.titulo}</h3>
                <p>{a.detalle}</p>
                {a.tipo === 'asesor' ? (
                  <p>{t('paso.asesorTexto')}</p>
                ) : u ? (
                  <a href={u} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--verde-oscuro)', fontWeight: 700 }}>
                    {t(`paso.ir.${a.tipo}`)}
                  </a>
                ) : (
                  <p className="enlace-todo">{t('comun.enlaceTodo')}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="certificacion">
        <Icono nombre="medalla" />
        <div className="pila-chica">
          <h3>{t('paso.certificacion')}</h3>
          <p>{t('paso.certificacionTexto')}</p>
        </div>
      </div>
      <AvisoCertificacion />
      <NotaIlustrativa />

      <div className="pila">
        <button type="button" className="boton boton--primario" onClick={() => ir('resumen')}>
          {t('paso.verPanal')}
        </button>
        <button type="button" className="boton boton--fantasma" onClick={() => cambiar({ primerPaso: null })}>
          {t('paso.cambiarRespuestas')}
        </button>
      </div>
    </Pantalla>
  );
}
