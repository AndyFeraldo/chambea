import type { ReactNode } from 'react';
import { t } from '../i18n';
import { pasoDe, useApp } from '../estado';

export function IconoAbeja({ tam = 36 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <clipPath id="cuerpo-abeja">
          <ellipse cx="34" cy="37" rx="13" ry="10" />
        </clipPath>
      </defs>
      <path d="M32 3 L57 17.5 L57 46.5 L32 61 L7 46.5 L7 17.5 Z" fill="#26A17B" />
      <ellipse cx="29" cy="25" rx="7" ry="9" fill="#FFFFFF" opacity="0.92" transform="rotate(-20 29 25)" />
      <ellipse cx="38" cy="24" rx="6" ry="8.5" fill="#FFFFFF" opacity="0.8" transform="rotate(18 38 24)" />
      <ellipse cx="34" cy="37" rx="13" ry="10" fill="#F5B82E" />
      <g clipPath="url(#cuerpo-abeja)">
        <rect x="30" y="24" width="4" height="26" fill="#0E1A17" />
        <rect x="38" y="24" width="4" height="26" fill="#0E1A17" />
      </g>
      <path d="M47 37 L52 37 L47 40 Z" fill="#0E1A17" />
      <circle cx="20" cy="37" r="6.5" fill="#0E1A17" />
      <circle cx="18" cy="35.5" r="1.4" fill="#FFFFFF" />
      <path d="M18 31 Q15 25 12 24" fill="none" stroke="#0E1A17" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21 31 Q21 25 19 22" fill="none" stroke="#0E1A17" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ oscuro = false, tam = 28 }: { oscuro?: boolean; tam?: number }) {
  return (
    <span className={`logo ${oscuro ? 'logo--oscuro' : ''}`} aria-label="Chambea">
      <IconoAbeja tam={tam * 1.25} />
      <span className="logo__palabra" style={{ fontSize: tam }} aria-hidden="true">
        <span className="logo__cham">cham</span>
        <span className="logo__bea">bea</span>
      </span>
    </span>
  );
}

const iconos = {
  atras: <path d="M15 5l-7 7 7 7" />,
  libro: <path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4zm0 13a3 3 0 013-3h11" />,
  maletin: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
    </>
  ),
  persona: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </>
  ),
  medalla: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14L7 22l5-3 5 3-1.5-8" />
    </>
  ),
  micro: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0014 0M12 18v3" />
    </>
  ),
  alerta: <path d="M12 3l10 18H2L12 3zm0 7v5m0 3v.5" />,
  candado: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </>
  ),
  mas: <path d="M12 5v14M5 12h14" />,
};

export type NombreIcono = keyof typeof iconos;

export function Icono({ nombre, tam = 24 }: { nombre: NombreIcono; tam?: number }) {
  return (
    <svg
      className="icono"
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconos[nombre]}
    </svg>
  );
}

/** Encabezado con "Atrás", logo y progreso de 4 hexágonos. */
export function Encabezado() {
  const { estado, atras } = useApp();
  const paso = pasoDe(estado.lugar.pantalla);
  return (
    <header className="encabezado">
      <div className="contenedor">
        <div className="encabezado__fila">
          <button type="button" className="encabezado__atras" onClick={atras}>
            <Icono nombre="atras" /> {t('comun.atras')}
          </button>
          <Logo tam={20} />
          <span className="encabezado__paso">{paso <= 4 ? t('comun.paso', { n: paso }) : t('comun.listo')}</span>
        </div>
        <div className="progreso" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={Math.min(paso, 4)}>
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`progreso__celda ${n < paso ? 'progreso__celda--lleno' : ''} ${n === paso ? 'progreso__celda--actual' : ''}`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}

export function Franjas() {
  const { estado, datos } = useApp();
  const caso = datos.casos.find((c) => c.id === estado.demo);
  if (!estado.asesor && !caso) return null;
  return (
    <div className="pila-chica">
      {estado.asesor && <p className="franja-asesor">{t('comun.modoAsesor')}</p>}
      {caso && <p className="franja-demo">{t('comun.casoSimulado', { nombre: caso.nombre.replace(/\s*\(.*\)/, '') })}</p>}
    </div>
  );
}

export function NotaIlustrativa() {
  const { datos } = useApp();
  if (!datos.ilustrativo) return null;
  return <p className="nota">{t('comun.notaIlustrativa')}</p>;
}

export function AvisoCertificacion() {
  return (
    <p className="aviso-cert" role="note">
      <Icono nombre="medalla" tam={22} />
      <span>{t('comun.noCertifica')}</span>
    </p>
  );
}

export function Pantalla({ children }: { children: ReactNode }) {
  return (
    <main className="contenedor pantalla">
      <Franjas />
      {children}
    </main>
  );
}
