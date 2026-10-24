// Abeja vestida según el trabajo (gorro de chef, casco, audífonos...).
// La abeja mira a la izquierda: entra volando desde la derecha.
import { useId, type CSSProperties, type ReactNode } from 'react';

type Cabeza = 'gorra' | 'casco_obra' | 'casco_moto' | 'gorro_chef' | 'panuelo' | 'audifonos' | 'gorro_cuidado' | 'lentes';
type Cuerpo = 'corbata' | 'corbatin' | 'mandil' | 'chaleco' | 'caja_espalda' | 'placa';
type Objeto = 'billete' | 'bolsa' | 'caja' | 'carpeta' | 'atomizador' | 'cuchara' | 'bandeja' | 'llaves' | 'llave' | 'corazon';

interface Atuendo {
  cabeza?: Cabeza;
  colorCabeza?: string;
  cuerpo?: Cuerpo[];
  colorCuerpo?: string;
  objeto?: Objeto;
}

/** Vestimenta por ocupación. Una ocupación nueva en data/ usa la placa por defecto. */
export const ATUENDOS: Record<string, Atuendo> = {
  cajero: { cabeza: 'gorra', colorCabeza: '#1A7A5C', cuerpo: ['placa'], objeto: 'billete' },
  vendedor_tienda: { cuerpo: ['mandil'], colorCuerpo: '#1A7A5C', objeto: 'bolsa' },
  reponedor: { cabeza: 'gorra', colorCabeza: '#E4572E', objeto: 'caja' },
  auxiliar_administrativo: { cabeza: 'lentes', cuerpo: ['corbata'], objeto: 'carpeta' },
  limpieza: { cabeza: 'panuelo', objeto: 'atomizador' },
  ayudante_cocina: { cabeza: 'gorro_chef', cuerpo: ['mandil'], colorCuerpo: '#FFFFFF', objeto: 'cuchara' },
  mozo: { cuerpo: ['corbatin'], objeto: 'bandeja' },
  almacenero: { cabeza: 'casco_obra', colorCabeza: '#F28C28', cuerpo: ['chaleco'], objeto: 'caja' },
  repartidor: { cabeza: 'casco_moto', cuerpo: ['caja_espalda'] },
  operario_produccion: { cabeza: 'casco_obra', colorCabeza: '#FFFFFF', cuerpo: ['chaleco'], objeto: 'llave' },
  teleoperador: { cabeza: 'audifonos', cuerpo: ['placa'] },
  cuidador: { cabeza: 'gorro_cuidado', objeto: 'corazon' },
  conserje: { cabeza: 'gorra', colorCabeza: '#34433F', objeto: 'llaves' },
};

const T = { stroke: '#0E1A17', strokeWidth: 0.7 };

function cabeza(tipo: Cabeza, color = '#1A7A5C'): ReactNode {
  switch (tipo) {
    case 'gorra':
      return (
        <>
          <path d="M13.2 33 Q13.6 25.4 20.4 25.4 Q27.2 25.4 27.3 33 Z" fill={color} />
          <path d="M13.6 32.3 L6.2 33.6 Q6.8 35.7 14 34.4 Z" fill={color} />
          <circle cx="20.4" cy="25.6" r="1" fill="#FFFFFF" />
        </>
      );
    case 'casco_obra':
      return (
        <>
          <path d="M12.7 33 Q12.9 24.2 20 24.2 Q27.1 24.2 27.4 33 Z" fill={color} {...T} />
          <rect x="10.4" y="32" width="19.2" height="2.4" rx="1.2" fill={color} {...T} />
          <path d="M20 24.6 V32" {...T} />
        </>
      );
    case 'casco_moto':
      return (
        <>
          <path d="M12.6 34.5 Q12.2 25.2 20.2 25.2 Q28.2 25.2 27.9 34.5 Z" fill="#E4572E" />
          <path d="M12.9 33 Q13.4 29.6 17.6 29.2 L17.6 33 Z" fill="#CDEBDF" opacity="0.9" />
          <path d="M19.5 26 Q25 26.3 27 31" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </>
      );
    case 'gorro_chef':
      return (
        <g fill="#FFFFFF" stroke="#C9D5D0" strokeWidth="0.6">
          <rect x="14" y="26.4" width="12.4" height="5.4" rx="1" />
          <circle cx="15.6" cy="24" r="4" />
          <circle cx="24.6" cy="24" r="4" />
          <circle cx="20.2" cy="21.4" r="5" />
        </g>
      );
    case 'panuelo':
      return (
        <>
          <path d="M13.3 32.6 Q20 25.8 26.9 32.6 Z" fill="#26A17B" />
          <path d="M26.4 31.6 l4.4 -1.8 l-1.1 3.9 Z" fill="#26A17B" />
          <circle cx="17.5" cy="30.4" r="0.7" fill="#FFFFFF" />
          <circle cx="21.5" cy="29.2" r="0.7" fill="#FFFFFF" />
          <circle cx="24" cy="31" r="0.7" fill="#FFFFFF" />
        </>
      );
    case 'audifonos':
      return (
        <>
          <path d="M13.4 35 Q13.8 27.2 20 27.2 Q26.2 27.2 26.6 35" fill="none" stroke="#F5F8F7" strokeWidth="1.8" />
          <rect x="11.6" y="33.4" width="3.6" height="5.2" rx="1.6" fill="#26A17B" />
          <path d="M13.4 38.6 Q13.8 42.8 18 42.8" stroke="#F5F8F7" strokeWidth="1.2" fill="none" />
          <circle cx="18.6" cy="42.8" r="1.2" fill="#26A17B" />
        </>
      );
    case 'gorro_cuidado':
      return (
        <>
          <path d="M14.2 31.6 L15.4 26.8 L25 26.8 L26.2 31.6 Z" fill="#FFFFFF" stroke="#C9D5D0" strokeWidth="0.6" />
          <path d="M20.2 30.6 C18.2 29.2 18.5 27.8 19.6 27.8 C20 27.8 20.2 28.2 20.2 28.2 C20.2 28.2 20.4 27.8 20.8 27.8 C21.9 27.8 22.2 29.2 20.2 30.6 Z" fill="#E4572E" />
        </>
      );
    case 'lentes':
      return (
        <g fill="rgba(255,255,255,0.18)" stroke="#F5B82E" strokeWidth="0.9">
          <circle cx="16.2" cy="36" r="2.4" />
          <circle cx="21.8" cy="36" r="2.4" />
          <path d="M18.6 35.8 h0.8" />
        </g>
      );
  }
}

function cuerpo(tipo: Cuerpo, clip: string, color = '#1A7A5C'): ReactNode {
  switch (tipo) {
    case 'corbata':
      return <path d="M26.8 31.6 L29.6 31.6 L28.9 33.8 L30.2 42 L28.2 44.2 L26.3 42 L27.6 33.8 Z" fill="#1A7A5C" />;
    case 'corbatin':
      return <path d="M24.4 31.6 L27.6 33.8 L24.4 36 Z M30.8 31.6 L27.6 33.8 L30.8 36 Z" fill="#E4572E" />;
    case 'mandil':
      return (
        <>
          <g clipPath={`url(#${clip})`}>
            <path d="M22.5 34.5 L32.5 34.5 L33 48 L22 48 Z" fill={color} stroke="#C9D5D0" strokeWidth={color === '#FFFFFF' ? 0.6 : 0} />
          </g>
          <path d="M24.5 34.8 Q27.6 29.5 31 34.8" stroke={color} strokeWidth="1.1" fill="none" />
          <rect x="25" y="39.5" width="5" height="3.2" rx="0.6" fill={color === '#FFFFFF' ? '#E3E9E7' : '#FFFFFF'} opacity="0.85" />
        </>
      );
    case 'chaleco':
      return (
        <g clipPath={`url(#${clip})`}>
          <rect x="21" y="27" width="10" height="21" fill="#F28C28" />
          <rect x="21" y="37" width="10" height="2" fill="#F5F8F7" />
          <rect x="21" y="41.5" width="10" height="2" fill="#F5F8F7" />
        </g>
      );
    case 'caja_espalda':
      return (
        <>
          <rect x="40" y="20.5" width="15" height="12.5" rx="1.6" fill="#E4572E" />
          <path d="M40 25 h15" stroke="#FFFFFF" strokeWidth="1" />
          <path d="M44.5 29.5 h6" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
        </>
      );
    case 'placa':
      return (
        <>
          <rect x="28.4" y="39" width="7.6" height="4.4" rx="1" fill="#FFFFFF" />
          <path d="M29.8 41.2 h4.8" stroke="#1A7A5C" strokeWidth="0.8" />
        </>
      );
  }
}

function objeto(tipo: Objeto): ReactNode {
  switch (tipo) {
    case 'billete':
      return (
        <>
          <rect x="21.5" y="49" width="12.5" height="7" rx="1" fill="#26A17B" stroke="#145F48" strokeWidth="0.6" />
          <circle cx="27.75" cy="52.5" r="1.8" fill="#CDEBDF" />
        </>
      );
    case 'bolsa':
      return (
        <>
          <path d="M24.8 50.5 Q27.5 45.6 30.2 50.5" stroke="#E4572E" fill="none" strokeWidth="1.2" />
          <rect x="22.8" y="50" width="9.6" height="8.4" rx="1" fill="#E4572E" />
        </>
      );
    case 'caja':
      return (
        <>
          <rect x="21.8" y="49" width="11.6" height="8.8" fill="#C68B4E" stroke="#7A5230" strokeWidth="0.6" />
          <path d="M21.8 52 h11.6 M27.6 49 v3" stroke="#7A5230" strokeWidth="0.6" />
        </>
      );
    case 'carpeta':
      return (
        <>
          <rect x="21.8" y="48" width="5" height="2.2" rx="0.5" fill="#FFF6DE" {...T} />
          <rect x="21.8" y="49.2" width="11.6" height="8" rx="1" fill="#FFF6DE" {...T} />
        </>
      );
    case 'atomizador':
      return (
        <>
          <rect x="24" y="51" width="6.2" height="7.6" rx="1.6" fill="#CDEBDF" stroke="#1A7A5C" strokeWidth="0.7" />
          <path d="M25 51 V49 H29.2 L31.6 47.8 V50 H29.2 V51 Z" fill="#1A7A5C" />
        </>
      );
    case 'cuchara':
      return (
        <>
          <path d="M23.5 58 L30 49" stroke="#8A9A95" strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="30.8" cy="47.9" rx="2.1" ry="1.3" fill="#8A9A95" transform="rotate(-55 30.8 47.9)" />
        </>
      );
    case 'bandeja':
      return (
        <>
          <path d="M21.8 50 Q27.2 42.6 32.6 50 Z" fill="#E3E9E7" stroke="#8A9A95" strokeWidth="0.6" />
          <circle cx="27.2" cy="45.2" r="0.9" fill="#8A9A95" />
          <ellipse cx="27.2" cy="50.4" rx="8" ry="1.6" fill="#D3DED9" stroke="#8A9A95" strokeWidth="0.6" />
        </>
      );
    case 'llaves':
      return (
        <g stroke="#F5B82E" strokeWidth="1.2" fill="none" strokeLinecap="round">
          <circle cx="26.5" cy="50.8" r="2.3" />
          <path d="M28.2 52.5 L32 56.3 M30.4 54.7 l1.3 -1.3 M31.6 55.9 l1.3 -1.3" />
        </g>
      );
    case 'llave':
      return (
        <>
          <path d="M23 57.5 L29.6 50.9" stroke="#8A9A95" strokeWidth="2" strokeLinecap="round" />
          <circle cx="30.8" cy="49.7" r="2.5" fill="none" stroke="#8A9A95" strokeWidth="1.6" />
        </>
      );
    case 'corazon':
      return (
        <path
          d="M27.5 57.5 C21.8 53.6 22.2 49 25.4 49 C26.8 49 27.5 50.1 27.5 50.1 C27.5 50.1 28.2 49 29.6 49 C32.8 49 33.2 53.6 27.5 57.5 Z"
          fill="#E4572E"
        />
      );
  }
}

export function AbejaVestida({ ocupacion, tam = 140, className = '', style }: { ocupacion: string; tam?: number; className?: string; style?: CSSProperties }) {
  const id = useId().replace(/:/g, '');
  const a = ATUENDOS[ocupacion] ?? { cuerpo: ['placa'] as Cuerpo[] };
  const clip = `cuerpo-${id}`;
  return (
    <svg className={`abeja abeja-vestida ${className}`} style={style} width={tam} height={tam} viewBox="2 8 60 54" aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <ellipse cx="34" cy="37" rx="13" ry="10" />
        </clipPath>
      </defs>
      {a.cuerpo?.includes('caja_espalda') && cuerpo('caja_espalda', clip)}
      <ellipse className="abeja__ala" cx="29" cy="24" rx="7" ry="10" fill="#FFFFFF" opacity="0.92" stroke="#B8C6C1" strokeWidth="0.6" transform="rotate(-20 29 25)" />
      <ellipse className="abeja__ala abeja__ala--2" cx="38" cy="23" rx="6" ry="9" fill="#FFFFFF" opacity="0.85" stroke="#B8C6C1" strokeWidth="0.6" transform="rotate(18 38 24)" />
      <ellipse cx="34" cy="37" rx="13" ry="10" fill="#F5B82E" />
      <g clipPath={`url(#${clip})`}>
        <rect x="30" y="24" width="4" height="26" fill="#0E1A17" />
        <rect x="38" y="24" width="4" height="26" fill="#0E1A17" />
      </g>
      <path d="M47 37 L52 37 L47 40 Z" fill="#0E1A17" />
      {a.objeto && <path d="M27.5 46 L26.4 49 M34 47 L33.6 50 M40 45.6 L41 48.6" stroke="#0E1A17" strokeWidth="1.2" strokeLinecap="round" />}
      {a.cuerpo?.filter((c) => c !== 'caja_espalda').map((c) => <g key={c}>{cuerpo(c, clip, a.colorCuerpo)}</g>)}
      <circle cx="20" cy="37" r="6.5" fill="#0E1A17" />
      <circle cx="18" cy="35.5" r="1.4" fill="#FFFFFF" />
      <path d="M17.6 39.6 Q19 40.8 20.6 39.8" stroke="#F5F8F7" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M18 31 Q15 25 12 24" fill="none" stroke="#0E1A17" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21 31 Q21 25 19 22" fill="none" stroke="#0E1A17" strokeWidth="1.6" strokeLinecap="round" />
      {a.cabeza && cabeza(a.cabeza, a.colorCabeza)}
      {a.objeto && objeto(a.objeto)}
    </svg>
  );
}
