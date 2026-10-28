// Registro en 3 pasos cortos (tus datos · contacto y lugar · acceso y permisos) e ingreso con celular + PIN.
import { useState, type FormEvent, type ReactNode } from 'react';
import { t } from '../i18n';
import { useApp } from '../estado';
import {
  celularValido,
  correoValido,
  documentoValido,
  EDUCACION,
  edad,
  ingresar,
  nombreVisible,
  pinValido,
  registrar,
  TIPOS_DOCUMENTO,
  type Educacion,
  type ErrorCuenta,
  type TipoDocumento,
} from '../cuenta';
import { Icono } from '../componentes/comunes';
import { Plataforma } from '../componentes/Plataforma';

const PASOS = ['datos', 'contacto', 'acceso'] as const;
type ErrorForm = ErrorCuenta | 'nombres' | 'apellidos' | 'documento' | 'nacimiento' | 'menor' | 'celular' | 'correo' | 'distrito' | 'pinFormato' | 'pinIgual' | 'terminos';

function Campo({ etiqueta, ayuda, opcional, children }: { etiqueta: string; ayuda?: string; opcional?: boolean; children: ReactNode }) {
  return (
    <label className="campo">
      <span>
        {etiqueta} {opcional && <em className="campo__opcional">{t('cuenta.opcional')}</em>}
      </span>
      {children}
      {ayuda && <small>{ayuda}</small>}
    </label>
  );
}

export function CuentaPantalla() {
  const { datos, salud, estado, cambiar, ir } = useApp();
  const modo: 'registro' | 'ingreso' = estado.lugar.pregunta === 1 ? 'ingreso' : 'registro';
  const [paso, setPaso] = useState(0);
  // Paso 1
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [tipoDoc, setTipoDoc] = useState<TipoDocumento>('dni');
  const [documento, setDocumento] = useState('');
  const [nacimiento, setNacimiento] = useState('');
  const [educacion, setEducacion] = useState<Educacion | ''>('');
  // Paso 2
  const [celular, setCelular] = useState('');
  const [correo, setCorreo] = useState('');
  const [regionId, setRegionId] = useState(estado.regionId);
  const [distrito, setDistrito] = useState('');
  const [discapacidad, setDiscapacidad] = useState(false);
  // Paso 3
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [terminos, setTerminos] = useState(false);
  const [contacto, setContacto] = useState(true);
  const [banco, setBanco] = useState(estado.lugar.pregunta === 2);

  const [error, setError] = useState<ErrorForm | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Después de entrar: al banco si lo pidió, a su panal si ya tiene uno, o a empezar el recorrido.
  const destino = (tienePanal: boolean) => (tienePanal ? 'resumen' : 'situacion');

  const revisar = (n: number): ErrorForm | null => {
    if (n === 0) {
      if (nombres.trim().length < 2) return 'nombres';
      if (apellidos.trim().length < 2) return 'apellidos';
      if (!documentoValido(tipoDoc, documento)) return 'documento';
      const e = edad(nacimiento);
      if (e === null || e > 100) return 'nacimiento';
      if (e < 18) return 'menor';
    }
    if (n === 1) {
      if (!celularValido(celular)) return 'celular';
      if (!correoValido(correo)) return 'correo';
      if (distrito.trim().length < 2) return 'distrito';
    }
    if (n === 2) {
      if (!pinValido(pin)) return 'pinFormato';
      if (pin !== pin2) return 'pinIgual';
      if (!terminos) return 'terminos';
    }
    return null;
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (modo === 'ingreso') {
      if (!celularValido(celular) || !pinValido(pin)) return setError('celular');
      setEnviando(true);
      const r = await ingresar(celular, pin);
      setEnviando(false);
      if (typeof r === 'string') return setError(r);
      if (r.progreso) {
        cambiar({ ...r.progreso, cuenta: r.cuenta, guardar: true, historial: [], lugar: estado.lugar });
        ir(destino(!!r.progreso.primerPaso));
      } else {
        cambiar({ cuenta: r.cuenta, guardar: true });
        ir('situacion');
      }
      return;
    }
    const problema = revisar(paso);
    if (problema) return setError(problema);
    if (paso < PASOS.length - 1) return setPaso(paso + 1);

    setEnviando(true);
    const r = await registrar(
      {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        documento: { tipo: tipoDoc, final: documento.trim().slice(-3) },
        nacimiento,
        educacion: educacion || null,
        celular,
        correo: correo.trim(),
        regionId,
        distrito: distrito.trim(),
        discapacidad,
        visible: false,
        contacto,
        creada: new Date().toISOString(),
        laboral: null,
      },
      pin,
      estado,
    );
    setEnviando(false);
    if (typeof r === 'string') {
      if (r === 'existe') setPaso(1);
      return setError(r);
    }
    cambiar({ cuenta: r, guardar: true, regionId });
    ir(banco ? 'unirse' : destino(!!estado.primerPaso));
  };

  const vistaNombre = nombreVisible(nombres || t('cuenta.nombresEjemplo'), apellidos || t('cuenta.apellidosEjemplo'));
  const lateral = (
    <>
      {modo === 'registro' && (
        <section className="bloque asi-te-ven">
          <h2>{t('cuenta.asiTeVen')}</h2>
          <div className="asi-te-ven__tarjeta">
            <span className="avatar">{vistaNombre.slice(0, 1)}</span>
            <b>{vistaNombre}</b>
          </div>
          <p className="ayuda">{t('cuenta.asiTeVenAyuda')}</p>
          <ul className="nunca">
            {(['apellido', 'documento', 'celular', 'correo'] as const).map((k) => (
              <li key={k}>
                <Icono nombre="ojo_no" tam={16} /> {t(`cuenta.nunca.${k}`)}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="cuenta-beneficios">
        <h2>{t('cuenta.porQueTitulo')}</h2>
        <ul>
          {(['guardar', 'banco', 'asesor', 'privado'] as const).map((b) => (
            <li key={b}>
              <span className="mini-hex mini-hex--tiene" /> {t(`cuenta.beneficios.${b}`)}
            </li>
          ))}
        </ul>
      </section>
    </>
  );

  const errorTexto = error && t(`cuenta.errores.${error}`);

  return (
    <Plataforma activo="cuenta" derecha={lateral}>
      <div className="cuenta">
        <div className="cuenta__pestanas" role="tablist">
          <button type="button" role="tab" aria-selected={modo === 'registro'} onClick={() => ir('cuenta', 0)}>
            {t('web.registrarme')}
          </button>
          <button type="button" role="tab" aria-selected={modo === 'ingreso'} onClick={() => ir('cuenta', 1)}>
            {t('web.ingresar')}
          </button>
        </div>

        {modo === 'registro' && (
          <ol className="pasos-registro" aria-label={t('cuenta.pasosEtiqueta')}>
            {PASOS.map((p, i) => (
              <li key={p} aria-current={i === paso ? 'step' : undefined} className={i < paso ? 'hecho' : ''}>
                <button type="button" disabled={i > paso} onClick={() => (setError(null), setPaso(i))}>
                  <span className="num-hex">{i < paso ? <Icono nombre="check" tam={14} grosor={3} /> : i + 1}</span>
                  <span>{t(`cuenta.pasos.${p}`)}</span>
                </button>
              </li>
            ))}
          </ol>
        )}

        <h1>{modo === 'registro' ? t(`cuenta.titulos.${PASOS[paso]}`) : t('cuenta.tituloIngreso')}</h1>
        <p className="ayuda">{modo === 'registro' ? t(`cuenta.ayudas.${PASOS[paso]}`) : t('cuenta.ayudaIngreso')}</p>

        <form className="formulario" onSubmit={enviar} noValidate>
          {modo === 'ingreso' && (
            <>
              <Campo etiqueta={t('cuenta.celular')}>
                <input id="cuenta-celular" value={celular} onChange={(e) => setCelular(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="9XXXXXXXX" maxLength={11} />
              </Campo>
              <Campo etiqueta={t('cuenta.pin')}>
                <input id="cuenta-pin" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} inputMode="numeric" type="password" maxLength={4} placeholder="••••" />
              </Campo>
            </>
          )}

          {modo === 'registro' && paso === 0 && (
            <div className="formulario__grilla entrar">
              <Campo etiqueta={t('cuenta.nombres')}>
                <input id="cuenta-nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} autoComplete="given-name" placeholder={t('cuenta.nombresEjemplo')} />
              </Campo>
              <Campo etiqueta={t('cuenta.apellidos')}>
                <input id="cuenta-apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} autoComplete="family-name" placeholder={t('cuenta.apellidosEjemplo')} />
              </Campo>
              <div className="campo campo--doble">
                <span>{t('cuenta.documento')}</span>
                <div className="campo__fila">
                  <select id="cuenta-tipo-doc" className="selector" value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value as TipoDocumento)} aria-label={t('cuenta.tipoDocumento')}>
                    {TIPOS_DOCUMENTO.map((d) => (
                      <option key={d} value={d}>
                        {t(`cuenta.tiposDocumento.${d}`)}
                      </option>
                    ))}
                  </select>
                  <input
                    id="cuenta-documento"
                    value={documento}
                    onChange={(e) => setDocumento(tipoDoc === 'dni' ? e.target.value.replace(/\D/g, '') : e.target.value)}
                    inputMode={tipoDoc === 'dni' ? 'numeric' : 'text'}
                    maxLength={tipoDoc === 'dni' ? 8 : 12}
                    placeholder={tipoDoc === 'dni' ? '12345678' : ''}
                    aria-label={t('cuenta.numeroDocumento')}
                  />
                </div>
                <small>{t('cuenta.documentoAyuda')}</small>
              </div>
              <Campo etiqueta={t('cuenta.nacimiento')}>
                <input id="cuenta-nacimiento" type="date" value={nacimiento} onChange={(e) => setNacimiento(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
              </Campo>
              <Campo etiqueta={t('cuenta.educacion')} opcional>
                <select id="cuenta-educacion" className="selector" value={educacion} onChange={(e) => setEducacion(e.target.value as Educacion | '')}>
                  <option value="">{t('cuenta.elegir')}</option>
                  {EDUCACION.map((ed) => (
                    <option key={ed} value={ed}>
                      {t(`cuenta.niveles.${ed}`)}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>
          )}

          {modo === 'registro' && paso === 1 && (
            <div className="formulario__grilla entrar">
              <Campo etiqueta={t('cuenta.celular')} ayuda={t('cuenta.celularAyuda')}>
                <input id="cuenta-celular" value={celular} onChange={(e) => setCelular(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="9XXXXXXXX" maxLength={11} />
              </Campo>
              <Campo etiqueta={t('cuenta.correo')} opcional>
                <input id="cuenta-correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} autoComplete="email" placeholder="nombre@correo.com" />
              </Campo>
              <Campo etiqueta={t('cuenta.region')}>
                <select id="cuenta-region" className="selector" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                  {datos.regiones.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo etiqueta={t('cuenta.distrito')}>
                <input id="cuenta-distrito" value={distrito} onChange={(e) => setDistrito(e.target.value)} autoComplete="address-level3" placeholder={t('cuenta.distritoEjemplo')} />
              </Campo>
              <label className="consentimiento campo--ancho">
                <input id="cuenta-discapacidad" type="checkbox" checked={discapacidad} onChange={(e) => setDiscapacidad(e.target.checked)} />
                <span>
                  <b>
                    {t('cuenta.discapacidad')} <em className="campo__opcional">{t('cuenta.opcional')}</em>
                  </b>
                  <small>{t('cuenta.discapacidadAyuda')}</small>
                </span>
              </label>
            </div>
          )}

          {modo === 'registro' && paso === 2 && (
            <div className="formulario__grilla entrar">
              <Campo etiqueta={t('cuenta.pin')} ayuda={t('cuenta.pinAyuda')}>
                <input id="cuenta-pin" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} inputMode="numeric" type="password" maxLength={4} placeholder="••••" />
              </Campo>
              <Campo etiqueta={t('cuenta.pin2')}>
                <input id="cuenta-pin2" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} inputMode="numeric" type="password" maxLength={4} placeholder="••••" />
              </Campo>
              <div className="permisos campo--ancho">
                <label className="consentimiento">
                  <input id="cuenta-terminos" type="checkbox" checked={terminos} onChange={(e) => setTerminos(e.target.checked)} />
                  <span>
                    <b>{t('cuenta.terminos')}</b>
                    <small>{t('cuenta.terminosAyuda')}</small>
                  </span>
                </label>
                <label className="consentimiento">
                  <input id="cuenta-contacto" type="checkbox" checked={contacto} onChange={(e) => setContacto(e.target.checked)} />
                  <span>
                    <b>{t('cuenta.contacto')}</b>
                    <small>{t('cuenta.contactoAyuda')}</small>
                  </span>
                </label>
                <label className="consentimiento consentimiento--miel">
                  <input id="cuenta-banco" type="checkbox" checked={banco} onChange={(e) => setBanco(e.target.checked)} />
                  <span>
                    <b>{t('cuenta.bancoSiguiente')}</b>
                    <small>{t('cuenta.bancoSiguienteAyuda')}</small>
                  </span>
                </label>
              </div>
            </div>
          )}

          {errorTexto && (
            <p className="error-voz" role="alert">
              {errorTexto}
            </p>
          )}

          <div className="formulario__acciones">
            {modo === 'registro' && paso > 0 && (
              <button type="button" className="boton boton--secundario" onClick={() => (setError(null), setPaso(paso - 1))}>
                <Icono nombre="atras" /> {t('comun.atras')}
              </button>
            )}
            <button type="submit" className="boton boton--primario boton--grande" disabled={enviando}>
              {modo === 'ingreso' ? t('web.ingresar') : paso < PASOS.length - 1 ? t('cuenta.seguir') : t('cuenta.crear')} <Icono nombre="adelante" />
            </button>
          </div>
        </form>

        <p className="aviso-cert">
          <Icono nombre="candado" tam={20} />
          <span>{t('cuenta.demo')}</span>
        </p>
        {salud.enlaces.empleos_peru && (
          <a className="enlace" href={salud.enlaces.empleos_peru} target="_blank" rel="noopener noreferrer">
            <Icono nombre="persona" tam={20} /> {t('menu.registrarse')}
          </a>
        )}
      </div>
    </Plataforma>
  );
}
