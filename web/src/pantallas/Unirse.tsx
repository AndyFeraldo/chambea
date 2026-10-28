// Unirse al Banco de talento: el paso extra después del panal y la cuenta.
// 4 pasos cortos: experiencia · disponibilidad · lo que te respalda · así te verán (y publicar).
import { useMemo, useState, type ReactNode } from 'react';
import { t } from '../i18n';
import { useApp } from '../estado';
import {
  CONTACTOS,
  DOCUMENTOS,
  EXPERIENCIA,
  HORARIOS,
  INICIOS,
  JORNADAS,
  type ContactoPor,
  type Experiencia,
  type Horario,
  type Inicio,
  type Jornada,
  type PerfilLaboral,
} from '../cuenta';
import { perfilPropio } from '../bancoDemo';
import { Icono } from '../componentes/comunes';
import { Plataforma } from '../componentes/Plataforma';
import { TarjetaTalento } from '../componentes/Talento';

const PASOS = ['experiencia', 'disponibilidad', 'respaldo', 'publicar'] as const;

function Opciones<T extends string>({
  valores,
  prefijo,
  elegido,
  alElegir,
}: {
  valores: readonly T[];
  prefijo: string;
  elegido: T | T[];
  alElegir: (v: T) => void;
}) {
  const marcado = (v: T) => (Array.isArray(elegido) ? elegido.includes(v) : elegido === v);
  return (
    <div className="chips">
      {valores.map((v) => (
        <button key={v} type="button" className="chip chip--chico" aria-pressed={marcado(v)} onClick={() => alElegir(v)}>
          {marcado(v) && <Icono nombre="check" tam={16} grosor={3} />} {t(`${prefijo}.${v}`)}
        </button>
      ))}
    </div>
  );
}

function Grupo({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: ReactNode }) {
  return (
    <fieldset className="grupo-unirse">
      <legend>{titulo}</legend>
      {ayuda && <p className="ayuda">{ayuda}</p>}
      {children}
    </fieldset>
  );
}

export function UnirseBanco() {
  const { datos, estado, cambiar, ir } = useApp();
  const cuenta = estado.cuenta;
  const previo = cuenta?.laboral;
  const [paso, setPaso] = useState(0);
  const [experiencia, setExperiencia] = useState<Experiencia>(previo?.experiencia ?? '3a5');
  const [jornada, setJornada] = useState<Jornada>(previo?.jornada ?? 'completo');
  const [horarios, setHorarios] = useState<Horario[]>(previo?.horarios ?? ['manana']);
  const [inicio, setInicio] = useState<Inicio>(previo?.inicio ?? 'ya');
  const [zonas, setZonas] = useState(previo?.zonas ?? cuenta?.distrito ?? '');
  const [contactoPor, setContactoPor] = useState<ContactoPor>(previo?.contactoPor ?? 'centro');
  const [documentos, setDocumentos] = useState<string[]>(previo?.documentos ?? ['identidad']);
  const [presentacion, setPresentacion] = useState(previo?.presentacion ?? '');
  const [referencia, setReferencia] = useState(previo?.referencia ?? '');
  const [acepto, setAcepto] = useState(false);
  const [listo, setListo] = useState(false);

  const laboral: Omit<PerfilLaboral, 'publicado'> = { experiencia, jornada, horarios, inicio, zonas: zonas.trim(), contactoPor, documentos, presentacion: presentacion.trim(), referencia: referencia.trim() };
  const vista = useMemo(
    () => (cuenta && estado.celdas.length ? perfilPropio(datos, estado, cuenta, laboral) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [datos, estado, cuenta, JSON.stringify(laboral)],
  );
  const mejor = vista?.mejores[0];

  // Requisitos que piden sus mejores rutas (para resaltar documentos útiles).
  const pedidosPor = (clave?: string) =>
    clave
      ? (vista?.mejores ?? [])
          .map((m) => datos.ocupaciones.find((o) => o.id === m.ocupacion_id))
          .filter((o) => o?.requisitos_minimos?.some((r) => r.toLowerCase().includes(clave)))
          .map((o) => o!.nombre)
      : [];

  const alternar = <T,>(lista: T[], v: T) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);

  // ---------- Antes de empezar: necesita cuenta y panal ----------
  if (!cuenta || !estado.celdas.length) {
    const falta = !estado.celdas.length ? 'panal' : 'cuenta';
    return (
      <Plataforma activo="banco">
        <section className="unirse unirse--requisito">
          <span className="etiqueta">{t('unirse.etiqueta')}</span>
          <h1>{t('unirse.titulo')}</h1>
          <ol className="camino-banco">
            {(['panal', 'cuenta', 'perfil', 'publicar'] as const).map((k, i) => {
              const hecho = (k === 'panal' && estado.celdas.length > 0) || (k === 'cuenta' && !!cuenta);
              return (
                <li key={k} className={hecho ? 'hecho' : k === falta ? 'actual' : ''}>
                  <span className="num-hex">{hecho ? <Icono nombre="check" tam={14} grosor={3} /> : i + 1}</span>
                  {t(`unirse.camino.${k}`)}
                </li>
              );
            })}
          </ol>
          <p className="ayuda">{t(`unirse.falta.${falta}`)}</p>
          <button
            type="button"
            className="boton boton--miel boton--grande"
            onClick={() => (falta === 'panal' ? ir('situacion') : ir('cuenta', 2))}
          >
            {t(`unirse.faltaBoton.${falta}`)} <Icono nombre="adelante" />
          </button>
        </section>
      </Plataforma>
    );
  }

  const publicar = () => {
    cambiar({ cuenta: { ...cuenta, visible: true, laboral: { ...laboral, publicado: new Date().toISOString() } }, guardar: true });
    setListo(true);
  };

  if (listo) {
    return (
      <Plataforma activo="banco">
        <section className="unirse unirse--listo revelar">
          <span className="unirse__sello">
            <Icono nombre="check" tam={36} grosor={3} />
          </span>
          <h1>{t('unirse.listoTitulo')}</h1>
          <p className="ayuda">{t('unirse.listoTexto')}</p>
          {vista && mejor && <TarjetaTalento p={vista} ocupacion={mejor.ocupacion_id} cobertura={mejor.cobertura} tuyo />}
          <div className="formulario__acciones">
            <button type="button" className="boton boton--primario boton--grande" onClick={() => ir('banco')}>
              {t('unirse.verBanco')} <Icono nombre="adelante" />
            </button>
            <button type="button" className="boton boton--secundario" onClick={() => ir('resumen')}>
              {t('unirse.volverPanal')}
            </button>
          </div>
        </section>
      </Plataforma>
    );
  }

  const lateral = (
    <section className="bloque unirse__vista">
      <span className="etiqueta">{t('unirse.vistaPrevia')}</span>
      {vista && mejor && <TarjetaTalento p={vista} ocupacion={mejor.ocupacion_id} cobertura={mejor.cobertura} tuyo />}
      {vista && vista.mejores.length > 1 && (
        <p className="ayuda">
          {t('unirse.tambienPara', {
            lista: vista.mejores
              .slice(1)
              .map((m) => datos.ocupaciones.find((o) => o.id === m.ocupacion_id)?.nombre)
              .join(' · '),
          })}
        </p>
      )}
    </section>
  );

  return (
    <Plataforma activo="banco" derecha={lateral}>
      <section className="unirse">
        <span className="etiqueta">{t('unirse.etiqueta')}</span>
        <ol className="pasos-registro pasos-registro--4" aria-label={t('unirse.titulo')}>
          {PASOS.map((p, i) => (
            <li key={p} aria-current={i === paso ? 'step' : undefined} className={i < paso ? 'hecho' : ''}>
              <button type="button" disabled={i > paso} onClick={() => setPaso(i)}>
                <span className="num-hex">{i < paso ? <Icono nombre="check" tam={14} grosor={3} /> : i + 1}</span>
                <span>{t(`unirse.pasos.${p}`)}</span>
              </button>
            </li>
          ))}
        </ol>
        <h1>{t(`unirse.titulos.${PASOS[paso]}`)}</h1>
        <p className="ayuda">{t(`unirse.ayudas.${PASOS[paso]}`)}</p>

        <div className="unirse__cuerpo entrar" key={paso}>
          {paso === 0 && (
            <>
              <Grupo titulo={t('unirse.preguntas.experiencia')}>
                <Opciones valores={EXPERIENCIA} prefijo="unirse.experiencia" elegido={experiencia} alElegir={setExperiencia} />
              </Grupo>
              <Grupo titulo={t('unirse.preguntas.oficio')} ayuda={t('unirse.preguntas.oficioAyuda')}>
                <div className="unirse__oficio">
                  <b>{datos.ocupaciones.find((o) => o.id === estado.ocupacionActual)?.nombre ?? t('banco.otroOficio')}</b>
                  <span>{t('unirse.habilidades', { n: estado.celdas.length })}</span>
                  <button type="button" className="enlace" onClick={() => ir('panal')}>
                    {t('unirse.editarPanal')}
                  </button>
                </div>
              </Grupo>
              <Grupo titulo={t('unirse.preguntas.presentacion')} ayuda={t('unirse.preguntas.presentacionAyuda')}>
                <input
                  id="unirse-presentacion"
                  className="entrada"
                  value={presentacion}
                  maxLength={120}
                  onChange={(e) => setPresentacion(e.target.value)}
                  placeholder={t('unirse.preguntas.presentacionEjemplo')}
                />
              </Grupo>
            </>
          )}

          {paso === 1 && (
            <>
              <Grupo titulo={t('unirse.preguntas.jornada')}>
                <Opciones valores={JORNADAS} prefijo="unirse.jornadas" elegido={jornada} alElegir={setJornada} />
              </Grupo>
              <Grupo titulo={t('unirse.preguntas.horarios')} ayuda={t('unirse.preguntas.variosAyuda')}>
                <Opciones valores={HORARIOS} prefijo="unirse.horarios" elegido={horarios} alElegir={(h) => setHorarios(alternar(horarios, h))} />
              </Grupo>
              <Grupo titulo={t('unirse.preguntas.inicio')}>
                <Opciones valores={INICIOS} prefijo="unirse.inicios" elegido={inicio} alElegir={setInicio} />
              </Grupo>
              <Grupo titulo={t('unirse.preguntas.zonas')} ayuda={t('unirse.preguntas.zonasAyuda')}>
                <input id="unirse-zonas" className="entrada" value={zonas} onChange={(e) => setZonas(e.target.value)} placeholder={t('cuenta.distritoEjemplo')} />
              </Grupo>
            </>
          )}

          {paso === 2 && (
            <>
              <Grupo titulo={t('unirse.preguntas.documentos')} ayuda={t('unirse.preguntas.documentosAyuda')}>
                <ul className="documentos">
                  {DOCUMENTOS.map((d) => {
                    const piden = pedidosPor(d.clave);
                    return (
                      <li key={d.id}>
                        <label className="consentimiento">
                          <input
                            id={`doc-${d.id}`}
                            type="checkbox"
                            checked={documentos.includes(d.id)}
                            onChange={() => setDocumentos(alternar(documentos, d.id))}
                          />
                          <span>
                            <b>{t(`unirse.documentos.${d.id}`)}</b>
                            {piden.length > 0 && <small className="documentos__piden">{t('unirse.loPiden', { lista: piden.join(', ') })}</small>}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </Grupo>
              <Grupo titulo={t('unirse.preguntas.referencia')} ayuda={t('unirse.preguntas.referenciaAyuda')}>
                <input
                  id="unirse-referencia"
                  className="entrada"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder={t('unirse.preguntas.referenciaEjemplo')}
                />
              </Grupo>
              <Grupo titulo={t('unirse.preguntas.contacto')} ayuda={t('unirse.preguntas.contactoAyuda')}>
                <Opciones valores={CONTACTOS} prefijo="unirse.contactos" elegido={contactoPor} alElegir={setContactoPor} />
              </Grupo>
            </>
          )}

          {paso === 3 && (
            <>
              <div className="solo-movil">{vista && mejor && <TarjetaTalento p={vista} ocupacion={mejor.ocupacion_id} cobertura={mejor.cobertura} tuyo />}</div>
              <div className="se-ve">
                <div>
                  <h3>
                    <Icono nombre="ojo" tam={18} /> {t('unirse.seVe')}
                  </h3>
                  <ul>
                    {(['nombre', 'habilidades', 'rutas', 'disponibilidad', 'zonas', 'documentos'] as const).map((k) => (
                      <li key={k}>{t(`unirse.seVeLista.${k}`)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>
                    <Icono nombre="ojo_no" tam={18} /> {t('unirse.noSeVe')}
                  </h3>
                  <ul>
                    {(['apellido', 'documento', 'celular', 'correo', 'referencia'] as const).map((k) => (
                      <li key={k}>{t(`unirse.noSeVeLista.${k}`)}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <label className="consentimiento consentimiento--miel">
                <input id="unirse-acepto" type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
                <span>
                  <b>{t('unirse.acepto')}</b>
                  <small>{t('unirse.aceptoAyuda')}</small>
                </span>
              </label>
            </>
          )}
        </div>

        <div className="formulario__acciones">
          {paso > 0 && (
            <button type="button" className="boton boton--secundario" onClick={() => setPaso(paso - 1)}>
              <Icono nombre="atras" /> {t('comun.atras')}
            </button>
          )}
          {paso < PASOS.length - 1 ? (
            <button type="button" className="boton boton--primario boton--grande" onClick={() => setPaso(paso + 1)}>
              {t('cuenta.seguir')} <Icono nombre="adelante" />
            </button>
          ) : (
            <button type="button" className="boton boton--miel boton--grande" disabled={!acepto} onClick={publicar}>
              {cuenta.visible ? t('unirse.actualizar') : t('unirse.publicar')} <Icono nombre="adelante" />
            </button>
          )}
        </div>
        <p className="nota">{t('unirse.demo')}</p>
      </section>
    </Plataforma>
  );
}
