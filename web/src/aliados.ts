// Aliados y servicios con los que se conecta Chambea (según las bases del reto).
// Se muestran como marcas de texto. Si el equipo consigue los logos oficiales (con permiso),
// se copian en web/public/aliados/ y se pone su ruta en `logo` (por ejemplo 'aliados/tether.svg').

export type RolAliado = 'reto' | 'organiza' | 'conecta' | 'tecnologia';

export interface Aliado {
  id: string;
  rol: RolAliado;
  /** Nombre completo, para lectores de pantalla y la descripción. */
  nombre: string;
  /** Qué hace en Chambea, en una línea. */
  detalle: string;
  /** Ruta a un logo oficial dentro de web/public (opcional). */
  logo?: string;
}

export const ALIADOS: Aliado[] = [
  {
    id: 'mtpe',
    rol: 'reto',
    nombre: 'Ministerio de Trabajo y Promoción del Empleo',
    detalle: 'Brinda el reto y sus servicios de empleo.',
  },
  { id: 'ulima', rol: 'organiza', nombre: 'Universidad de Lima', detalle: 'Organiza la Innovathon.' },
  { id: 'innova', rol: 'organiza', nombre: 'Innova Ulima', detalle: 'Centro de Emprendimiento e Innovación.' },
  { id: 'tether', rol: 'organiza', nombre: 'Tether', detalle: 'Coorganiza y aporta la tecnología.' },
  { id: 'gobpe', rol: 'conecta', nombre: 'gob.pe', detalle: 'Chambea se integra al portal de empleo del Estado.' },
  { id: 'empleos', rol: 'conecta', nombre: 'Empleos Perú', detalle: 'Para postular a ofertas.' },
  { id: 'capacitat', rol: 'conecta', nombre: 'Capacíta-T', detalle: 'Cursos gratis para lo que te falta.' },
  { id: 'centros', rol: 'conecta', nombre: 'Centros de Empleo', detalle: 'Un asesor te acompaña.' },
  { id: 'qvac', rol: 'tecnologia', nombre: 'QVAC', detalle: 'IA local: tus datos no salen del ecosistema persona–Ministerio.' },
];

export const ROLES: RolAliado[] = ['reto', 'organiza', 'conecta', 'tecnologia'];
