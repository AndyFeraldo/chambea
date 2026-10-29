// Tarjeta de una persona en el Banco de talento (también se usa como vista previa al unirse).
import type { CSSProperties } from 'react';
import { t } from '../i18n';
import { useApp } from '../estado';
import type { PerfilBanco } from '../bancoDemo';
import { Icono } from './comunes';
import { AbejaVestida } from './AbejaVestida';

const ORDEN = ['competencia', 'habilidad', 'conocimiento', 'cualidad'];

export function TarjetaTalento({
  p,
  ocupacion,
  cobertura,
  tuyo = false,
  i = 0,
  solicitado = false,
  alContactar,
}: {
  p: PerfilBanco;
  ocupacion: string;
  cobertura: number;
  tuyo?: boolean;
  i?: number;
  solicitado?: boolean;
  alContactar?: () => void;
}) {
  const { datos, comp } = useApp();
  const nombreOcc = (id: string | null) => datos.ocupaciones.find((o) => o.id === id)?.nombre ?? t('banco.otroOficio');
  const region = datos.regiones.find((r) => r.id === p.regionId)?.nombre ?? '';
  const top = p.habilidades
    .map((id) => comp(id))
    .filter((c) => !!c)
    .sort((a, b) => ORDEN.indexOf(a.dimension) - ORDEN.indexOf(b.dimension))
    .slice(0, 4);
  const docs = p.documentos.length;

  return (
    <article className={`talento aparecer ${tuyo ? 'talento--tuyo' : ''}`} style={{ '--i': Math.min(i, 8) } as CSSProperties}>
      <header className="talento__cabeza">
        <span className="insignia insignia--chica">
          <AbejaVestida ocupacion={ocupacion} tam={44} />
        </span>
        <div className="talento__quien">
          <b>
            {p.nombre}
            {tuyo && <span className="talento__tu">{t('banco.tu')}</span>}
          </b>
          <small>
            {t('banco.hoy', { oficio: nombreOcc(p.ocupacionActual) })} · {t(`unirse.experiencia.${p.experiencia}`)}
          </small>
        </div>
        <span className="talento__pct">{Math.round(cobertura * 100)}%</span>
      </header>
      <small className="talento__lugar">
        <Icono nombre="ubicacion" tam={14} /> {p.zonas ? `${p.zonas} · ${region}` : region}
      </small>
      <p className="talento__para">
        {t('banco.para', { profesion: nombreOcc(ocupacion) })}
        {p.ocupacionActual !== ocupacion && <span className="talento__lateral">{t('banco.recolocacion')}</span>}
      </p>
      <span className="barra" aria-hidden="true">
        <span className="barra__lleno" style={{ width: `${cobertura * 100}%` }} />
      </span>
      {p.presentacion && <q className="talento__frase">{p.presentacion}</q>}
      <ul className="talento__habilidades">
        {top.map((c) => (
          <li key={c.id} className={`hab-chip hab-chip--${c.dimension}`}>
            {c.nombre_corto ?? c.nombre_simple}
          </li>
        ))}
      </ul>
      <ul className="talento__disponible">
        <li>
          <Icono nombre="reloj" tam={14} /> {t(`unirse.jornadas.${p.jornada}`)}
          {p.horarios.length > 0 && ` · ${p.horarios.map((h) => t(`unirse.horarios.${h}`)).join(', ')}`}
        </li>
        <li className={p.inicio === 'ya' ? 'talento__ya' : ''}>
          <Icono nombre="calendario" tam={14} /> {t(`unirse.inicios.${p.inicio}`)}
        </li>
      </ul>
      <div className="talento__sellos">
        <span className="sello">
          <Icono nombre="check" tam={14} /> {t('banco.selloPanal')}
        </span>
        {docs > 0 && (
          <span className="sello">
            <Icono nombre="documento" tam={14} /> {t('banco.selloDocs', { n: docs })}
          </span>
        )}
        {p.enCurso && (
          <span className="sello">
            <Icono nombre="libro" tam={14} /> {t('banco.selloCurso')}
          </span>
        )}
        {p.keet && (
          <span className="sello">
            <Icono nombre="chat" tam={14} /> {t('banco.selloKeet')}
          </span>
        )}
        {p.ejemplo && <span className="sello sello--ejemplo">{t('banco.selloEjemplo')}</span>}
      </div>
      {alContactar && !tuyo && (
        <button type="button" className="boton boton--secundario boton--compacto" disabled={solicitado} onClick={alContactar}>
          <Icono nombre="chat" tam={18} /> {solicitado ? t('banco.solicitado') : t('banco.contactar')}
        </button>
      )}
    </article>
  );
}
