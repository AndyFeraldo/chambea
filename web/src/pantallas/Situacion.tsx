import type { Perfil } from '@shared/tipos';
import { t } from '../i18n';
import { useApp } from '../estado';
import { Pantalla } from '../componentes/comunes';

const PERFILES: Perfil[] = ['sin_empleo', 'informal', 'planilla_riesgo'];

export function Situacion() {
  const { estado, cambiar, ir } = useApp();
  return (
    <Pantalla>
      <div className="pila-chica">
        <h1>{t('situacion.titulo')}</h1>
        <p className="ayuda">{t('situacion.ayuda')}</p>
      </div>
      <div className="pila" role="group" aria-label={t('situacion.titulo')}>
        {PERFILES.map((p) => (
          <button
            key={p}
            type="button"
            className="opcion"
            aria-pressed={estado.perfil === p}
            onClick={() => {
              cambiar({ perfil: p });
              ir('ocupacion');
            }}
          >
            {t(`situacion.opciones.${p}`)}
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
      <div className="pila-chica">
        <h1>{t('ocupacion.titulo')}</h1>
        <p className="ayuda">{t('ocupacion.ayuda')}</p>
      </div>
      <div className="pila" role="group" aria-label={t('ocupacion.titulo')}>
        {datos.ocupaciones.map((o) => (
          <button
            key={o.id}
            type="button"
            className="opcion"
            aria-pressed={estado.ocupacionActual === o.id}
            onClick={() => elegir(o.id)}
          >
            {o.nombre}
          </button>
        ))}
        <button
          type="button"
          className="opcion"
          onClick={() => elegir(null)}
        >
          {t('ocupacion.otro')}
        </button>
      </div>
    </Pantalla>
  );
}
