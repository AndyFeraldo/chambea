// Dibuja "Mi panal" como imagen PNG, en el navegador (no se envía a ningún lado).
import type { Competencia, Dimension, ResultadoPrimerPaso, Ruta } from '@shared/tipos';
import { t } from './i18n';
import { etiquetaHex, ORDEN_DIMENSIONES, type Celda } from './estado';

const C = {
  verde: '#26A17B',
  verdeOscuro: '#1A7A5C',
  miel: '#F5B82E',
  negro: '#0E1A17',
  crema: '#FFF6DE',
  gris: '#F5F8F7',
  suave: '#4A5A55',
  blanco: '#FFFFFF',
};
const FONDO: Record<Dimension, string> = {
  conocimiento: '#CDEBDF',
  habilidad: '#F5B82E',
  cualidad: '#E3E9E7',
  competencia: '#1A7A5C',
};
const TITULO = "'Bricolage Grotesque', system-ui, sans-serif";
const TEXTO = "'Inter', system-ui, sans-serif";
const ANCHO = 1080;
const M = 64; // margen

function lineas(ctx: CanvasRenderingContext2D, texto: string, ancho: number): string[] {
  const palabras = texto.split(/\s+/);
  const out: string[] = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (ctx.measureText(prueba).width > ancho && actual) {
      out.push(actual);
      actual = p;
    } else actual = prueba;
  }
  if (actual) out.push(actual);
  return out;
}

function hexagono(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number) {
  const h = w * 0.9;
  ctx.beginPath();
  ctx.moveTo(cx - w / 4, cy - h / 2);
  ctx.lineTo(cx + w / 4, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy);
  ctx.lineTo(cx + w / 4, cy + h / 2);
  ctx.lineTo(cx - w / 4, cy + h / 2);
  ctx.lineTo(cx - w / 2, cy);
  ctx.closePath();
}

export interface DatosImagen {
  celdas: Celda[];
  comp: (id: string) => Competencia | undefined;
  ruta: Ruta | null;
  paso: ResultadoPrimerPaso | null;
  region: string;
}

/** Devuelve la imagen como data URL PNG. */
export async function generarImagen(d: DatosImagen): Promise<string> {
  await document.fonts?.ready;
  const celdas = [...d.celdas].sort(
    (a, b) => ORDEN_DIMENSIONES.indexOf(a.dimension) - ORDEN_DIMENSIONES.indexOf(b.dimension),
  );
  const prioridad: Dimension[] = ['competencia', 'cualidad', 'habilidad', 'conocimiento'];
  const vistas = new Set<string>();
  const conEvidencia = [...celdas]
    .filter((c) => c.evidencia)
    .sort((a, b) => prioridad.indexOf(a.dimension) - prioridad.indexOf(b.dimension))
    .filter((c) => !vistas.has(c.evidencia!) && vistas.add(c.evidencia!))
    .slice(0, 4);

  // Medición previa para calcular el alto.
  const medir = document.createElement('canvas').getContext('2d')!;
  const hexW = 168;
  const porFila = 5;
  const filas = Math.ceil(celdas.length / porFila);
  const altoColmena = filas * hexW * 0.9 + hexW * 0.45 + 20;
  medir.font = `500 30px ${TEXTO}`;
  const altoEvid = conEvidencia.reduce(
    (s, c) => s + 48 + lineas(medir, `«${c.evidencia}»`, ANCHO - 2 * M - 40).length * 40,
    0,
  );
  const alto = 260 + 70 + altoColmena + 80 + (conEvidencia.length ? 60 + altoEvid : 0) + 200 + 230 + 190;

  const canvas = document.createElement('canvas');
  canvas.width = ANCHO;
  canvas.height = alto;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = C.gris;
  ctx.fillRect(0, 0, ANCHO, alto);

  // Cabecera
  ctx.fillStyle = C.negro;
  ctx.fillRect(0, 0, ANCHO, 260);
  ctx.fillStyle = C.verde;
  ctx.beginPath();
  ctx.moveTo(ANCHO - 200, 0);
  ctx.lineTo(ANCHO, 0);
  ctx.lineTo(ANCHO, 260);
  ctx.lineTo(ANCHO - 200, 260);
  ctx.lineTo(ANCHO - 270, 130);
  ctx.closePath();
  ctx.fill();
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 44px 'Poppins', system-ui, sans-serif`;
  ctx.fillStyle = C.blanco;
  ctx.fillText('cham', M, 92);
  const wCham = ctx.measureText('cham').width;
  ctx.fillStyle = C.miel;
  ctx.fillText('bea', M + wCham, 92);
  ctx.font = `800 76px ${TITULO}`;
  ctx.fillStyle = C.blanco;
  ctx.fillText(t('resumen.titulo'), M, 190);
  ctx.font = `500 28px ${TEXTO}`;
  ctx.fillStyle = '#B9C8C3';
  ctx.fillText(d.region, M, 234);

  let y = 260 + 70;
  // Leyenda
  ctx.font = `600 26px ${TEXTO}`;
  let x = M;
  for (const dim of ORDEN_DIMENSIONES) {
    ctx.fillStyle = FONDO[dim];
    ctx.fillRect(x, y - 22, 26, 26);
    ctx.fillStyle = C.negro;
    const txt = t(`panal.dimensiones.${dim}`);
    ctx.fillText(txt, x + 36, y);
    x += 36 + ctx.measureText(txt).width + 40;
  }
  y += 40;

  // Colmena
  const espacio = hexW * 0.78;
  const inicioX = (ANCHO - (Math.min(porFila, celdas.length) - 1) * espacio) / 2;
  celdas.forEach((c, i) => {
    const fila = Math.floor(i / porFila);
    const col = i % porFila;
    const cx = inicioX + col * espacio;
    const cy = y + hexW * 0.45 + fila * hexW * 0.9 + (col % 2 ? hexW * 0.45 : 0);
    hexagono(ctx, cx, cy, hexW);
    ctx.fillStyle = FONDO[c.dimension];
    ctx.fill();
    ctx.strokeStyle = C.gris;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = c.dimension === 'competencia' ? C.blanco : C.negro;
    ctx.font = `700 20px ${TEXTO}`;
    ctx.textAlign = 'center';
    const ls = lineas(ctx, etiquetaHex(d.comp(c.id)), hexW * 0.58).slice(0, 4);
    ls.forEach((l, j) => ctx.fillText(l, cx, cy + (j - (ls.length - 1) / 2) * 25 + 7));
    ctx.textAlign = 'left';
  });
  y += altoColmena + 30;

  // Evidencias
  if (conEvidencia.length) {
    ctx.font = `700 24px ${TEXTO}`;
    ctx.fillStyle = C.verdeOscuro;
    ctx.fillText(t('panal.loDemuestra').toUpperCase(), M, y);
    y += 30;
    for (const c of conEvidencia) {
      ctx.font = `500 30px ${TEXTO}`;
      const ls = lineas(ctx, `«${c.evidencia}»`, ANCHO - 2 * M - 40);
      const h = ls.length * 40 + 32;
      ctx.fillStyle = C.crema;
      ctx.beginPath();
      ctx.roundRect(M, y, ANCHO - 2 * M, h, 16);
      ctx.fill();
      ctx.fillStyle = C.negro;
      ls.forEach((l, j) => ctx.fillText(l, M + 20, y + 44 + j * 40));
      y += h + 16;
    }
    y += 30;
  }

  // Ruta
  y += 20;
  ctx.font = `700 24px ${TEXTO}`;
  ctx.fillStyle = C.verdeOscuro;
  ctx.fillText(t('resumen.miRuta').toUpperCase(), M, y);
  ctx.font = `800 48px ${TITULO}`;
  ctx.fillStyle = C.negro;
  ctx.fillText(d.ruta?.nombre ?? '—', M, y + 60);
  if (d.ruta) {
    const total = d.ruta.tiene.length + d.ruta.faltan.length;
    ctx.font = `600 28px ${TEXTO}`;
    ctx.fillStyle = C.suave;
    ctx.fillText(t('rutas.tienes', { x: d.ruta.tiene.length, y: total }), M, y + 106);
    ctx.fillStyle = '#E3E9E7';
    ctx.beginPath();
    ctx.roundRect(M + 220, y + 88, ANCHO - 2 * M - 220, 18, 9);
    ctx.fill();
    ctx.fillStyle = C.verdeOscuro;
    ctx.beginPath();
    ctx.roundRect(M + 220, y + 88, ((ANCHO - 2 * M - 220) * d.ruta.tiene.length) / total, 18, 9);
    ctx.fill();
  }
  y += 170;

  // Primer paso
  if (d.paso) {
    const p = d.paso.principal;
    ctx.fillStyle = C.verdeOscuro;
    ctx.beginPath();
    ctx.roundRect(M, y, ANCHO - 2 * M, 190, 24);
    ctx.fill();
    ctx.font = `700 24px ${TEXTO}`;
    ctx.fillStyle = C.miel;
    ctx.fillText(t('resumen.miPaso').toUpperCase(), M + 32, y + 50);
    ctx.font = `800 40px ${TITULO}`;
    ctx.fillStyle = C.blanco;
    ctx.fillText(p.titulo, M + 32, y + 104);
    ctx.font = `500 28px ${TEXTO}`;
    const ls = lineas(ctx, p.detalle, ANCHO - 2 * M - 64).slice(0, 1);
    ctx.fillText(ls[0] ?? '', M + 32, y + 150);
  }
  y += 230;

  // Pie honesto
  ctx.font = `600 26px ${TEXTO}`;
  ctx.fillStyle = C.suave;
  lineas(ctx, t('comun.noCertifica'), ANCHO - 2 * M).forEach((l, j) => ctx.fillText(l, M, y + j * 36));
  ctx.font = `500 22px ${TEXTO}`;
  ctx.fillText(`${t('comun.preliminar')} ${t('comun.notaIlustrativa')}`, M, y + 100);

  return canvas.toDataURL('image/png');
}
