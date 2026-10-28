// Banco de talento: personas que ELIGIERON aparecer, organizadas por sector y profesión.
// Se busca por lo que la persona sabe hacer (cobertura), no por el nombre de su puesto.
import { useMemo, useState } from 'react';
import { t } from '../i18n';
import { useApp } from '../estado';
import { perfilesDeEjemplo, perfilPropio, type PerfilBanco } from '../bancoDemo';
import { JORNADAS, type Jornada } from '../cuenta';
import { Hoja, Icono } from '../componentes/comunes';
import { Plataforma } from '../componentes/Plataforma';
import { TarjetaTalento } from '../componentes/Talento';

const UMBRAL = 0.5;

export function Banco() {
  const { datos, estado, ir, cambiar } = useApp();
  const [sector, setSector] = useState<string | null>(null);
  const [profesion, setProfesion] = useState<string>('');
  const [regionId, setRegionId] = useState<string>('');
  const [listos, setListos] = useState(false);
  const [jornada, setJornada] = useState<Jornada | null>(null);
  const [yaMismo, setYaMismo] = useState(false);
  // En computadora los filtros se ven siempre; en celular empiezan plegados.
  const [filtrosAbiertos] = useState(() => typeof matchMedia === 'function' && matchMedia('(min-width: 1000px)').matches);
  const [empresa, setEmpresa] = useState('');
  const [puesto, setPuesto] = useState('');
  const [contacto, setContacto] = useState<PerfilBanco | null>(null);
  const [solicitado, setSolicitado] = useState<Set<string>>(new Set());

  const ejemplos = useMemo(() => perfilesDeEjemplo(datos), [datos]);
  // El perfil de la persona aparece solo si tiene cuenta, completó su perfil laboral y aceptó ser visible.
  const cuenta = estado.cuenta;
  const propio = useMemo(
    () => (cuenta?.visible && cuenta.laboral && estado.celdas.length ? perfilPropio(datos, estado, cuenta, cuenta.laboral) : null),
    [datos, estado, cuenta],
  );

  const sectores = [...new Set(datos.ocupaciones.map((o) => o.sector).filter(Boolean))] as string[];
  const profesiones = datos.ocupaciones.filter((o) => !sector || o.sector === sector);
  const idsSector = new Set(profesiones.map((o) => o.id));

  // Puntaje de cada perfil para lo que se busca: la profesión elegida o la mejor del sector.
  const puntaje = (p: PerfilBanco): { ocupacion: string; cobertura: number } => {
    if (profesion) return { ocupacion: profesion, cobertura: p.cobertura[profesion] ?? 0 };
    const candidatos = Object.entries(p.cobertura).filter(([id]) => !sector || idsSector.has(id));
    const [ocupacion, cobertura] = candidatos.sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
    return { ocupacion, cobertura };
  };

  const resultados = [...(propio ? [propio] : []), ...ejemplos]
    .filter((p) => !regionId || p.regionId === regionId)
    .filter((p) => !jornada || p.jornada === jornada)
    .filter((p) => !yaMismo || p.inicio === 'ya')
    .map((p) => ({ p, s: puntaje(p) }))
    .filter(({ s }) => s.cobertura >= (listos ? 0.85 : UMBRAL))
    .sort((a, b) => Number(b.p.id === 'TU-PERFIL') - Number(a.p.id === 'TU-PERFIL') || b.s.cobertura - a.s.cobertura);

  // Personas que hoy NO trabajan en esa profesión pero podrían (el valor del banco).
  const desdeOtroOficio = profesion ? resultados.filter(({ p }) => p.ocupacionActual !== profesion).length : 0;

  // Cuántos perfiles hay por sector (según su oficio actual).
  const porSector = sectores.map((s) => ({
    s,
    n: ejemplos.filter((p) => datos.ocupaciones.find((o) => o.id === p.ocupacionActual)?.sector === s && (!regionId || p.regionId === regionId)).length,
  }));
  const maxSector = Math.max(1, ...porSector.map((x) => x.n));

  const nombreOcc = (id: string | null) => datos.ocupaciones.find((o) => o.id === id)?.nombre ?? t('banco.otroOficio');

  const filtros = (
    <details className="filtros" open={filtrosAbiertos}>
      <summary>
        <h2>{t('banco.filtros')}</h2>
        <span className="filtros__abrir">
          <Icono nombre="lupa" tam={18} /> {t('banco.verFiltros')}
        </span>
      </summary>
      <div className="filtros__grupo">
        <span className="etiqueta">{t('banco.sector')}</span>
        <div className="chips">
          <button type="button" className="chip chip--chico" aria-pressed={!sector} onClick={() => (setSector(null), setProfesion(''))}>
            {t('banco.todos')}
          </button>
          {sectores.map((s) => (
            <button key={s} type="button" className="chip chip--chico" aria-pressed={sector === s} onClick={() => (setSector(s), setProfesion(''))}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <label className="campo">
        <span className="etiqueta">{t('banco.profesion')}</span>
        <select id="banco-profesion" className="selector" value={profesion} onChange={(e) => setProfesion(e.target.value)}>
          <option value="">{t('banco.cualquiera')}</option>
          {profesiones.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="campo">
        <span className="etiqueta">{t('banco.region')}</span>
        <select id="banco-region" className="selector" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
          <option value="">{t('banco.todoPeru')}</option>
          {datos.regiones.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="consentimiento">
        <input id="banco-listos" type="checkbox" checked={listos} onChange={(e) => setListos(e.target.checked)} />
        <span>
          <b>{t('banco.listos')}</b>
          <small>{t('banco.listosAyuda')}</small>
        </span>
      </label>
      <div className="filtros__grupo">
        <span className="etiqueta">{t('banco.jornada')}</span>
        <div className="chips">
          <button type="button" className="chip chip--chico" aria-pressed={!jornada} onClick={() => setJornada(null)}>
            {t('banco.todas')}
          </button>
          {JORNADAS.map((j) => (
            <button key={j} type="button" className="chip chip--chico" aria-pressed={jornada === j} onClick={() => setJornada(j)}>
              {t(`unirse.jornadas.${j}`)}
            </button>
          ))}
        </div>
      </div>
      <label className="consentimiento">
        <input id="banco-ya" type="checkbox" checked={yaMismo} onChange={(e) => setYaMismo(e.target.checked)} />
        <span>
          <b>{t('banco.yaMismo')}</b>
          <small>{t('banco.yaMismoAyuda')}</small>
        </span>
      </label>
    </details>
  );

  const lateral = (
    <>
      <section className="bloque">
        <h2>{t('banco.comoTitulo')}</h2>
        <ol className="linea__lista">
          {(['uno', 'dos', 'tres'] as const).map((k, i) => (
            <li key={k} className="linea__etapa">
              <span className="linea__marca">{i + 1}</span>
              <p>{t(`banco.como.${k}`)}</p>
            </li>
          ))}
        </ol>
        <p className="nota">{t('banco.privacidad')}</p>
      </section>
      <section className="bloque">
        <h2>{t('banco.porSector')}</h2>
        <ul className="barras-sector">
          {porSector.map(({ s, n }) => (
            <li key={s}>
              <span>{s}</span>
              <span className="barra" aria-hidden="true">
                <span className="barra__lleno" style={{ width: `${(n / maxSector) * 100}%` }} />
              </span>
              <b>{n}</b>
            </li>
          ))}
        </ul>
        <p className="nota">{t('banco.ejemplos')}</p>
      </section>
    </>
  );

  return (
    <Plataforma activo="banco" izquierda={filtros} derecha={lateral}>
      <div className="banco__cabeza">
        <span className="etiqueta">{t('banco.etiqueta')}</span>
        <h1>{t('banco.titulo')}</h1>
        <p className="ayuda">{t('banco.subtitulo')}</p>
      </div>

      {cuenta?.visible && cuenta.laboral ? (
        <section className="banco__unete banco__unete--dentro">
          <div>
            <b>
              <Icono nombre="check" tam={18} grosor={3} /> {t('banco.estasDentro')}
            </b>
            <p>{t('banco.estasDentroTexto')}</p>
          </div>
          <div className="banco__unete-acciones">
            <button type="button" className="boton boton--secundario boton--compacto" onClick={() => ir('unirse')}>
              {t('banco.editar')}
            </button>
            <button type="button" className="enlace-texto" onClick={() => cambiar({ cuenta: { ...cuenta, visible: false } })}>
              {t('banco.salirBanco')}
            </button>
          </div>
        </section>
      ) : (
        <section className="banco__unete">
          <div>
            <b>{t('banco.uneteTitulo')}</b>
            <ol className="camino-banco camino-banco--linea">
              {(['panal', 'cuenta', 'perfil', 'publicar'] as const).map((k, i) => {
                const hecho = (k === 'panal' && estado.celdas.length > 0) || (k === 'cuenta' && !!cuenta) || (k === 'perfil' && !!cuenta?.laboral);
                return (
                  <li key={k} className={hecho ? 'hecho' : ''}>
                    <span className="num-hex">{hecho ? <Icono nombre="check" tam={12} grosor={3} /> : i + 1}</span>
                    {t(`unirse.camino.${k}`)}
                  </li>
                );
              })}
            </ol>
          </div>
          <button
            type="button"
            className="boton boton--miel"
            onClick={() => (!estado.celdas.length ? ir('situacion') : !cuenta ? ir('cuenta', 2) : ir('unirse'))}
          >
            {!estado.celdas.length ? t('unirse.faltaBoton.panal') : !cuenta ? t('web.registrarme') : cuenta.laboral ? t('banco.hacermeVisible') : t('unirse.cta')}{' '}
            <Icono nombre="adelante" tam={18} />
          </button>
        </section>
      )}

      <div className="banco__resumen">
        <b>{t('banco.encontrados', { n: resultados.length })}</b>
        {profesion && desdeOtroOficio > 0 && (
          <span className="marca marca--si-claro">
            <Icono nombre="adelante" tam={14} /> {t('banco.desdeOtro', { n: desdeOtroOficio, profesion: nombreOcc(profesion) })}
          </span>
        )}
      </div>

      {resultados.length === 0 ? (
        <p className="aviso-cert">{t('banco.vacio')}</p>
      ) : (
        <div className="banco__grilla">
          {resultados.slice(0, 30).map(({ p, s }, i) => (
            <TarjetaTalento
              key={p.id}
              p={p}
              ocupacion={s.ocupacion}
              cobertura={s.cobertura}
              tuyo={p.id === 'TU-PERFIL'}
              i={i}
              solicitado={solicitado.has(p.id)}
              alContactar={() => (setPuesto(profesion || s.ocupacion), setContacto(p))}
            />
          ))}
        </div>
      )}

      <Hoja abierta={!!contacto} alCerrar={() => setContacto(null)} titulo={t('banco.contactoTitulo', { nombre: contacto?.nombre ?? '' })}>
        {contacto && (
          <div className="detalle-celda">
            <span className="etiqueta">{t('banco.contactoEtiqueta')}</span>
            <h2>{t('banco.contactoTitulo', { nombre: contacto.nombre })}</h2>
            <ol className="linea__lista">
              {(['uno', 'dos', 'tres'] as const).map((k, i) => (
                <li key={k} className="linea__etapa">
                  <span className="linea__marca">{i + 1}</span>
                  <p>{t(`banco.contactoPasos.${k}`)}</p>
                </li>
              ))}
            </ol>
            <div className="formulario">
              <label className="campo">
                <span>{t('banco.empresa')}</span>
                <input id="contacto-empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder={t('banco.empresaEjemplo')} />
              </label>
              <label className="campo">
                <span>{t('banco.puesto')}</span>
                <select id="contacto-puesto" className="selector" value={puesto} onChange={(e) => setPuesto(e.target.value)}>
                  {datos.ocupaciones.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="nota">{t('banco.contactoDemo')}</p>
            <button
              type="button"
              className="boton boton--primario"
              disabled={empresa.trim().length < 2}
              onClick={() => {
                setSolicitado(new Set([...solicitado, contacto.id]));
                setContacto(null);
              }}
            >
              {t('banco.solicitar', { nombre: contacto.nombre })}
            </button>
          </div>
        )}
      </Hoja>
    </Plataforma>
  );
}
