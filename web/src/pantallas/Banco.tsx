// Banco de talento: personas que ELIGIERON aparecer, organizadas por sector y profesión.
// Se busca por lo que la persona sabe hacer (cobertura), no por el nombre de su puesto.
import { useMemo, useState, type CSSProperties } from 'react';
import { t } from '../i18n';
import { useApp } from '../estado';
import { perfilBanco, perfilesDeEjemplo, type PerfilBanco } from '../bancoDemo';
import { Hoja, Icono } from '../componentes/comunes';
import { AbejaVestida } from '../componentes/AbejaVestida';
import { Plataforma } from '../componentes/Plataforma';

const UMBRAL = 0.5;

export function Banco() {
  const { datos, estado, comp, ir, cambiar } = useApp();
  const [sector, setSector] = useState<string | null>(null);
  const [profesion, setProfesion] = useState<string>('');
  const [regionId, setRegionId] = useState<string>('');
  const [listos, setListos] = useState(false);
  const [contacto, setContacto] = useState<PerfilBanco | null>(null);
  const [solicitado, setSolicitado] = useState<Set<string>>(new Set());

  const ejemplos = useMemo(() => perfilesDeEjemplo(datos), [datos]);
  // El perfil de la persona aparece solo si tiene cuenta y aceptó ser visible.
  const propio = useMemo(
    () =>
      estado.cuenta?.visible && estado.celdas.length
        ? perfilBanco(datos, {
            id: 'TU-PERFIL',
            iniciales: estado.cuenta.nombre,
            ejemplo: false,
            regionId: estado.cuenta.regionId,
            ocupacionActual: estado.ocupacionActual,
            perfil: estado.perfil ?? 'sin_empleo',
            anios: 0,
            habilidades: estado.celdas.map((c) => c.id),
            enCurso: estado.primerPaso?.principal.tipo === 'capacitate',
          })
        : null,
    [datos, estado],
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
  const nombreRegion = (id: string) => datos.regiones.find((r) => r.id === id)?.nombre ?? '';

  const filtros = (
    <section className="filtros" aria-label={t('banco.filtros')}>
      <h2>{t('banco.filtros')}</h2>
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
    </section>
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

      {!estado.cuenta?.visible && (
        <section className="banco__unete">
          <div>
            <b>{t('banco.uneteTitulo')}</b>
            <p>{t('banco.uneteTexto')}</p>
          </div>
          <button
            type="button"
            className="boton boton--miel boton--compacto"
            onClick={() => (estado.cuenta ? cambiar({ cuenta: { ...estado.cuenta, visible: true } }) : ir('cuenta', 0))}
          >
            {estado.cuenta ? t('banco.hacermeVisible') : t('web.registrarme')}
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
          {resultados.slice(0, 30).map(({ p, s }, i) => {
            const tuyo = p.id === 'TU-PERFIL';
            const top = [...p.habilidades]
              .map((id) => comp(id))
              .filter(Boolean)
              .sort((a, b) => ['competencia', 'habilidad', 'conocimiento', 'cualidad'].indexOf(a!.dimension) - ['competencia', 'habilidad', 'conocimiento', 'cualidad'].indexOf(b!.dimension))
              .slice(0, 4);
            return (
              <article key={p.id} className={`talento aparecer ${tuyo ? 'talento--tuyo' : ''}`} style={{ '--i': Math.min(i, 8) } as CSSProperties}>
                <header className="talento__cabeza">
                  <span className="insignia insignia--chica">
                    <AbejaVestida ocupacion={s.ocupacion} tam={44} />
                  </span>
                  <div className="talento__quien">
                    <b>{tuyo ? t('banco.tuPerfil') : p.iniciales}</b>
                    <small>
                      {t('banco.hoy', { oficio: nombreOcc(p.ocupacionActual) })}
                      {p.anios > 0 && ` · ${t('banco.anios', { n: p.anios })}`}
                    </small>
                    <small>{nombreRegion(p.regionId)}</small>
                  </div>
                  <span className="talento__pct">{Math.round(s.cobertura * 100)}%</span>
                </header>
                <p className="talento__para">
                  {t('banco.para', { profesion: nombreOcc(s.ocupacion) })}
                  {p.ocupacionActual !== s.ocupacion && <span className="talento__lateral">{t('banco.recolocacion')}</span>}
                </p>
                <span className="barra" aria-hidden="true">
                  <span className="barra__lleno" style={{ width: `${s.cobertura * 100}%` }} />
                </span>
                <ul className="talento__habilidades">
                  {top.map((c) => (
                    <li key={c!.id} className={`hab-chip hab-chip--${c!.dimension}`}>
                      {c!.nombre_corto ?? c!.nombre_simple}
                    </li>
                  ))}
                </ul>
                <div className="talento__sellos">
                  <span className="sello">
                    <Icono nombre="check" tam={14} /> {t('banco.selloPanal')}
                  </span>
                  {p.enCurso && (
                    <span className="sello">
                      <Icono nombre="libro" tam={14} /> {t('banco.selloCurso')}
                    </span>
                  )}
                  {p.ejemplo && <span className="sello sello--ejemplo">{t('banco.selloEjemplo')}</span>}
                </div>
                {!tuyo && (
                  <button
                    type="button"
                    className="boton boton--secundario boton--compacto"
                    disabled={solicitado.has(p.id)}
                    onClick={() => setContacto(p)}
                  >
                    <Icono nombre="persona" tam={18} /> {solicitado.has(p.id) ? t('banco.solicitado') : t('banco.contactar')}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Hoja abierta={!!contacto} alCerrar={() => setContacto(null)} titulo={t('banco.contactoTitulo')}>
        {contacto && (
          <div className="detalle-celda">
            <span className="etiqueta">{t('banco.contactoEtiqueta')}</span>
            <h2>{t('banco.contactoTitulo')}</h2>
            <ol className="linea__lista">
              {(['uno', 'dos', 'tres'] as const).map((k, i) => (
                <li key={k} className="linea__etapa">
                  <span className="linea__marca">{i + 1}</span>
                  <p>{t(`banco.contactoPasos.${k}`)}</p>
                </li>
              ))}
            </ol>
            <p className="nota">{t('banco.contactoDemo')}</p>
            <button
              type="button"
              className="boton boton--primario"
              onClick={() => {
                setSolicitado(new Set([...solicitado, contacto.id]));
                setContacto(null);
              }}
            >
              {t('banco.solicitar')}
            </button>
          </div>
        )}
      </Hoja>
    </Plataforma>
  );
}
