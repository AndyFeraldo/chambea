import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { t } from '../i18n';
import { pasoDe, useApp } from '../estado';

/** Abeja de la marca, con alas que aletean (ver .abeja en estilos.css). */
export function Abeja({ tam = 40, className = '', style }: { tam?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg className={`abeja ${className}`} style={style} width={tam} height={tam} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <clipPath id="cuerpo-abeja">
          <ellipse cx="34" cy="37" rx="13" ry="10" />
        </clipPath>
      </defs>
      <ellipse className="abeja__ala" cx="29" cy="24" rx="7" ry="10" fill="#FFFFFF" opacity="0.92" transform="rotate(-20 29 25)" />
      <ellipse className="abeja__ala abeja__ala--2" cx="38" cy="23" rx="6" ry="9" fill="#FFFFFF" opacity="0.8" transform="rotate(18 38 24)" />
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

/** Abejas que cruzan volando, con una estela borrosa detrás (efecto de movimiento). */
export function Enjambre({ cantidad = 3 }: { cantidad?: number }) {
  return (
    <div className="enjambre" aria-hidden="true">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className={`vuelo vuelo--${(i % 4) + 1}`}>
          <Abeja tam={i === 0 ? 38 : 28} className="abeja--estela" />
          <Abeja tam={i === 0 ? 38 : 28} />
        </div>
      ))}
    </div>
  );
}

export function IconoAbeja({ tam = 36 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 3 L57 17.5 L57 46.5 L32 61 L7 46.5 L7 17.5 Z" fill="#26A17B" />
      <g transform="translate(0 2)">
        <ellipse cx="29" cy="25" rx="7" ry="9" fill="#FFFFFF" opacity="0.92" transform="rotate(-20 29 25)" />
        <ellipse cx="38" cy="24" rx="6" ry="8.5" fill="#FFFFFF" opacity="0.8" transform="rotate(18 38 24)" />
        <ellipse cx="34" cy="37" rx="13" ry="10" fill="#F5B82E" />
        <rect x="30" y="27.4" width="4" height="19.2" fill="#0E1A17" />
        <rect x="38" y="27.6" width="4" height="18.8" fill="#0E1A17" />
        <path d="M47 37 L52 37 L47 40 Z" fill="#0E1A17" />
        <circle cx="20" cy="37" r="6.5" fill="#0E1A17" />
        <circle cx="18" cy="35.5" r="1.4" fill="#FFFFFF" />
      </g>
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
  adelante: <path d="M9 5l7 7-7 7" />,
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
  detener: <rect x="7" y="7" width="10" height="10" rx="2" />,
  teclado: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
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
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  cerrar: <path d="M6 6l12 12M18 6L6 18" />,
  lupa: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </>
  ),
  ola: <path d="M2 9c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2 5-1M2 16c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2 5-1" />,
  escudo: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
      <path d="M12 8v4m0 3v.5" />
    </>
  ),
  caja: (
    <>
      <rect x="3" y="11" width="18" height="9" rx="2" />
      <path d="M6 11V5h8v6M14 7h4l2 4M7 15h2m3 0h2" />
    </>
  ),
  etiqueta: (
    <>
      <path d="M3 12V4h8l10 10-8 8L3 12z" />
      <circle cx="7.5" cy="8.5" r="1.5" />
    </>
  ),
  cajas: (
    <>
      <rect x="3" y="12" width="8" height="8" />
      <rect x="13" y="12" width="8" height="8" />
      <rect x="8" y="4" width="8" height="8" />
    </>
  ),
  carpeta: <path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />,
  balde: (
    <>
      <path d="M5 8h14l-1.5 12h-11L5 8z" />
      <path d="M8 8a4 4 0 018 0M3 8h18" />
    </>
  ),
  hexagono: <path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z" />,
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  celular: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  edificio: <path d="M4 21V5l8-3 8 3v16M4 21h16M9 21v-5h6v5M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" />,
  igual: <path d="M5 9h14M5 15h14" />,
  moneda: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9a3 3 0 00-3-1.5c-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.5 0 1.3-1.3 2.3-3 2.3a3.4 3.4 0 01-3-1.5M12 6v1.5m0 9V18" />
    </>
  ),
  regalo: (
    <>
      <rect x="3" y="9" width="18" height="12" rx="1" />
      <path d="M12 9v12M3 13h18M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z" />
    </>
  ),
  casa: <path d="M3 11l9-7 9 7M5 9.5V20h5v-6h4v6h5V9.5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  compartir: (
    <>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4M20 17v.01" />
    </>
  ),
  altavoz: <path d="M4 9v6h4l5 4V5L8 9H4zm12-1a5 5 0 010 8m2.5-10.5a8.5 8.5 0 010 13" />,
  luna: <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />,
  moto: (
    <>
      <circle cx="5.5" cy="17" r="3" />
      <circle cx="18.5" cy="17" r="3" />
      <path d="M8.5 17h6l3-6h-4l-2-3H9M14 8h3" />
    </>
  ),
  olla: <path d="M4 10h16v7a3 3 0 01-3 3H7a3 3 0 01-3-3v-7zm-2 0h20M9 6c0-1 1-2 3-2s3 1 3 2" />,
  corazon: <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />,
  llave: <path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5z" />,
  copiar: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3" />
    </>
  ),
  guardar: <path d="M5 3h11l3 3v15H5V3zm3 0v5h7V3M8 21v-7h8v7" />,
  basura: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  ubicacion: (
    <>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  calendario: <path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5" />,
  documento: <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" />,
  ojo: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  ojo_no: <path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a10 10 0 005.4-1.6M9.9 9.9a3 3 0 004.2 4.2" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
};

export type NombreIcono = keyof typeof iconos;

export function Icono({ nombre, tam = 24, grosor = 2 }: { nombre: NombreIcono; tam?: number; grosor?: number }) {
  return (
    <svg
      className="icono"
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconos[nombre]}
    </svg>
  );
}

/** Ícono por ocupación (si se agrega una nueva en data/, usa el hexágono). */
export const ICONO_OCUPACION: Record<string, NombreIcono> = {
  cajero: 'caja',
  vendedor_tienda: 'etiqueta',
  reponedor: 'cajas',
  auxiliar_administrativo: 'carpeta',
  limpieza: 'balde',
};

/** Encabezado con "Atrás", logo y progreso de 4 hexágonos. */
export function Encabezado() {
  const { estado, atras, ir } = useApp();
  const [menu, setMenu] = useState(false);
  const paso = pasoDe(estado.lugar.pantalla);
  return (
    <header className="encabezado">
      <div className="contenedor">
        <div className="encabezado__fila">
          <button type="button" className="encabezado__atras" onClick={atras}>
            <Icono nombre="atras" /> <span className="encabezado__texto">{t('comun.atras')}</span>
          </button>
          <button type="button" className="encabezado__logo" onClick={() => ir('inicio')} aria-label={t('menu.inicio')}>
            <Logo tam={18} />
          </button>
          <div className="encabezado__derecha">
            <span className="encabezado__paso">{paso <= 4 ? t('comun.paso', { n: paso }) : t('comun.listo')}</span>
            <button type="button" className="encabezado__menu" onClick={() => setMenu(true)} aria-label={t('menu.abrir')}>
              <Icono nombre="menu" />
            </button>
          </div>
        </div>
        <div className="progreso" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={Math.min(paso, 4)}>
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className={`progreso__celda ${n < paso ? 'progreso__celda--lleno' : ''} ${n === paso ? 'progreso__celda--actual' : ''}`}>
              <span className="progreso__relleno" />
            </span>
          ))}
        </div>
      </div>
      <Menu abierto={menu} alCerrar={() => setMenu(false)} />
    </header>
  );
}

/** Menú: inicio, guardar en este celular, ver mi panal, registrarse en Empleos Perú, borrar todo. */
export function Menu({ abierto, alCerrar }: { abierto: boolean; alCerrar: () => void }) {
  const { estado, salud, cambiar, ir, reiniciar } = useApp();
  const [borrando, setBorrando] = useState(false);
  const cerrar = () => {
    setBorrando(false);
    alCerrar();
  };
  const accion = (f: () => void) => () => {
    f();
    cerrar();
  };
  return (
    <Hoja abierta={abierto} alCerrar={cerrar} titulo={t('menu.titulo')}>
      <h2>{t('menu.titulo')}</h2>
      <nav className="menu">
        <button type="button" className="menu__item" onClick={accion(() => ir('inicio'))}>
          <Icono nombre="casa" /> {t('menu.inicio')}
        </button>
        {estado.celdas.length > 0 && (
          <button type="button" className="menu__item" onClick={accion(() => ir('panal'))}>
            <Icono nombre="hexagono" /> {t('menu.miPanal')}
          </button>
        )}
        {estado.primerPaso && (
          <button type="button" className="menu__item" onClick={accion(() => ir('resumen'))}>
            <Icono nombre="check" /> {t('menu.resumen')}
          </button>
        )}
        <button type="button" className="menu__item" onClick={accion(() => ir('banco'))}>
          <Icono nombre="persona" /> {t('menu.banco')}
        </button>
        {estado.cuenta ? (
          <button type="button" className="menu__item" onClick={accion(() => cambiar({ cuenta: null }))}>
            <Icono nombre="atras" /> {t('menu.salir')}
          </button>
        ) : (
          <button type="button" className="menu__item" onClick={accion(() => ir('cuenta', 0))}>
            <Icono nombre="guardar" /> {t('menu.cuenta')}
          </button>
        )}
        <label className="menu__item menu__interruptor">
          <Icono nombre="guardar" />
          <span className="menu__textos">
            <b>{t('menu.guardar')}</b>
            <small>{t('menu.guardarAyuda')}</small>
          </span>
          <input type="checkbox" checked={estado.guardar} onChange={(e) => cambiar({ guardar: e.target.checked })} />
        </label>
        {salud.enlaces.empleos_peru && (
          <a className="menu__item" href={salud.enlaces.empleos_peru} target="_blank" rel="noopener noreferrer">
            <Icono nombre="persona" />
            <span className="menu__textos">
              <b>{t('menu.registrarse')}</b>
              <small>{t('menu.registrarseAyuda')}</small>
            </span>
          </a>
        )}
        {borrando ? (
          <div className="confirmar">
            <p>{t('resumen.reiniciarSeguro')}</p>
            <div className="fila-botones">
              <button type="button" className="boton boton--secundario" onClick={() => setBorrando(false)}>
                {t('resumen.reiniciarNo')}
              </button>
              <button type="button" className="boton boton--primario" onClick={accion(reiniciar)}>
                {t('resumen.reiniciarSi')}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="menu__item menu__item--peligro" onClick={() => setBorrando(true)}>
            <Icono nombre="basura" /> {t('menu.borrar')}
          </button>
        )}
      </nav>
    </Hoja>
  );
}

/** Lee el texto en voz alta con la voz del propio teléfono (para quien prefiere escuchar). */
export function BotonEscuchar({ texto }: { texto: string }) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const hablar = () => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'es-PE';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch {
      // Sin voz disponible: no pasa nada.
    }
  };
  return (
    <button type="button" className="escuchar" onClick={hablar} aria-label={t('preguntas.escuchar')}>
      <Icono nombre="altavoz" tam={20} />
    </button>
  );
}

export function Franjas() {
  const { estado, datos } = useApp();
  const caso = datos.casos.find((c) => c.id === estado.demo);
  if (!estado.asesor && !caso) return null;
  return (
    <div className="franjas">
      {estado.asesor && (
        <span className="franja franja--asesor">
          <Icono nombre="persona" tam={16} /> {t('comun.modoAsesor')}
        </span>
      )}
      {caso && <span className="franja franja--demo">{t('comun.casoSimulado', { nombre: caso.nombre.replace(/\s*\(.*\)/, '') })}</span>}
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
      <Icono nombre="medalla" tam={20} />
      <span>{t('comun.noCertifica')}</span>
    </p>
  );
}

export function Pantalla({ children, clase = '' }: { children: ReactNode; clase?: string }) {
  const { estado } = useApp();
  return (
    <main key={`${estado.lugar.pantalla}-${estado.lugar.pregunta}`} className={`contenedor pantalla entrar ${clase}`}>
      <Franjas />
      {children}
    </main>
  );
}

/** Hoja que sube desde abajo (detalle de una celda, lista para agregar). */
export function Hoja({ abierta, alCerrar, titulo, children }: { abierta: boolean; alCerrar: () => void; titulo: string; children: ReactNode }) {
  useEffect(() => {
    if (!abierta) return;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && alCerrar();
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [abierta, alCerrar]);
  if (!abierta) return null;
  // Portal al <body>: las animaciones de la pantalla no deben mover la hoja.
  return createPortal(
    <div className="hoja" role="dialog" aria-modal="true" aria-label={titulo}>
      <button type="button" className="hoja__fondo" aria-label={t('comun.cerrar')} onClick={alCerrar} />
      <div className="hoja__panel">
        <div className="hoja__tirador" />
        <button type="button" className="hoja__cerrar" aria-label={t('comun.cerrar')} onClick={alCerrar}>
          <Icono nombre="cerrar" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
