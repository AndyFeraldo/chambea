import { useState, type FormEvent } from 'react';
import { t } from '../i18n';
import { useApp } from '../estado';
import { celularValido, ingresar, pinValido, registrar, type ErrorCuenta } from '../cuenta';
import { Icono } from '../componentes/comunes';
import { Plataforma } from '../componentes/Plataforma';

export function CuentaPantalla() {
  const { datos, salud, estado, cambiar, ir } = useApp();
  const modo: 'registro' | 'ingreso' = estado.lugar.pregunta === 1 ? 'ingreso' : 'registro';
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [pin, setPin] = useState('');
  const [regionId, setRegionId] = useState(estado.regionId);
  const [visible, setVisible] = useState(false);
  const [contacto, setContacto] = useState(false);
  const [error, setError] = useState<ErrorCuenta | 'datos' | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Después de entrar: a su panal si ya tiene uno; si no, a empezar el recorrido.
  const destino = (tienePanal: boolean) => (tienePanal ? 'resumen' : 'situacion');

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!celularValido(celular) || !pinValido(pin) || (modo === 'registro' && nombre.trim().length < 2)) {
      setError('datos');
      return;
    }
    setEnviando(true);
    if (modo === 'registro') {
      const r = await registrar(
        { nombre: nombre.trim(), celular, regionId, visible, contacto, creada: new Date().toISOString() },
        pin,
        estado,
      );
      setEnviando(false);
      if (typeof r === 'string') return setError(r);
      cambiar({ cuenta: r, guardar: true, regionId });
      ir(destino(!!estado.primerPaso));
    } else {
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
    }
  };

  const lateral = (
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
  );

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

        <h1>{modo === 'registro' ? t('cuenta.tituloRegistro') : t('cuenta.tituloIngreso')}</h1>
        <p className="ayuda">{modo === 'registro' ? t('cuenta.ayudaRegistro') : t('cuenta.ayudaIngreso')}</p>

        <form className="formulario" onSubmit={enviar} noValidate>
          {modo === 'registro' && (
            <label className="campo">
              <span>{t('cuenta.nombre')}</span>
              <input id="cuenta-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="given-name" placeholder={t('cuenta.nombreEjemplo')} />
            </label>
          )}
          <label className="campo">
            <span>{t('cuenta.celular')}</span>
            <input id="cuenta-celular" value={celular} onChange={(e) => setCelular(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="9XXXXXXXX" maxLength={11} />
          </label>
          <label className="campo">
            <span>{t('cuenta.pin')}</span>
            <input id="cuenta-pin" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} inputMode="numeric" type="password" maxLength={4} placeholder="••••" />
            <small>{t('cuenta.pinAyuda')}</small>
          </label>
          {modo === 'registro' && (
            <>
              <label className="campo">
                <span>{t('cuenta.region')}</span>
                <select id="cuenta-region" className="selector" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                  {datos.regiones.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="consentimiento">
                <input id="cuenta-visible" type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
                <span>
                  <b>{t('cuenta.visible')}</b>
                  <small>{t('cuenta.visibleAyuda')}</small>
                </span>
              </label>
              <label className="consentimiento">
                <input id="cuenta-contacto" type="checkbox" checked={contacto} onChange={(e) => setContacto(e.target.checked)} />
                <span>
                  <b>{t('cuenta.contacto')}</b>
                  <small>{t('cuenta.contactoAyuda')}</small>
                </span>
              </label>
            </>
          )}

          {error && <p className="error-voz">{t(`cuenta.errores.${error}`)}</p>}

          <button type="submit" className="boton boton--primario boton--grande" disabled={enviando}>
            {modo === 'registro' ? t('cuenta.crear') : t('web.ingresar')} <Icono nombre="adelante" />
          </button>
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
