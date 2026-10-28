import { useState } from 'react';
import QRCode from 'qrcode';
import type { Dimension } from '@shared/tipos';
import { nombreHabilidad } from '@shared/motor';
import { t } from '../i18n';
import { enlaceCompartir, useApp, type PanalCompartido } from '../estado';
import { generarImagen } from '../imagenPanal';
import { AvisoCertificacion, Enjambre, Icono, Logo, Pantalla } from '../componentes/comunes';
import { Colmena, Leyenda, ordenar } from './Panal';
import { enlacesOfertas } from './Rutas';

const PRIORIDAD: Dimension[] = ['competencia', 'cualidad', 'habilidad', 'conocimiento'];

/** Copia al portapapeles; si el navegador no deja, selecciona el texto para copiarlo a mano. */
function useCopiar() {
  const [copiado, setCopiado] = useState<string | null>(null);
  const copiar = async (clave: string, texto: string, respaldo?: HTMLElement | null) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      if (respaldo) {
        const r = document.createRange();
        r.selectNodeContents(respaldo);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }
    }
  };
  return { copiado, copiar };
}

export function Resumen() {
  const { datos, salud, estado, comp, cambiar, ir, reiniciar } = useApp();
  const [imagen, setImagen] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const { copiado, copiar } = useCopiar();

  const ruta = estado.rutas?.rutas.find((r) => r.ocupacion_id === estado.rutaElegida) ?? null;
  const ocupacion = datos.ocupaciones.find((o) => o.id === estado.rutaElegida);
  const actual = datos.ocupaciones.find((o) => o.id === estado.ocupacionActual);
  const region = datos.regiones.find((r) => r.id === estado.regionId)?.nombre ?? '';
  const principal = estado.primerPaso?.principal;

  // Las 2 frases que mejor muestran la confianza que se ganó (logros y cualidades primero).
  const vistas = new Set<string>();
  const frases = [...estado.celdas]
    .filter((c) => c.evidencia)
    .sort((a, b) => PRIORIDAD.indexOf(a.dimension) - PRIORIDAD.indexOf(b.dimension))
    .filter((c) => !vistas.has(c.evidencia!) && vistas.add(c.evidencia!))
    .slice(0, 2);

  // ---- Texto para presentarse (sin CV) ----
  const fuertes = [...estado.celdas]
    .sort((a, b) => PRIORIDAD.indexOf(a.dimension) - PRIORIDAD.indexOf(b.dimension))
    .slice(0, 4)
    .map((c) => nombreHabilidad(comp(c.id), c.id).toLowerCase());
  const presentacion = [
    t('resumen.carta.hola', { oficio: actual ? actual.nombre.toLowerCase() : t('resumen.carta.oficioGenerico') }),
    fuertes.length ? t('resumen.carta.fuertes', { lista: fuertes.join(', ') }) : '',
    frases[0] ? t('resumen.carta.prueba', { frase: frases[0].evidencia!.replace(/[.!?…]+$/, '') }) : '',
    ruta ? t('resumen.carta.meta', { ruta: ruta.nombre.toLowerCase(), x: ruta.tiene.length, y: ruta.tiene.length + ruta.faltan.length }) : '',
    principal?.tipo === 'capacitate' ? t('resumen.carta.curso', { curso: principal.detalle }) : '',
    t('resumen.carta.cierre'),
  ]
    .filter(Boolean)
    .join(' ');

  // ---- Plan de acción ----
  const ofertas = enlacesOfertas(ocupacion, salud.enlaces);
  const plan: { id: string; texto: string; url?: string | null }[] = [
    { id: 'guardar', texto: t('resumen.plan.guardar') },
    principal?.tipo === 'capacitate'
      ? { id: 'curso', texto: t('resumen.plan.curso', { curso: principal.detalle }), url: salud.enlaces.capacitate_peru }
      : principal?.tipo === 'asesor'
        ? { id: 'asesor', texto: t('resumen.plan.asesor') }
        : { id: 'cuenta', texto: t('resumen.plan.cuenta'), url: salud.enlaces.empleos_peru },
    { id: 'cul', texto: t('resumen.plan.cul'), url: salud.enlaces.empleos_peru },
    ...(ruta ? [{ id: 'postular', texto: t('resumen.plan.postular', { ruta: ruta.nombre }), url: ofertas[ofertas.length - 1]?.url }] : []),
    { id: 'certificar', texto: t('resumen.plan.certificar') },
  ];
  const hechos = plan.filter((p) => estado.plan[p.id]).length;

  // ---- Compartir con un asesor (el panal viaja en el enlace, no en un servidor) ----
  const compartido: PanalCompartido = {
    region,
    celdas: ordenar(estado.celdas).map((c) => ({ id: c.id, dimension: c.dimension })),
    frases: frases.map((f) => f.evidencia!),
    ruta: ruta ? `${ruta.nombre} · ${t('rutas.tienes', { x: ruta.tiene.length, y: ruta.tiene.length + ruta.faltan.length })}` : null,
    paso: principal ? { titulo: principal.titulo, detalle: principal.detalle } : null,
  };
  const enlace = enlaceCompartir(compartido);

  const mostrarQr = () =>
    QRCode.toDataURL(enlace, { margin: 1, width: 320, color: { dark: '#0E1A17', light: '#FFFFFF' } })
      .then(setQr)
      .catch(() => setQr(null));

  const descargar = async () => {
    setGenerando(true);
    const url = await generarImagen({ celdas: estado.celdas, comp, ruta, paso: estado.primerPaso, region });
    setImagen(url);
    setGenerando(false);
    cambiar({ plan: { ...estado.plan, guardar: true } });
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
            {principal && (
              <div className="resumen-fila">
                <span className="etiqueta">{t('resumen.miPaso')}</span>
                <b>{principal.titulo}</b>
                <span className="ayuda">{principal.detalle}</span>
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

      {/* Plan de acción */}
      <section className="bloque" aria-labelledby="plan">
        <div className="bloque__cabeza">
          <h2 id="plan">{t('resumen.plan.titulo')}</h2>
          <span className="contador-celdas">
            {hechos}/{plan.length}
          </span>
        </div>
        <ol className="plan">
          {plan.map((p) => (
            <li key={p.id} className={estado.plan[p.id] ? 'plan__item plan__item--hecho' : 'plan__item'}>
              <label>
                <input
                  type="checkbox"
                  checked={!!estado.plan[p.id]}
                  onChange={(e) => cambiar({ plan: { ...estado.plan, [p.id]: e.target.checked } })}
                />
                <span>{p.texto}</span>
              </label>
              {p.url && (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="plan__enlace" aria-label={t('resumen.plan.abrir')}>
                  <Icono nombre="adelante" tam={18} />
                </a>
              )}
            </li>
          ))}
        </ol>
        {!estado.guardar && (
          <button type="button" className="enlace" onClick={() => cambiar({ guardar: true })}>
            <Icono nombre="guardar" tam={20} /> {t('resumen.guardarCelular')}
          </button>
        )}
        {estado.guardar && <p className="nota">{t('resumen.guardado')}</p>}
      </section>

      {/* Texto para presentarse */}
      <section className="bloque" aria-labelledby="presentate">
        <h2 id="presentate">{t('resumen.carta.titulo')}</h2>
        <p className="ayuda">{t('resumen.carta.ayuda')}</p>
        <p className="carta" id="texto-carta">
          {presentacion}
        </p>
        <div className="fila-botones">
          <button
            type="button"
            className="boton boton--secundario"
            onClick={() => copiar('carta', presentacion, document.getElementById('texto-carta'))}
          >
            <Icono nombre="copiar" tam={20} /> {copiado === 'carta' ? t('resumen.copiado') : t('resumen.copiar')}
          </button>
          <a className="boton boton--primario" href={`https://wa.me/?text=${encodeURIComponent(presentacion)}`} target="_blank" rel="noopener noreferrer">
            <Icono nombre="compartir" tam={20} /> WhatsApp
          </a>
        </div>
      </section>

      {/* Compartir con un asesor */}
      <section className="bloque" aria-labelledby="asesor">
        <h2 id="asesor">{t('resumen.asesor.titulo')}</h2>
        <p className="ayuda">{t('resumen.asesor.ayuda')}</p>
        {qr ? (
          <img className="qr" src={qr} alt={t('resumen.asesor.qrAlt')} width={220} height={220} />
        ) : (
          <button type="button" className="boton boton--secundario" onClick={mostrarQr}>
            <Icono nombre="qr" tam={20} /> {t('resumen.asesor.mostrarQr')}
          </button>
        )}
        <button type="button" className="enlace" onClick={() => copiar('enlace', enlace)}>
          <Icono nombre="copiar" tam={20} /> {copiado === 'enlace' ? t('resumen.copiado') : t('resumen.asesor.copiarEnlace')}
        </button>
        <p className="nota">{t('resumen.asesor.privacidad')}</p>
      </section>

      {salud.enlaces.empleos_peru && (
        <a className="boton boton--secundario" href={salud.enlaces.empleos_peru} target="_blank" rel="noopener noreferrer">
          <Icono nombre="persona" tam={20} /> {t('menu.registrarse')}
        </a>
      )}
      <AvisoCertificacion />

      <div className="fila-botones">
        <button type="button" className="boton boton--secundario" onClick={() => ir('inicio')}>
          <Icono nombre="casa" tam={20} /> {t('menu.inicio')}
        </button>
        {confirmando ? null : (
          <button type="button" className="boton boton--fantasma" onClick={() => setConfirmando(true)}>
            {t('resumen.reiniciar')}
          </button>
        )}
      </div>
      {confirmando && (
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
      )}
    </Pantalla>
  );
}

/** Lo que ve el asesor (o quien reciba el enlace): el panal en modo lectura. */
export function Compartido() {
  const { estado, reiniciar } = useApp();
  const p = estado.compartido;
  if (!p) return null;
  return (
    <main className="contenedor pantalla entrar">
      <p className="franja franja--asesor">
        <Icono nombre="persona" tam={16} /> {t('compartido.aviso')}
      </p>
      <article className="tarjeta-panal revelar">
        <div className="tarjeta-panal__cabeza">
          <Enjambre cantidad={2} />
          <Logo oscuro tam={20} />
          <h1>{t('resumen.titulo')}</h1>
          <span className="tarjeta-panal__region">{p.region}</span>
        </div>
        <div className="tarjeta-panal__cuerpo">
          <Colmena chica celdas={p.celdas} />
          <Leyenda />
          {p.frases.map((f) => (
            <p key={f} className="evidencia">
              «{f}»
            </p>
          ))}
          <div className="resumen-filas">
            {p.ruta && (
              <div className="resumen-fila">
                <span className="etiqueta">{t('resumen.miRuta')}</span>
                <b>{p.ruta}</b>
              </div>
            )}
            {p.paso && (
              <div className="resumen-fila">
                <span className="etiqueta">{t('resumen.miPaso')}</span>
                <b>{p.paso.titulo}</b>
                <span className="ayuda">{p.paso.detalle}</span>
              </div>
            )}
          </div>
          <p className="nota">{t('comun.preliminar')}</p>
        </div>
      </article>
      <AvisoCertificacion />
      <button type="button" className="boton boton--miel boton--grande" onClick={reiniciar}>
        {t('compartido.hacerElMio')} <Icono nombre="adelante" />
      </button>
    </main>
  );
}
