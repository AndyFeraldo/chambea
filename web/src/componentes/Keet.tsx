// Botón para abrir la sala Keet del Centro de Empleo (o explicar que falta configurarla).
import { useState } from 'react';
import { t } from '../i18n';
import { useApp } from '../estado';
import { DESCARGAR_KEET, salaKeet } from '../keet';
import { Icono } from './comunes';

export function SalaKeet({ texto, copiar, compacto = false }: { texto: string; copiar?: string; compacto?: boolean }) {
  const { datos, estado } = useApp();
  const sala = salaKeet(datos, estado.cuenta?.regionId ?? estado.regionId);
  const [copiado, setCopiado] = useState(false);
  const abrir = async () => {
    if (!copiar) return;
    try {
      await navigator.clipboard.writeText(copiar);
      setCopiado(true);
    } catch {
      // Sin portapapeles: la sala se abre igual.
    }
  };
  return (
    <div className={`keet ${compacto ? 'keet--compacto' : ''}`}>
      <div className="keet__cabeza">
        <span className="keet__marca" aria-hidden="true">keet</span>
        <span className="keet__que">{t('keet.que')}</span>
      </div>
      {sala ? (
        <a className="boton boton--keet boton--compacto" href={sala} onClick={abrir}>
          <Icono nombre="chat" tam={18} /> {texto}
        </a>
      ) : (
        <p className="keet__pendiente">
          <Icono nombre="reloj" tam={16} /> {t('keet.porConfigurar')}
        </p>
      )}
      {copiar && sala && <small className="keet__ayuda">{copiado ? t('keet.copiado') : t('keet.ayudaCopiar')}</small>}
      <a className="keet__descargar" href={DESCARGAR_KEET} target="_blank" rel="noopener noreferrer">
        {t('keet.descargar')}
      </a>
    </div>
  );
}
