// Convierte dist-demo/index.html en una página para publicar como enlace de prueba
// (quita <html>, <head> y <body>, que la plataforma agrega por su cuenta).
import fs from 'node:fs';
const archivo = new URL('../dist-demo/index.html', import.meta.url);
let html = fs.readFileSync(archivo, 'utf8');
html = html
  .replace(/<!doctype html>/i, '')
  .replace(/<\/?html[^>]*>/gi, '')
  .replace(/<\/?head>/gi, '')
  .replace(/<\/?body>/gi, '')
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '');
fs.writeFileSync(new URL('../dist-demo/chambea-demo.html', import.meta.url), html.trim() + '\n');
console.log('Listo: web/dist-demo/chambea-demo.html');
