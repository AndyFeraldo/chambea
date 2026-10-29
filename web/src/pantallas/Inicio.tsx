// Página principal: portada con un panal vivo, cómo funciona, para quién, a dónde te conecta y aliados.
import { useEffect, useState, type CSSProperties } from 'react';
import QRCode from 'qrcode';
import type { Perfil } from '@shared/tipos';
import { t, textos } from '../i18n';
import { estadoInicial, etiquetaHex, NUM_PREGUNTAS, urlPublica, useApp } from '../estado';
import { Enjambre, Icono, IconoAbeja, Logo, type NombreIcono } from '../componentes/comunes';
import { AbejaVestida } from '../componentes/AbejaVestida';
import { BarraWeb } from '../componentes/Plataforma';
import { Aliados } from '../componentes/Aliados';

const ICONO_PASO: NombreIcono[] = ['micro', 'hexagono', 'adelante', 'check'];
const PERFILES: { id: Perfil; icono: NombreIcono }[] = [
  { id: 'sin_empleo', icono: 'lupa' },
  { id: 'informal', icono: 'ola' },
  { id: 'planilla_riesgo', icono: 'escudo' },
];
const SERVICIOS: { id: string; icono: NombreIcono }[] = [
  { id: 'empleos', icono: 'maletin' },
  { id: 'capacitat', icono: 'libro' },
  { id: 'centros', icono: 'persona' },
  { id: 'certificacion', icono: 'medalla' },
];
// Posición de cada celda del panal de la portada (centro + 6 alrededor), en unidades de celda.
const FLOR: [number, number][] = [
  [0, 0],
  [0, -1],
  [0.75, -0.5],
  [0.75, 0.5],
  [0, 1],
  [-0.75, 0.5],
  [-0.75, -0.5],
];

/** Ilustración de la portada: el panal de una persona con sus abejas y su mejor ruta. */
function PanalVivo() {
  const { datos, comp } = useApp();
  const ejemplo = datos.ocupaciones.find((o) => o.id === 'vendedor_tienda') ?? datos.ocupaciones[0];
  if (!ejemplo) return null;
  const celdas = ejemplo.requeridas.slice(0, 7).map((id) => comp(id)).filter((c) => !!c);
  const total = ejemplo.requeridas.length;
  const tiene = Math.max(1, total - 1);
  return (
    <div className="panal-vivo" aria-hidden="true">
      <div className="panal-vivo__flor">
        {celdas.map((c, i) => (
          <span
            key={c.id}
            className={`panal-vivo__hex hex--${c.dimension} ${i === 4 ? 'panal-vivo__hex--falta' : ''}`}
            style={{ '--x': FLOR[i][0], '--y': FLOR[i][1], '--i': i } as CSSProperties}
          >
            {i === 4 ? '?' : etiquetaHex(c)}
          </span>
        ))}
      </div>
      <span className="panal-vivo__abeja panal-vivo__abeja--1">
        <AbejaVestida ocupacion="vendedor_tienda" tam={112} />
      </span>
      <span className="panal-vivo__abeja panal-vivo__abeja--2">
        <AbejaVestida ocupacion="almacenero" tam={84} />
      </span>
      <span className="panal-vivo__abeja panal-vivo__abeja--3">
        <AbejaVestida ocupacion="ayudante_cocina" tam={70} />
      </span>

      <div className="flotante flotante--cita">
        <span className="flotante__etiqueta">{t('landing.hero.loDemuestra')}</span>
        <q>{t('landing.hero.cita')}</q>
      </div>
      <div className="flotante flotante--ruta">
        <span className="flotante__etiqueta">{t('landing.hero.tuRuta')}</span>
        <b>{ejemplo.nombre}</b>
        <span className="flotante__fila">
          <span>{t('landing.hero.tienes', { x: tiene, y: total })}</span>
          <b>{Math.round((tiene / total) * 100)}%</b>
        </span>
        <span className="barra">
          <span className="barra__lleno" style={{ width: `${(tiene / total) * 100}%` }} />
        </span>
        <span className="flotante__demanda">
          <i /> {t('landing.hero.seBusca')}
        </span>
      </div>
      <div className="flotante flotante--paso">
        <Icono nombre="libro" tam={18} />
        <span>
          <b>{t('landing.hero.primerPaso')}</b>
          <small>{t('landing.hero.curso')}</small>
        </span>
      </div>
    </div>
  );
}

/** QR para abrir Chambea en el celular o la tablet (solo se muestra en pantallas grandes). */
function QrCelular() {
  const [qr, setQr] = useState<string | null>(null);
  const url = urlPublica();
  useEffect(() => {
    let vivo = true;
    // Corrección alta: el QR se sigue leyendo con la abeja en el centro.
    QRCode.toDataURL(url, { margin: 0, width: 264, errorCorrectionLevel: 'H', color: { dark: '#0E1A17', light: '#FFFFFF' } })
      .then((u) => vivo && setQr(u))
      .catch(() => vivo && setQr(null));
    return () => {
      vivo = false;
    };
  }, [url]);
  if (!qr) return null;
  return (
    <aside className="hero__qr" aria-label={t('landing.qr.titulo')}>
      <span className="hero__qr-codigo">
        <img src={qr} alt={t('landing.qr.alt')} width={116} height={116} />
        <span className="hero__qr-abeja" aria-hidden="true">
          <IconoAbeja tam={26} />
        </span>
        <i className="hero__qr-escaneo" aria-hidden="true" />
      </span>
      <span className="hero__qr-texto">
        <span className="etiqueta etiqueta--miel">
          <Icono nombre="celular" tam={14} /> {t('landing.qr.etiqueta')}
        </span>
        <b>{t('landing.qr.titulo')}</b>
        <span>{t('landing.qr.texto')}</span>
        <small>{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</small>
      </span>
    </aside>
  );
}

export function Inicio() {
  const { datos, salud, estado, cambiar, ir, atras } = useApp();
  const hayProgreso =
    estado.historial.length > 0 && (estado.celdas.length > 0 || estado.respuestas.some(Boolean) || estado.perfil !== null);

  const empezar = (asesor: boolean, perfil: Perfil | null = null) => {
    // Empezar de cero (si había un recorrido, se reemplaza; se respeta si quiere guardar y su cuenta).
    cambiar({ ...estadoInicial(estado.regionId), guardar: estado.guardar, cuenta: estado.cuenta, asesor, perfil, lugar: estado.lugar });
    ir(perfil ? 'ocupacion' : 'situacion');
  };

  const cargarCaso = (id: string) => {
    const caso = datos.casos.find((c) => c.id === id);
    if (!caso) return;
    const respuestas = Array.from({ length: NUM_PREGUNTAS }, (_, i) => caso.respuestas[i] ?? '');
    cambiar({
      ...estadoInicial(caso.region_id),
      lugar: estado.lugar,
      cuenta: estado.cuenta,
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
    <div className="landing">
      <BarraWeb />

      {/* ---------- Portada ---------- */}
      <section className="hero">
        <div className="hero__fondo" aria-hidden="true" />
        <Enjambre cantidad={4} />
        <div className="hero__interior">
          <div className="hero__texto entrar">
            <span className="hero__sobre">
              <i className="marca-al__bandera" aria-hidden="true" /> {t('landing.hero.sobre')}
            </span>
            <h1 className="hero__titulo">
              {t('landing.hero.titulo1')} <em>{t('landing.hero.titulo2')}</em>
            </h1>
            <p className="hero__lead">{t('landing.hero.lead')}</p>

            <div className="hero__acciones">
              {hayProgreso && (
                <button type="button" className="boton boton--primario boton--grande" onClick={atras}>
                  <Icono nombre="guardar" /> {t('inicio.continuar')}
                </button>
              )}
              <button type="button" className="boton boton--miel boton--grande" onClick={() => empezar(false)}>
                {hayProgreso ? t('inicio.empezarNuevo') : t('landing.hero.empezar')} <Icono nombre="adelante" />
              </button>
              <button type="button" className="boton boton--claro" onClick={() => empezar(true)}>
                <Icono nombre="persona" tam={20} /> {t('inicio.conAsesor')}
              </button>
            </div>

            <div className="hero__opciones">
              <label className="hero__region">
                <Icono nombre="ubicacion" tam={18} />
                <span className="solo-lector">{t('inicio.region')}</span>
                <select id="region" value={estado.regionId} onChange={(e) => cambiar({ regionId: e.target.value })}>
                  {datos.regiones.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </label>
              {datos.casos.length > 0 && (
                <span className="hero__demo">
                  {t('inicio.demo')}
                  {datos.casos.map((c) => (
                    <button key={c.id} type="button" onClick={() => cargarCaso(c.id)}>
                      {c.nombre.replace(/\s*\(.*\)/, '')}
                    </button>
                  ))}
                </span>
              )}
            </div>

            <ul className="hero__garantias">
              {textos.landing.hero.garantias.map((g) => (
                <li key={g}>
                  <Icono nombre="check" tam={16} grosor={3} /> {g}
                </li>
              ))}
            </ul>

            <QrCelular />
          </div>
          <PanalVivo />
        </div>
        <div className="hero__aliados">
          <Aliados variante="franja" />
        </div>
      </section>

      {/* ---------- El problema en un número ---------- */}
      <section className="cifras">
        <div className="landing__interior cifras__interior">
          <div className="cifra cifra--grande">
            <b>
              7<small>/10</small>
            </b>
            <span>{t('landing.cifras.informal')}</span>
          </div>
          <div className="cifra">
            <b>{datos.ocupaciones.length}</b>
            <span>{t('landing.cifras.oficios')}</span>
          </div>
          <div className="cifra">
            <b>{datos.competencias.length}</b>
            <span>{t('landing.cifras.habilidades')}</span>
          </div>
          <div className="cifra">
            <b>{datos.regiones.length}</b>
            <span>{t('landing.cifras.regiones')}</span>
          </div>
        </div>
      </section>

      {/* ---------- Así funciona ---------- */}
      <section className="landing__seccion" aria-labelledby="como">
        <div className="landing__interior">
          <span className="etiqueta">{t('landing.como.etiqueta')}</span>
          <h2 id="como">{t('landing.como.titulo')}</h2>
          <ol className="como">
            {textos.landing.como.pasos.map((p, i) => (
              <li key={p.titulo} className="como__paso aparecer" style={{ '--i': i } as CSSProperties}>
                <span className="como__hex">
                  <Icono nombre={ICONO_PASO[i]} tam={26} />
                  <small>{i + 1}</small>
                </span>
                <span className="como__momento">{p.momento}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Para quién ---------- */}
      <section className="landing__seccion landing__seccion--crema" aria-labelledby="para-quien">
        <div className="landing__interior">
          <span className="etiqueta">{t('landing.quien.etiqueta')}</span>
          <h2 id="para-quien">{t('inicio.paraQuien')}</h2>
          <p className="landing__lead">{t('inicio.paraQuienTexto')}</p>
          <div className="quien">
            {PERFILES.map((p) => (
              <button key={p.id} type="button" className="quien__tarjeta" onClick={() => empezar(false, p.id)}>
                <span className="quien__icono">
                  <Icono nombre={p.icono} tam={28} />
                </span>
                <b>{t(`situacion.opciones.${p.id}`)}</b>
                <span>{t(`landing.quien.${p.id}`)}</span>
                <span className="quien__ir">
                  {t('landing.quien.empezar')} <Icono nombre="adelante" tam={18} />
                </span>
              </button>
            ))}
          </div>
          <div className="oficios-cinta" aria-label={t('landing.quien.oficios')}>
            {datos.ocupaciones.map((o) => (
              <span key={o.id} className="oficios-cinta__item">
                <AbejaVestida ocupacion={o.id} tam={40} />
                {o.nombre}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- A dónde te conecta ---------- */}
      <section className="landing__seccion" aria-labelledby="conecta">
        <div className="landing__interior conecta">
          <div className="conecta__texto">
            <span className="etiqueta">{t('landing.conecta.etiqueta')}</span>
            <h2 id="conecta">{t('landing.conecta.titulo')}</h2>
            <p className="landing__lead">{t('landing.conecta.texto')}</p>
            <ul className="conecta__garantias">
              <li>
                <Icono nombre="edificio" tam={20} /> {t('landing.conecta.gobpe')}
              </li>
              <li>
                <Icono nombre="candado" tam={20} /> {t('landing.conecta.qvac')}
              </li>
              <li>
                <Icono nombre="chat" tam={20} /> {t('landing.conecta.keet')}
              </li>
            </ul>
          </div>
          <div className="conecta__mapa">
            <span className="conecta__centro">
              <Logo oscuro tam={22} />
            </span>
            {SERVICIOS.map((s, i) => (
              <div key={s.id} className={`conecta__nodo conecta__nodo--${i + 1}`}>
                <span className="conecta__icono">
                  <Icono nombre={s.icono} tam={22} />
                </span>
                <b>{t(`landing.conecta.servicios.${s.id}.nombre`)}</b>
                <small>{t(`landing.conecta.servicios.${s.id}.texto`)}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Para empresas ---------- */}
      <section className="landing__seccion landing__seccion--oscura" aria-labelledby="empresas">
        <div className="landing__interior empresas">
          <div>
            <span className="etiqueta etiqueta--miel">{t('landing.empresas.etiqueta')}</span>
            <h2 id="empresas">{t('landing.empresas.titulo')}</h2>
            <p>{t('landing.empresas.texto')}</p>
          </div>
          <div className="empresas__acciones">
            <button type="button" className="boton boton--miel" onClick={() => ir('banco')}>
              {t('landing.empresas.ver')} <Icono nombre="adelante" />
            </button>
            <button type="button" className="boton boton--claro" onClick={() => ir(estado.cuenta ? 'unirse' : 'cuenta', 0)}>
              {t('landing.empresas.unirme')}
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Aliados ---------- */}
      <section className="landing__seccion" aria-labelledby="aliados">
        <div className="landing__interior">
          <span className="etiqueta">{t('aliados.etiqueta')}</span>
          <h2 id="aliados">{t('aliados.tituloSeccion')}</h2>
          <Aliados variante="seccion" />
        </div>
      </section>

      <footer className="pie-landing">
        <div className="landing__interior pie-landing__interior">
          <div>
            <Logo oscuro tam={24} />
            <p>{t('marca.eslogan')}</p>
          </div>
          <div className="pie-landing__notas">
            <p>
              <Icono nombre="candado" tam={16} /> {t('landing.pie.privacidad')}
            </p>
            <p>{t('aliados.aviso')}</p>
            <p>
              <span className="ia-estado" title={ia.detalle}>
                {textoIA}
              </span>
              {datos.ilustrativo && ` · ${t('comun.notaIlustrativa')}`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
