// Keet (Holepunch, ecosistema Tether): chat y videollamadas cifradas de persona a persona, sin servidores.
// Chambea no crea salas: usa el enlace de invitación de la sala de cada Centro de Empleo
// («Copy Invite Link» en Keet, formato pear://keet/…). Se configura por región en data/regiones.json
// (campo keet_centro_empleo) o, para la demo, con VITE_KEET_SALA en web/.env.*.
import type { Datos } from '@shared/tipos';

export const DESCARGAR_KEET = 'https://keet.io/';

export function keetValido(enlace?: string | null): boolean {
  return !!enlace && /^(pear:\/\/keet\/|https:\/\/keet\.io\/)\S+$/.test(enlace.trim());
}

/** Enlace de la sala Keet del Centro de Empleo de la región (o el de la demo). null si no está configurado. */
export function salaKeet(datos: Datos, regionId: string): string | null {
  const region = datos.regiones.find((r) => r.id === regionId);
  const enlace = region?.keet_centro_empleo || import.meta.env.VITE_KEET_SALA || '';
  return keetValido(enlace) ? enlace.trim() : null;
}
