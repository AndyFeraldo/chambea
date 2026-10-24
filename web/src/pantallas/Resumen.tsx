import { useState } from 'react';
import { t } from '../i18n';
import { ORDEN_DIMENSIONES, useApp } from '../estado';
import { generarImagen } from '../imagenPanal';
import { AvisoCertificacion, Icono, NotaIlustrativa, Pantalla } from '../componentes/comunes';
import { COLOR_DIM, Colmena } from './Panal';

export function Resumen() {
  const { datos, estado, comp, reiniciar } = useApp();
  const [imagen, setImagen] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const ruta = estado.rutas?.rutas.find((r) => r.ocupacion_id === estado.rutaElegida) ?? null;
  const region = datos.regiones.find((r) => r.id === estado.regionId)?.nombre ?? '';
  const paso = estado.primerPaso?.principal;
  const celdas = [...estado.celdas].sort(
    (a, b) => ORDEN_DIMENSIONES.indexOf(a.dimension) - ORDEN_DIMENSIONES.indexOf(b.dimension),
  );

  const descargar = async () => {
    setGenerando(true);
    const url = await generarImagen({ celdas: estado.celdas, comp, ruta, paso: estado.primerPaso, region });
    setImagen(url);
    setGenerando(false);
    // Descarga directa (en algunos visores no se permite: por eso también mostramos la imagen).
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mi-panal-chambea.png';
    a.click();
  };

  return (
    <Pantalla>
      <div className="pila-chica">
        <h1>{t('resumen.titulo')}</h1>
        <p className="ayuda">{t('resumen.ayuda')}</p>
      </div>

      <article className="tarjeta-panal">
        <div className="tarjeta-panal__cabeza">
          <span className="logo logo--oscuro">
            <span className="logo__palabra" style={{ fontSize: 22 }}>
              <span className="logo__cham">cham</span>
              <span className="logo__bea">bea</span>
            </span>
          </span>
          <span style={{ fontSize: '0.9rem', color: '#b9c8c3' }}>{region}</span>
        </div>
        <div className="tarjeta-panal__cuerpo">
          <Colmena celdas={estado.celdas} />
          <section className="tarjeta-panal__seccion">
            <span className="etiqueta">{t('resumen.competencias')}</span>
            {celdas.map((c) => (
              <div key={c.id} className="resumen-comp">
                <span className="celda__marca" style={{ background: COLOR_DIM[c.dimension] }} />
                <div>
                  {comp(c.id)?.nombre_simple}
                  {c.confirmada && <span style={{ color: 'var(--verde-oscuro)', fontWeight: 700 }}> ✓</span>}
                  {c.evidencia && <small>{t('panal.loDemuestra')} «{c.evidencia}»</small>}
                </div>
              </div>
            ))}
          </section>
          <section className="tarjeta-panal__seccion">
            <span className="etiqueta">{t('resumen.miRuta')}</span>
            <h3>{ruta?.nombre ?? '—'}</h3>
            {ruta && (
              <p className="ayuda">
                {t('rutas.tienes', { x: ruta.tiene.length, y: ruta.tiene.length + ruta.faltan.length })}
              </p>
            )}
          </section>
          {paso && (
            <section className="tarjeta-panal__seccion">
              <span className="etiqueta">{t('resumen.miPaso')}</span>
              <h3>{paso.titulo}</h3>
              <p className="ayuda">{paso.detalle}</p>
            </section>
          )}
          <p className="nota" style={{ textAlign: 'left' }}>
            {t('comun.preliminar')}
          </p>
        </div>
      </article>

      <AvisoCertificacion />

      <button type="button" className="boton boton--primario" onClick={descargar} disabled={generando}>
        {generando ? t('resumen.generando') : t('resumen.descargar')}
      </button>
      {imagen && (
        <div className="pila-chica">
          <p className="ayuda">{t('resumen.guardarImagen')}</p>
          <img className="imagen-panal" src={imagen} alt={t('resumen.titulo')} />
        </div>
      )}

      <NotaIlustrativa />

      {confirmando ? (
        <div className="confirmar" role="alertdialog" aria-label={t('resumen.reiniciarSeguro')}>
          <p>{t('resumen.reiniciarSeguro')}</p>
          <button type="button" className="boton boton--primario" onClick={reiniciar}>
            {t('resumen.reiniciarSi')}
          </button>
          <button type="button" className="boton boton--secundario" onClick={() => setConfirmando(false)}>
            {t('resumen.reiniciarNo')}
          </button>
        </div>
      ) : (
        <button type="button" className="boton boton--secundario" onClick={() => setConfirmando(true)}>
          <Icono nombre="atras" /> {t('resumen.reiniciar')}
        </button>
      )}
    </Pantalla>
  );
}
