import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Dimension } from '@shared/tipos';
import { nombreHabilidad } from '@shared/motor';
import { t } from '../i18n';
import { enlaceCompartir, useApp, type PanalCompartido } from '../estado';
import { generarImagen } from '../imagenPanal';
import { AvisoCertificacion, Enjambre, Icono, Logo } from '../componentes/comunes';
import { completitud, Plataforma } from '../componentes/Plataforma';
import { iniciales, nombreCompleto } from '../cuenta';
import { SalaKeet } from '../componentes/Keet';
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
  const [verCarta, setVerCarta] = useState(false);
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
    ruta
      ? t('resumen.carta.meta', { ruta: ruta.nombre.toLowerCase(), x: ruta.tiene.length, y: ruta.tiene.length + ruta.faltan.length })
      : '',
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

  // El QR se genera solo al abrir la página (sin tener que tocar un botón).
  useEffect(() => {
    let vivo = true;
    QRCode.toDataURL(enlace, { margin: 1, width: 320, color: { dark: '#0E1A17', light: '#FFFFFF' } })
      .then((u) => vivo && setQr(u))
      .catch(() => vivo && setQr(null));
    return () => {
      vivo = false;
    };
  }, [enlace]);

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

  const { pct } = completitud(estado);

  // ---- Izquierda: lo que harás (plan) y cómo te presentarás ----
  const izquierda = (
    <>
      <section className="lado" aria-labelledby="plan-titulo" id="plan">
        <div className="lado__cabeza">
          <span className="lado__icono">
            <Icono nombre="check" tam={20} />
          </span>
          <h2 id="plan-titulo">{t('resumen.plan.titulo')}</h2>
          <span className="lado__contador">
            {hechos}/{plan.length}
          </span>
        </div>
        <span className="barra" aria-hidden="true">
          <span className="barra__lleno" style={{ width: `${(hechos / plan.length) * 100}%` }} />
        </span>
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
                  <Icono nombre="adelante" tam={16} />
                </a>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="lado" aria-labelledby="presentate-titulo" id="presentate">
        <div className="lado__cabeza">
          <span className="lado__icono">
            <Icono nombre="compartir" tam={20} />
          </span>
          <h2 id="presentate-titulo">{t('resumen.carta.titulo')}</h2>
        </div>
        <p className="carta" id="texto-carta">
          <span className={verCarta ? undefined : 'carta--corta'}>{presentacion}</span>
        </p>
        <button type="button" className="enlace enlace--izq" onClick={() => setVerCarta(!verCarta)}>
          {verCarta ? t('resumen.verMenos') : t('resumen.verTodo')}
        </button>
        <div className="fila-botones">
          <button
            type="button"
            className="boton boton--secundario boton--compacto"
            onClick={() => copiar('carta', presentacion, document.getElementById('texto-carta'))}
          >
            <Icono nombre="copiar" tam={18} /> {copiado === 'carta' ? t('resumen.copiado') : t('resumen.copiar')}
          </button>
          <a
            className="boton boton--primario boton--compacto"
            href={`https://wa.me/?text=${encodeURIComponent(presentacion)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icono nombre="compartir" tam={18} /> WhatsApp
          </a>
        </div>
      </section>
    </>
  );

  // ---- Derecha: llevarlo a un asesor, tu perfil y el banco ----
  const derecha = (
    <>
      <section className="lado" aria-labelledby="asesor-titulo" id="asesor">
        <div className="lado__cabeza">
          <span className="lado__icono">
            <Icono nombre="qr" tam={20} />
          </span>
          <h2 id="asesor-titulo">{t('resumen.asesor.titulo')}</h2>
        </div>
        <div className="lado__qr">
          {qr && <img className="qr" src={qr} alt={t('resumen.asesor.qrAlt')} width={150} height={150} />}
          <p className="ayuda">{t('resumen.asesor.ayudaCorta')}</p>
        </div>
        <button type="button" className="boton boton--secundario boton--compacto" onClick={() => copiar('enlace', enlace)}>
          <Icono nombre="copiar" tam={18} /> {copiado === 'enlace' ? t('resumen.copiado') : t('resumen.asesor.copiarEnlace')}
        </button>
        <p className="nota">{t('resumen.asesor.privacidad')}</p>
        <SalaKeet texto={t('keet.enviarPanal')} copiar={enlace} compacto />
      </section>

      <section className="lado lado--perfil">
        <div className="lado__cabeza">
          <span className="avatar">{estado.cuenta ? iniciales(estado.cuenta) : <Icono nombre="persona" tam={18} />}</span>
          <h2>{estado.cuenta ? nombreCompleto(estado.cuenta) : t('web.invitado')}</h2>
        </div>
        <span className="lado__completo">{t('web.perfilCompleto', { pct })}</span>
        <span className="barra" aria-hidden="true">
          <span className="barra__lleno" style={{ width: `${pct}%` }} />
        </span>
        <label className="consentimiento">
          <input id="lat-guardar" type="checkbox" checked={estado.guardar} onChange={(e) => cambiar({ guardar: e.target.checked })} />
          <span>{t('menu.guardar')}</span>
        </label>
        {estado.cuenta ? (
          estado.cuenta.visible ? (
            <p className="lado__ok">
              <Icono nombre="check" tam={18} /> {t('web.bancoVisibleCorto')}
            </p>
          ) : (
            <button type="button" className="boton boton--miel boton--compacto" onClick={() => ir('unirse')}>
              {t('unirse.cta')}
            </button>
          )
        ) : (
          <button type="button" className="boton boton--miel boton--compacto" onClick={() => ir('cuenta', 0)}>
            {t('web.crearCuenta')}
          </button>
        )}
      </section>

      <section className="lado lado--oscuro">
        <h2>{t('web.bancoTitulo')}</h2>
        <p>{estado.cuenta?.visible ? t('web.bancoVisible') : t('web.bancoInvita')}</p>
        <button type="button" className="boton boton--miel boton--compacto" onClick={() => ir(estado.cuenta?.visible ? 'banco' : estado.cuenta ? 'unirse' : 'cuenta', estado.cuenta ? 0 : 2)}>
          {estado.cuenta?.visible ? t('web.verBanco') : t('unirse.cta')} <Icono nombre="adelante" tam={18} />
        </button>
      </section>

      {ruta && ofertas.length > 0 && (
        <section className="lado">
          <h2>{t('web.ofertasPara', { ruta: ruta.nombre })}</h2>
          <div className="lado__enlaces">
            {ofertas.map((o) => (
              <a key={o.nombre} className="chip chip--chico" href={o.url} target="_blank" rel="noopener noreferrer">
                {o.nombre} <Icono nombre="adelante" tam={14} />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );

  return (
    <Plataforma activo="resumen" izquierda={izquierda} derecha={derecha} centroPrimero>
      <article className="tarjeta-panal tarjeta-panal--ancha revelar" id="mi-panal">
        <div className="tarjeta-panal__cabeza">
          <Enjambre cantidad={2} />
          <Logo oscuro tam={20} />
          <h1>{t('resumen.titulo')}</h1>
          <span className="tarjeta-panal__region">{estado.cuenta ? `${nombreCompleto(estado.cuenta)} · ${region}` : region}</span>
        </div>
        <div className="tarjeta-panal__cuerpo">
          <div className="tarjeta-panal__colmena">
            <Colmena chica celdas={ordenar(estado.celdas)} />
            <Leyenda />
          </div>
          <div className="tarjeta-panal__datos">
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
        </div>
      </article>

      <button type="button" className="boton boton--miel boton--grande boton--descargar" onClick={descargar} disabled={generando}>
        <Icono nombre="guardar" /> {generando ? t('resumen.generando') : t('resumen.descargar')}
      </button>
      {imagen && (
        <div className="pila-chica">
          <p className="ayuda">{t('resumen.guardarImagen')}</p>
          <img className="imagen-panal" src={imagen} alt={t('resumen.titulo')} />
        </div>
      )}

      <AvisoCertificacion />

      <div className="resumen-pie">
        <button type="button" className="boton boton--secundario boton--compacto" onClick={() => ir('inicio')}>
          <Icono nombre="casa" tam={18} /> {t('menu.inicio')}
        </button>
        <button type="button" className="boton boton--secundario boton--compacto" onClick={() => ir('rutas')}>
          <Icono nombre="adelante" tam={18} /> {t('web.seccion.rutas')}
        </button>
        {!confirmando && (
          <button type="button" className="boton boton--fantasma boton--compacto" onClick={() => setConfirmando(true)}>
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
    </Plataforma>
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
