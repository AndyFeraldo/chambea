import { useState } from 'react';
import type { Dimension } from '@shared/tipos';
import { t } from '../i18n';
import { useApp } from '../estado';
import { generarImagen } from '../imagenPanal';
import { AvisoCertificacion, Enjambre, Logo, Pantalla } from '../componentes/comunes';
import { Colmena, Leyenda, ordenar } from './Panal';

const PRIORIDAD: Dimension[] = ['competencia', 'cualidad', 'habilidad', 'conocimiento'];

export function Resumen() {
  const { datos, estado, comp, reiniciar } = useApp();
  const [imagen, setImagen] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const ruta = estado.rutas?.rutas.find((r) => r.ocupacion_id === estado.rutaElegida) ?? null;
  const region = datos.regiones.find((r) => r.id === estado.regionId)?.nombre ?? '';
  const paso = estado.primerPaso?.principal;

  // Las 2 frases que mejor muestran la confianza que se ganó (logros y cualidades primero).
  const vistas = new Set<string>();
  const frases = [...estado.celdas]
    .filter((c) => c.evidencia)
    .sort((a, b) => PRIORIDAD.indexOf(a.dimension) - PRIORIDAD.indexOf(b.dimension))
    .filter((c) => !vistas.has(c.evidencia!) && vistas.add(c.evidencia!))
    .slice(0, 2);

  const descargar = async () => {
    setGenerando(true);
    const url = await generarImagen({ celdas: estado.celdas, comp, ruta, paso: estado.primerPaso, region });
    setImagen(url);
    setGenerando(false);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mi-panal-chambea.png';
    a.click();
  };

  return (
    <Pantalla>
      <article className="tarjeta-panal revelar">
        <div className="tarjeta-panal__cabeza">
          <Enjambre cantidad={2} />
          <Logo oscuro tam={20} />
          <h1>{t('resumen.titulo')}</h1>
          <span className="tarjeta-panal__region">{region}</span>
        </div>
        <div className="tarjeta-panal__cuerpo">
          <Colmena chica celdas={ordenar(estado.celdas)} />
          <Leyenda />
          {frases.map((c) => (
            <p key={c.id} className="evidencia">
              «{c.evidencia}»
            </p>
          ))}
          <div className="resumen-filas">
            {ruta && (
              <div className="resumen-fila">
                <span className="etiqueta">{t('resumen.miRuta')}</span>
                <b>{ruta.nombre}</b>
                <span className="ayuda">{t('rutas.tienes', { x: ruta.tiene.length, y: ruta.tiene.length + ruta.faltan.length })}</span>
              </div>
            )}
            {paso && (
              <div className="resumen-fila">
                <span className="etiqueta">{t('resumen.miPaso')}</span>
                <b>{paso.titulo}</b>
                <span className="ayuda">{paso.detalle}</span>
              </div>
            )}
          </div>
          <p className="nota">{t('comun.preliminar')}</p>
        </div>
      </article>

      <button type="button" className="boton boton--miel boton--grande" onClick={descargar} disabled={generando}>
        {generando ? t('resumen.generando') : t('resumen.descargar')}
      </button>
      {imagen && (
        <div className="pila-chica">
          <p className="ayuda">{t('resumen.guardarImagen')}</p>
          <img className="imagen-panal" src={imagen} alt={t('resumen.titulo')} />
        </div>
      )}
      <AvisoCertificacion />

      {confirmando ? (
        <div className="confirmar" role="alertdialog" aria-label={t('resumen.reiniciarSeguro')}>
          <p>{t('resumen.reiniciarSeguro')}</p>
          <div className="fila-botones">
            <button type="button" className="boton boton--secundario" onClick={() => setConfirmando(false)}>
              {t('resumen.reiniciarNo')}
            </button>
            <button type="button" className="boton boton--primario" onClick={reiniciar}>
              {t('resumen.reiniciarSi')}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="boton boton--fantasma" onClick={() => setConfirmando(true)}>
          {t('resumen.reiniciar')}
        </button>
      )}
    </Pantalla>
  );
}
