// Diseño de plataforma web: barra superior con navegación y cuenta,
// columna izquierda (perfil/filtros), centro y columna derecha. En celular se apila.
import { useState, type ReactNode } from 'react';
import { t } from '../i18n';
import { useApp, type Pantalla } from '../estado';
import { iniciales, nombreCompleto, nombreVisible } from '../cuenta';
import { Icono, IconoAbeja, Logo, Menu } from './comunes';
import { PieWeb } from './Aliados';

type Seccion = 'resumen' | 'banco' | 'cuenta';

export function BarraWeb({ activo }: { activo?: Seccion }) {
  const { estado, ir, cambiar } = useApp();
  const [menu, setMenu] = useState(false);
  const enlaces: { id: Seccion | 'inicio'; pantalla: Pantalla; texto: string; visible: boolean }[] = [
    { id: 'inicio', pantalla: 'inicio', texto: t('web.inicio'), visible: true },
    { id: 'resumen', pantalla: estado.primerPaso ? 'resumen' : 'panal', texto: t('web.miPanal'), visible: estado.celdas.length > 0 },
    { id: 'banco', pantalla: 'banco', texto: t('web.banco'), visible: true },
  ];
  return (
    <header className="barra-web">
      <div className="barra-web__interior">
        <button type="button" className="barra-web__logo" onClick={() => ir('inicio')} aria-label={t('web.inicio')}>
          <Logo tam={22} />
        </button>
        <nav className="barra-web__nav" aria-label={t('web.navegacion')}>
          {enlaces
            .filter((e) => e.visible)
            .map((e) => (
              <button
                key={e.id}
                type="button"
                className="barra-web__enlace"
                aria-current={activo === e.id ? 'page' : undefined}
                onClick={() => ir(e.pantalla)}
              >
                {e.texto}
              </button>
            ))}
        </nav>
        <div className="barra-web__cuenta">
          {estado.cuenta ? (
            <>
              <span className="avatar" aria-hidden="true">
                {iniciales(estado.cuenta)}
              </span>
              <span className="barra-web__nombre">{nombreVisible(estado.cuenta.nombres, estado.cuenta.apellidos)}</span>
              <button type="button" className="barra-web__salir" onClick={() => cambiar({ cuenta: null })}>
                {t('web.salir')}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="boton boton--secundario boton--compacto" onClick={() => ir('cuenta', 1)}>
                {t('web.ingresar')}
              </button>
              <button type="button" className="boton boton--miel boton--compacto barra-web__registro" onClick={() => ir('cuenta', 0)}>
                {t('web.registrarme')}
              </button>
            </>
          )}
          <button type="button" className="encabezado__menu barra-web__menu" onClick={() => setMenu(true)} aria-label={t('menu.abrir')}>
            <Icono nombre="menu" />
          </button>
        </div>
      </div>
      <Menu abierto={menu} alCerrar={() => setMenu(false)} />
    </header>
  );
}

export function Plataforma({
  activo,
  izquierda,
  derecha,
  centroPrimero = false,
  children,
}: {
  activo?: Seccion;
  izquierda?: ReactNode;
  derecha?: ReactNode;
  /** En celular, mostrar primero el centro (y después los costados). */
  centroPrimero?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="plataforma">
      <BarraWeb activo={activo} />
      <div className={`plataforma__cuerpo ${izquierda ? 'con-izq' : ''} ${derecha ? 'con-der' : ''} ${centroPrimero ? 'centro-primero' : ''}`}>
        {izquierda && <aside className="plataforma__izq">{izquierda}</aside>}
        <main className="plataforma__centro entrar">{children}</main>
        {derecha && <aside className="plataforma__der">{derecha}</aside>}
      </div>
      <PieWeb />
    </div>
  );
}

/** Qué tan completo está el perfil (para animar a terminarlo). */
export function completitud(e: ReturnType<typeof useApp>['estado']): { pct: number; falta: string[] } {
  const pasos: [boolean, string][] = [
    [e.celdas.length > 0, t('web.completo.panal')],
    [!!e.rutaElegida, t('web.completo.ruta')],
    [!!e.primerPaso, t('web.completo.paso')],
    [!!e.cuenta, t('web.completo.cuenta')],
    [!!e.cuenta?.visible, t('web.completo.banco')],
  ];
  const hechos = pasos.filter(([ok]) => ok).length;
  return { pct: Math.round((hechos / pasos.length) * 100), falta: pasos.filter(([ok]) => !ok).map(([, txt]) => txt) };
}

/** Tarjeta de perfil para la columna izquierda. */
export function TarjetaPerfil() {
  const { datos, estado, ir } = useApp();
  const actual = datos.ocupaciones.find((o) => o.id === estado.ocupacionActual);
  const region = datos.regiones.find((r) => r.id === (estado.cuenta?.regionId ?? estado.regionId))?.nombre;
  const { pct, falta } = completitud(estado);
  return (
    <section className="perfil-lateral">
      <span className="perfil-lateral__avatar">
        {estado.cuenta ? iniciales(estado.cuenta) : <IconoAbeja tam={40} />}
      </span>
      <div className="perfil-lateral__datos">
        <b>{estado.cuenta ? nombreCompleto(estado.cuenta) : t('web.invitado')}</b>
        {actual && <span>{actual.nombre}</span>}
        {region && <span className="ayuda">{region}</span>}
      </div>
      <div className="perfil-lateral__completo">
        <span>{t('web.perfilCompleto', { pct })}</span>
        <span className="barra" aria-hidden="true">
          <span className="barra__lleno" style={{ width: `${pct}%` }} />
        </span>
        {falta[0] && <small>{t('web.siguiente', { cosa: falta[0] })}</small>}
      </div>
      {!estado.cuenta && (
        <button type="button" className="boton boton--miel boton--compacto" onClick={() => ir('cuenta', 0)}>
          {t('web.crearCuenta')}
        </button>
      )}
    </section>
  );
}
