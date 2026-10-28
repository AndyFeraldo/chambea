import type { CSSProperties } from 'react';
import { t, textos } from '../i18n';
import { estadoInicial, NUM_PREGUNTAS, useApp } from '../estado';
import { Enjambre, Icono, Logo, type NombreIcono } from '../componentes/comunes';

const ICONO_PASO: NombreIcono[] = ['micro', 'hexagono', 'adelante', 'check'];

export function Inicio() {
  const { datos, salud, estado, cambiar, ir, atras } = useApp();
  const hayProgreso =
    estado.historial.length > 0 && (estado.celdas.length > 0 || estado.respuestas.some(Boolean) || estado.perfil !== null);

  const empezar = (asesor: boolean) => {
    // Empezar de cero (si había un recorrido, se reemplaza; se respeta si quiere guardar).
    cambiar({ ...estadoInicial(estado.regionId), guardar: estado.guardar, asesor, lugar: estado.lugar });
    ir('situacion');
  };

  const cargarCaso = (id: string) => {
    const caso = datos.casos.find((c) => c.id === id);
    if (!caso) return;
    const respuestas = Array.from({ length: NUM_PREGUNTAS }, (_, i) => caso.respuestas[i] ?? '');
    cambiar({
      ...estadoInicial(caso.region_id),
      lugar: estado.lugar,
      demo: caso.id,
      perfil: caso.perfil,
      ocupacionActual: caso.ocupacion_actual,
      respuestas,
      intereses: caso.intereses ?? [],
      evitar: caso.evitar ?? [],
    });
    ir('situacion');
  };

  const ia = salud.ia;
  const textoIA =
    salud.modo === 'navegador' ? t('ia.local') : ia.proveedor === 'qvac' ? (ia.conectado ? t('ia.qvac') : t('ia.qvacCaido')) : t('ia.mock');

  return (
    <div className="inicio entrar">
      <section className="portada">
        <Enjambre cantidad={3} />
        <div className="contenedor portada__contenido">
          <Logo oscuro tam={42} />
          <h1 className="portada__eslogan">{t('marca.eslogan')}</h1>
          <p className="portada__texto">{t('marca.queHace')}</p>

          <ol className="pasos-hex" aria-label="Así funciona">
            {textos.inicio.pasos.map((p, i) => (
              <li key={p} style={{ '--i': i } as CSSProperties}>
                <span className="pasos-hex__hex">
                  <Icono nombre={ICONO_PASO[i]} tam={22} />
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <main className="contenedor pantalla inicio__acciones">
        <label className="selector-region">
          <span>{t('inicio.region')}</span>
          <select id="region" className="selector" value={estado.regionId} onChange={(e) => cambiar({ regionId: e.target.value })}>
            {datos.regiones.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </label>

        {hayProgreso && (
          <button type="button" className="boton boton--primario boton--grande" onClick={atras}>
            <Icono nombre="guardar" /> {t('inicio.continuar')}
          </button>
        )}
        <button type="button" className="boton boton--miel boton--grande" onClick={() => empezar(false)}>
          {hayProgreso ? t('inicio.empezarNuevo') : t('inicio.empezar')} <Icono nombre="adelante" />
        </button>
        <button type="button" className="boton boton--fantasma" onClick={() => empezar(true)}>
          <Icono nombre="persona" tam={20} /> {t('inicio.conAsesor')}
        </button>

        {datos.casos.length > 0 && (
          <div className="demo-casos">
            <span>{t('inicio.demo')}</span>
            {datos.casos.map((c) => (
              <button key={c.id} type="button" className="chip chip--chico" onClick={() => cargarCaso(c.id)}>
                {c.nombre.replace(/\s*\(.*\)/, '')}
              </button>
            ))}
          </div>
        )}

        <section className="para-quien" aria-labelledby="para-quien">
          <h2 id="para-quien">{t('inicio.paraQuien')}</h2>
          <p className="ayuda">{t('inicio.paraQuienTexto')}</p>
          <div className="para-quien__perfiles">
            {(['sin_empleo', 'informal', 'planilla_riesgo'] as const).map((p, i) => (
              <span key={p} className="para-quien__perfil">
                <span className="num-hex">{i + 1}</span>
                {t(`inicio.perfiles.${p}`)}
              </span>
            ))}
          </div>
          <p className="para-quien__oficios">
            <b>{t('inicio.empezamosCon')}</b> {t('inicio.oficiosPriorizados')}
          </p>
        </section>

        <p className="pie-privacidad">
          <Icono nombre="candado" tam={16} /> {t('inicio.privacidad')}
        </p>
        <p className="nota">
          <span className="ia-estado" title={ia.detalle}>
            {textoIA}
          </span>
          {datos.ilustrativo && ` · ${t('comun.notaIlustrativa')}`}
        </p>
      </main>
    </div>
  );
}
