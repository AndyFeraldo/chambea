import { useState } from 'react';
import { t } from '../i18n';
import { useApp } from '../estado';
import { Icono, NotaIlustrativa, Pantalla } from '../componentes/comunes';

export function Rutas() {
  const { estado, cambiar, ir, comp } = useApp();
  const resultado = estado.rutas;
  const [abierta, setAbierta] = useState<string | null>(estado.rutaElegida ?? resultado?.rutas[0]?.ocupacion_id ?? null);

  if (!resultado) return null;

  const elegir = (id: string | null) => {
    cambiar({ rutaElegida: id, primerPaso: null });
    ir('paso');
  };

  return (
    <Pantalla>
      <div className="pila-chica">
        <h1>{t('rutas.titulo')}</h1>
        <p className="ayuda">{t('rutas.ayuda')}</p>
      </div>

      {resultado.aviso_demanda && (
        <p className="alerta" role="alert">
          <Icono nombre="alerta" tam={22} />
          <span>
            {t('rutas.avisoDemanda', {
              ocupacion: resultado.aviso_demanda.nombre.toLowerCase(),
              region: resultado.aviso_demanda.region,
            })}
          </span>
        </p>
      )}

      {resultado.rutas.length === 0 && (
        <div className="pila">
          <p className="aviso-cert">{t('rutas.ninguna')}</p>
          <button type="button" className="boton boton--primario" onClick={() => elegir(null)}>
            {t('rutas.irAsesor')}
          </button>
        </div>
      )}

      <div className="pila">
        {resultado.rutas.map((r) => {
          const total = r.tiene.length + r.faltan.length;
          const expandida = abierta === r.ocupacion_id;
          return (
            <div key={r.ocupacion_id} className="ruta" aria-expanded={expandida}>
              <button
                type="button"
                className="pila"
                style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}
                aria-expanded={expandida}
                onClick={() => setAbierta(expandida ? null : r.ocupacion_id)}
              >
                <span className="ruta__cabeza">
                  <span className="ruta__nombre">{r.nombre}</span>
                  <span className="ruta__tienes">{t('rutas.tienes', { x: r.tiene.length, y: total })}</span>
                </span>
                <span className="barra" aria-hidden="true">
                  <span className="barra__lleno" style={{ width: `${(r.tiene.length / total) * 100}%`, display: 'block' }} />
                </span>
                {r.demanda && <span className={`demanda demanda--${r.demanda}`}>{t(`rutas.demanda.${r.demanda}`)}</span>}
                {r.alias.length > 0 && (
                  <span className="alias">
                    <b>{t('rutas.alias')}</b> {r.alias.join(' · ')}
                  </span>
                )}
              </button>

              {expandida && (
                <div className="detalle">
                  <div className="pila-chica">
                    <span className="etiqueta">{t('rutas.yaTienes')}</span>
                    <ul className="lista-check">
                      {r.tiene.map((id) => (
                        <li key={id} className="si">
                          <span className="punto punto--si">✓</span>
                          {comp(id)?.nombre_simple}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pila-chica">
                    <span className="etiqueta">{t('rutas.teFalta')}</span>
                    {r.faltan.length === 0 ? (
                      <p>{t('rutas.nadaFalta')}</p>
                    ) : (
                      <ul className="lista-check">
                        {r.faltan.map((id) => (
                          <li key={id} className="no">
                            <span className="punto punto--no">○</span>
                            {comp(id)?.nombre_simple}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {r.requisitos_minimos.length > 0 && (
                    <p className="alias">
                      <b>{t('rutas.requisitos')}</b> {r.requisitos_minimos.join(' · ')}
                    </p>
                  )}
                  <button type="button" className="boton boton--primario" onClick={() => elegir(r.ocupacion_id)}>
                    {t('rutas.elegir')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <NotaIlustrativa />
    </Pantalla>
  );
}
