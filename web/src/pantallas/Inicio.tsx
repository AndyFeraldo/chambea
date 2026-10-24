import { t, textos } from '../i18n';
import { estadoInicial, NUM_PREGUNTAS, useApp } from '../estado';
import { Icono, Logo, NotaIlustrativa } from '../componentes/comunes';

export function Inicio() {
  const { datos, salud, estado, cambiar, ir } = useApp();

  const empezar = (asesor: boolean) => {
    cambiar({ asesor });
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
    });
    ir('situacion');
  };

  const ia = salud.ia;
  const textoIA =
    salud.modo === 'navegador'
      ? t('ia.local')
      : ia.proveedor === 'qvac'
        ? ia.conectado
          ? t('ia.qvac')
          : t('ia.qvacCaido')
        : t('ia.mock');

  return (
    <>
      <section className="portada">
        <div className="contenedor portada__contenido">
          <Logo oscuro tam={40} />
          <h1 className="portada__eslogan">{t('marca.eslogan')}</h1>
          <p className="portada__texto">{t('marca.queHace')}</p>

          <div className="pila-chica">
            <label htmlFor="region">{t('inicio.region')}</label>
            <select
              id="region"
              className="selector"
              value={estado.regionId}
              onChange={(e) => cambiar({ regionId: e.target.value })}
            >
              {datos.regiones.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="boton boton--miel" onClick={() => empezar(false)}>
            {t('inicio.empezar')}
          </button>
          <button type="button" className="boton boton--en-oscuro" onClick={() => empezar(true)}>
            <Icono nombre="persona" /> {t('inicio.conAsesor')}
          </button>
          <span className={`ia-estado ${ia.proveedor === 'qvac' && !ia.conectado ? 'ia-estado--aviso' : ''}`} title={ia.detalle}>
            {textoIA}
          </span>
        </div>
      </section>

      <main className="contenedor pantalla">
        <h2>{t('inicio.comoFunciona')}</h2>
        <div className="pasos-mini">
          {textos.inicio.pasos.map((p, i) => (
            <div className="paso-mini" key={p.titulo}>
              <span className="num-hex">{i + 1}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </div>
          ))}
        </div>

        <p className="aviso-cert">
          <Icono nombre="candado" tam={22} />
          <span>{t('inicio.privacidad')}</span>
        </p>

        {datos.casos.length > 0 && (
          <div className="pila">
            <div className="pila-chica">
              <h3>{t('inicio.demoTitulo')}</h3>
              <p className="ayuda">{t('inicio.demoTexto')}</p>
            </div>
            <div className="demo-casos">
              {datos.casos.map((c) => (
                <button key={c.id} type="button" className="boton boton--secundario" onClick={() => cargarCaso(c.id)}>
                  {c.nombre.replace(/\s*\(.*\)/, '')}
                </button>
              ))}
            </div>
          </div>
        )}
        <NotaIlustrativa />
      </main>
    </>
  );
}
