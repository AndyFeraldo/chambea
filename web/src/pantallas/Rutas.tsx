import { useState, type CSSProperties } from 'react';
import type { Ruta } from '@shared/tipos';
import { t } from '../i18n';
import { useApp } from '../estado';
import { Icono, ICONO_OCUPACION, NotaIlustrativa, Pantalla } from '../componentes/comunes';
import { Colmena, ordenar, type CeldaVisual } from './Panal';

function celdasDeRuta(r: Ruta, dimension: (id: string) => CeldaVisual['dimension']): CeldaVisual[] {
  // Primero lo que ya tiene, al final lo que falta (como en el flyer).
  return [
    ...ordenar(r.tiene.map((id) => ({ id, dimension: dimension(id) }))),
    ...r.faltan.map((id) => ({ id, dimension: dimension(id), falta: true })),
  ];
}

export function Rutas() {
  const { estado, cambiar, ir, comp } = useApp();
  const resultado = estado.rutas;
  const [elegida, setElegida] = useState<string | null>(estado.rutaElegida ?? resultado?.rutas[0]?.ocupacion_id ?? null);
  if (!resultado) return null;

  const ruta = resultado.rutas.find((r) => r.ocupacion_id === elegida) ?? resultado.rutas[0];
  const otras = resultado.rutas.filter((r) => r !== ruta);
  const irAlPaso = (id: string | null) => {
    cambiar({ rutaElegida: id, primerPaso: null, horas: null, modalidad: null, costo: null });
    ir('paso', 0);
  };

  return (
    <Pantalla>
      <h1>{t('rutas.titulo')}</h1>

      {resultado.aviso_demanda && (
        <p className="alerta" role="alert">
          <Icono nombre="alerta" tam={20} />
          {t('rutas.avisoDemanda', { ocupacion: resultado.aviso_demanda.nombre })}
        </p>
      )}

      {!ruta ? (
        <div className="pila">
          <p className="aviso-cert">{t('rutas.ninguna')}</p>
          <button type="button" className="boton boton--primario" onClick={() => irAlPaso(null)}>
            {t('rutas.irAsesor')}
          </button>
        </div>
      ) : (
        <>
          <section key={ruta.ocupacion_id} className="ruta-hero entrar">
            <p className="ruta-hero__lema">
              {t('rutas.celdasPara', { x: ruta.tiene.length, y: ruta.tiene.length + ruta.faltan.length })}
            </p>
            <h2 className="ruta-hero__nombre">{ruta.nombre}</h2>
            <Colmena chica celdas={celdasDeRuta(ruta, (id) => comp(id)?.dimension ?? 'habilidad')} />
            <div className="ruta-hero__datos">
              {ruta.demanda && <span className={`demanda demanda--${ruta.demanda}`}>{t(`rutas.demanda.${ruta.demanda}`)}</span>}
              {ruta.alias.length > 0 && (
                <p className="alias">
                  {t('rutas.alias')} <b>{ruta.alias.slice(0, 2).join(' · ')}</b>
                </p>
              )}
              {ruta.requisitos_minimos.length > 0 && (
                <p className="alias">
                  {t('rutas.requisitos')} {ruta.requisitos_minimos.join(' · ')}
                </p>
              )}
            </div>
            <button type="button" className="boton boton--miel boton--grande" onClick={() => irAlPaso(ruta.ocupacion_id)}>
              {t('rutas.elegir')} <Icono nombre="adelante" />
            </button>
          </section>

          {otras.length > 0 && (
            <div className="pila">
              <h3>{t('rutas.otras')}</h3>
              {otras.map((r, i) => {
                const total = r.tiene.length + r.faltan.length;
                return (
                  <button
                    key={r.ocupacion_id}
                    type="button"
                    className="ruta-fila aparecer"
                    style={{ '--i': i + 2 } as CSSProperties}
                    onClick={() => setElegida(r.ocupacion_id)}
                  >
                    <span className="ruta-fila__icono">
                      <Icono nombre={ICONO_OCUPACION[r.ocupacion_id] ?? 'hexagono'} />
                    </span>
                    <span className="ruta-fila__texto">
                      <span className="ruta-fila__nombre">{r.nombre}</span>
                      <span className="barra" aria-hidden="true">
                        <span className="barra__lleno" style={{ width: `${(r.tiene.length / total) * 100}%` }} />
                      </span>
                    </span>
                    <span className="ruta-fila__cuenta">{t('rutas.tienes', { x: r.tiene.length, y: total })}</span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
      <NotaIlustrativa />
    </Pantalla>
  );
}
