// Marcas de los aliados (texto con estilo, o el logo oficial si está en web/public/aliados/).
import { t } from '../i18n';
import { ALIADOS, ROLES, type Aliado } from '../aliados';
import { Icono } from './comunes';

function Marca({ a }: { a: Aliado }) {
  if (a.logo) return <img className="marca-al__img" src={a.logo} alt={a.nombre} loading="lazy" />;
  switch (a.id) {
    case 'mtpe':
      return (
        <span className="marca-al marca-al--mtpe" aria-label={a.nombre}>
          <i className="marca-al__bandera" aria-hidden="true" />
          <span aria-hidden="true">
            <b>Ministerio de Trabajo</b>
            <small>y Promoción del Empleo</small>
          </span>
        </span>
      );
    case 'ulima':
      return (
        <span className="marca-al marca-al--ulima" aria-label={a.nombre}>
          <small aria-hidden="true">Universidad</small>
          <b aria-hidden="true">de Lima</b>
        </span>
      );
    case 'innova':
      return (
        <span className="marca-al marca-al--innova" aria-label={a.nombre}>
          <span aria-hidden="true">
            innova<b>ulima</b>
          </span>
          <i aria-hidden="true">✳</i>
        </span>
      );
    case 'tether':
      return (
        <span className="marca-al marca-al--tether" aria-label={a.nombre}>
          <span aria-hidden="true">
            tether<i>.</i>
          </span>
        </span>
      );
    case 'qvac':
      return (
        <span className="marca-al marca-al--qvac" aria-label={a.nombre}>
          <b aria-hidden="true">QVAC</b>
          <small aria-hidden="true">by Tether</small>
        </span>
      );
    case 'keet':
      return (
        <span className="marca-al marca-al--keet" aria-label={a.nombre}>
          <b aria-hidden="true">keet</b>
          <small aria-hidden="true">by Holepunch</small>
        </span>
      );
    case 'gobpe':
      return (
        <span className="marca-al marca-al--gob" aria-label={a.nombre}>
          <span aria-hidden="true">
            <b>gob</b>.pe
          </span>
        </span>
      );
    default: {
      const icono = a.id === 'empleos' ? 'maletin' : a.id === 'capacitat' ? 'libro' : 'persona';
      return (
        <span className="marca-al marca-al--servicio">
          <Icono nombre={icono} tam={18} /> {a.nombre}
        </span>
      );
    }
  }
}

/**
 * franja: una línea (reto · organizan · IA), para la portada.
 * seccion: tarjetas por rol con su explicación.
 * pie: todas las marcas en pequeño, para el pie de las páginas.
 */
export function Aliados({ variante }: { variante: 'franja' | 'seccion' | 'pie' }) {
  if (variante === 'seccion') {
    return (
      <div className="aliados-seccion">
        {ROLES.map((rol) => (
          <section key={rol} className={`aliados-grupo aliados-grupo--${rol}`}>
            <span className="etiqueta">{t(`aliados.rolesSeccion.${rol}`)}</span>
            <ul>
              {ALIADOS.filter((a) => a.rol === rol).map((a) => (
                <li key={a.id}>
                  <Marca a={a} />
                  <small>{a.detalle}</small>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }
  const grupos: [string, Aliado[]][] =
    variante === 'franja'
      ? [
          [t('aliados.roles.reto'), ALIADOS.filter((a) => a.rol === 'reto')],
          [t('aliados.roles.organiza'), ALIADOS.filter((a) => a.rol === 'organiza')],
          [t('aliados.roles.tecnologia'), ALIADOS.filter((a) => a.rol === 'tecnologia')],
        ]
      : [[t('aliados.titulo'), ALIADOS.filter((a) => a.rol !== 'conecta')], [t('aliados.roles.conecta'), ALIADOS.filter((a) => a.rol === 'conecta')]];
  return (
    <div className={`aliados aliados--${variante}`}>
      {grupos.map(([titulo, lista]) => (
        <div key={titulo} className="aliados__grupo">
          <span className="aliados__rol">{titulo}</span>
          <ul className="aliados__marcas">
            {lista.map((a) => (
              <li key={a.id} title={`${a.nombre}: ${a.detalle}`}>
                <Marca a={a} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Pie común de las páginas de la plataforma: aliados + aviso de prototipo. */
export function PieWeb() {
  return (
    <footer className="pie-web">
      <div className="pie-web__interior">
        <Aliados variante="pie" />
        <p className="pie-web__aviso">{t('aliados.aviso')}</p>
      </div>
    </footer>
  );
}
