import type { CSSProperties } from 'react';
import type { Perfil } from '@shared/tipos';
import { t } from '../i18n';
import { useApp } from '../estado';
import { Icono, Pantalla, type NombreIcono } from '../componentes/comunes';
import { AbejaVestida } from '../componentes/AbejaVestida';

const PERFILES: { id: Perfil; icono: NombreIcono }[] = [
  { id: 'sin_empleo', icono: 'lupa' },
  { id: 'informal', icono: 'ola' },
  { id: 'planilla_riesgo', icono: 'escudo' },
];

export function Situacion() {
  const { estado, cambiar, ir } = useApp();
  return (
    <Pantalla>
      <h1>{t('situacion.titulo')}</h1>
      <div className="tarjetas" role="group" aria-label={t('situacion.titulo')}>
        {PERFILES.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className="tarjeta-opcion aparecer"
            style={{ '--i': i } as CSSProperties}
            aria-pressed={estado.perfil === p.id}
            onClick={() => {
              cambiar({ perfil: p.id });
              ir('ocupacion');
            }}
          >
            <span className="tarjeta-opcion__icono">
              <Icono nombre={p.icono} tam={30} />
            </span>
            <span>{t(`situacion.opciones.${p.id}`)}</span>
          </button>
        ))}
      </div>
    </Pantalla>
  );
}

export function Ocupacion() {
  const { datos, estado, cambiar, ir } = useApp();
  const elegir = (id: string | null) => {
    cambiar({ ocupacionActual: id });
    ir('pregunta', 0);
  };
  return (
    <Pantalla>
      <h1>{t('ocupacion.titulo')}</h1>
      <div className="mosaico" role="group" aria-label={t('ocupacion.titulo')}>
        {datos.ocupaciones.map((o, i) => (
          <button
            key={o.id}
            type="button"
            className="mosaico__item aparecer"
            style={{ '--i': i } as CSSProperties}
            aria-pressed={estado.ocupacionActual === o.id}
            onClick={() => elegir(o.id)}
          >
            <span className="insignia">
              <AbejaVestida ocupacion={o.id} tam={66} />
            </span>
            <span className="mosaico__nombre">{o.nombre}</span>
            {o.sector && <small className="mosaico__sector">{o.sector}</small>}
          </button>
        ))}
        <button
          type="button"
          className="mosaico__item aparecer"
          style={{ '--i': datos.ocupaciones.length } as CSSProperties}
          onClick={() => elegir(null)}
        >
          <span className="mosaico__hex mosaico__hex--otro">
            <Icono nombre="mas" tam={30} />
          </span>
          <span>{t('ocupacion.otro')}</span>
        </button>
      </div>
    </Pantalla>
  );
}
