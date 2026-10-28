// Marco del recorrido (pasos 1 a 4). En celular: encabezado compacto con progreso.
// En computadora: barra web arriba y, al costado, los 4 pasos con el actual resaltado.
import type { ReactNode } from 'react';
import { t, textos } from '../i18n';
import { pasoDe, useApp } from '../estado';
import { Abeja, Encabezado, Icono, type NombreIcono } from './comunes';
import { BarraWeb } from './Plataforma';

const ICONOS: NombreIcono[] = ['micro', 'hexagono', 'adelante', 'check'];

function Pasos() {
  const { estado, atras } = useApp();
  const paso = pasoDe(estado.lugar.pantalla);
  return (
    <nav className="pasos-lateral" aria-label={t('recorrido.pasos')}>
      <button type="button" className="pasos-lateral__atras" onClick={atras}>
        <Icono nombre="atras" tam={20} /> {t('comun.atras')}
      </button>
      <ol>
        {textos.inicio.pasos.map((nombre, i) => {
          const n = i + 1;
          const estadoPaso = n < paso ? 'hecho' : n === paso ? 'actual' : 'pendiente';
          return (
            <li key={nombre} className={`pasos-lateral__paso pasos-lateral__paso--${estadoPaso}`} aria-current={estadoPaso === 'actual' ? 'step' : undefined}>
              <span className="pasos-lateral__hex">{estadoPaso === 'hecho' ? <Icono nombre="check" tam={18} grosor={3} /> : <Icono nombre={ICONOS[i]} tam={18} />}</span>
              <span className="pasos-lateral__textos">
                <b>{nombre}</b>
                <small>{t(`recorrido.descripcion.${n}`)}</small>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="pasos-lateral__abeja" aria-hidden="true">
        <Abeja tam={64} className="abeja--flota" />
      </div>
      <p className="pasos-lateral__nota">
        <Icono nombre="candado" tam={16} /> {t('recorrido.privacidad')}
      </p>
    </nav>
  );
}

export function Recorrido({ children }: { children: ReactNode }) {
  return (
    <div className="recorrido">
      <div className="solo-movil">
        <Encabezado />
      </div>
      <div className="solo-escritorio">
        <BarraWeb />
      </div>
      <div className="recorrido__cuerpo">
        <aside className="recorrido__lateral solo-escritorio">
          <Pasos />
        </aside>
        <div className="recorrido__contenido">{children}</div>
      </div>
    </div>
  );
}
