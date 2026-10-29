// Tipos compartidos entre el servidor (server/) y la web (web/).
// Reflejan la forma de los archivos de data/*.json.

export type Dimension = 'conocimiento' | 'habilidad' | 'cualidad' | 'competencia';
export type Perfil = 'sin_empleo' | 'informal' | 'planilla_riesgo';
export type NivelDemanda = 'alta' | 'media' | 'baja';
export type Horas = '1-3' | '4-6' | '7+';
export type Modalidad = 'celular' | 'presencial' | 'igual';
export type Costo = 'gratis' | 'poco';

export interface Competencia {
  id: string;
  dimension: Dimension;
  nombre: string;
  /** Nombre claro de la habilidad para la celda: "Organización y orden". */
  nombre_corto?: string;
  nombre_simple: string;
  keywords: string[];
}

export interface Ocupacion {
  id: string;
  nombre: string;
  nivel: string;
  alias: string[];
  requeridas: string[];
  requisitos_minimos: string[];
  /** Texto para buscar ofertas reales en portales de empleo. */
  busqueda?: string;
  /** Cómo lo dice la persona: "soy almacenero", "trabajé de mesera". */
  menciones?: string[];
  /** Sector y qué hace, para la ficha de la profesión. */
  sector?: string;
  descripcion?: string;
  /** Áreas de interés que coinciden con este trabajo (ver data/entrevista.json). */
  areas?: string[];
  /** Condiciones que suele pedir: cargar peso, de pie, noche, computadora. */
  exige?: string[];
}

export interface PreguntaEntrevista {
  id?: string;
  apunta?: string;
  texto: string;
  ejemplo: string;
  pista?: string;
}

export interface OpcionEntrevista {
  id: string;
  texto: string;
  icono: string;
}

/** Guía de entrevista: preguntas generales, por oficio, intereses y límites. */
export interface Entrevista {
  preguntas: PreguntaEntrevista[];
  general: PreguntaEntrevista;
  por_oficio: Record<string, PreguntaEntrevista>;
  intereses: OpcionEntrevista[];
  evitar: OpcionEntrevista[];
}

/** Una tarea del día a día y las habilidades transferibles que revela. */
export interface Tarea {
  id: string;
  nombre: string;
  keywords: string[];
  aporta: string[];
}

export interface Region {
  id: string;
  nombre: string;
  demanda: Record<string, NivelDemanda>;
  /** Enlace de invitación de la sala Keet del Centro de Empleo (pear://keet/…). Vacío = por configurar. */
  keet_centro_empleo?: string;
}

export interface Capacitacion {
  id: string;
  titulo: string;
  proveedor: string;
  url: string | null;
  cubre: string[];
  duracion_semanas: number;
  horas_semana: number;
  modalidad: 'celular' | 'presencial';
  costo: 'gratuito' | 'pagado';
  /** true si el curso es un tema que el MTPE anuncia en su plataforma. */
  verificado?: boolean;
  ilustrativo?: boolean;
}

export interface CasoDemo {
  id: string;
  nombre: string;
  region_id: string;
  perfil: Perfil;
  ocupacion_actual: string;
  respuestas: string[];
  intereses?: string[];
  evitar?: string[];
}

export interface Datos {
  competencias: Competencia[];
  ocupaciones: Ocupacion[];
  regiones: Region[];
  capacitaciones: Capacitacion[];
  tareas: Tarea[];
  entrevista: Entrevista;
  casos: CasoDemo[];
  ilustrativo: boolean;
}

/** Competencia detectada en lo que la persona contó. */
export interface CompetenciaDetectada {
  id: string;
  dimension: Dimension;
  evidencia: string | null;
  /** Si se dedujo de una tarea ("Cobrar en caja" -> precisión), su nombre. */
  tarea?: string | null;
  /** Si es típica del oficio de la persona ("Auxiliar de almacén"), su nombre. */
  oficio?: string | null;
}

export interface Ruta {
  ocupacion_id: string;
  nombre: string;
  alias: string[];
  requisitos_minimos: string[];
  cobertura: number; // ponderada, 0..1
  tiene: string[];
  faltan: string[];
  demanda: NivelDemanda | null;
  /** Coincide con lo que a la persona le interesa hacer. */
  interes?: boolean;
  /** Condiciones que la persona prefiere evitar y este trabajo suele pedir. */
  conflictos?: string[];
}

export interface ResultadoRutas {
  rutas: Ruta[];
  aviso_demanda: { ocupacion_id: string; nombre: string; region: string } | null;
}

export type TipoPaso = 'capacitate' | 'empleos' | 'asesor';

export interface OpcionPaso {
  tipo: TipoPaso;
  titulo: string;
  detalle: string;
  curso?: Capacitacion;
  /** true si el curso no encaja con todo lo que la persona eligió (horas, modalidad, costo). */
  curso_ajustado?: boolean;
}

export interface ResultadoPrimerPaso {
  principal: OpcionPaso;
  porque: string;
  alternativas: OpcionPaso[];
}
