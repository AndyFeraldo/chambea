// Dictado por voz para la DEMO.
// Usa el reconocimiento de voz del navegador (Chrome en Android, Safari en iPhone).
// ⚠️ Ese reconocimiento envía el audio al servicio del navegador (Google o Apple):
// es una excepción acordada solo para la demo. En producción se reemplaza por
// el reconocimiento de voz de QVAC en el backend propio (ver README).
import { useCallback, useEffect, useRef, useState } from 'react';

type Reconocedor = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function constructor(): (new () => Reconocedor) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => Reconocedor) | null;
}

export const vozDisponible = () => import.meta.env.VITE_VOZ !== 'apagada' && constructor() !== null;

export type ErrorVoz = 'permiso' | 'red' | 'nada' | 'otro' | null;

/**
 * Dictado: `empezar(textoActual)` agrega lo que la persona dice al final del texto,
 * mostrando en vivo lo que va reconociendo.
 */
export function useVoz(alCambiar: (texto: string) => void) {
  const [escuchando, setEscuchando] = useState(false);
  const [error, setError] = useState<ErrorVoz>(null);
  const rec = useRef<Reconocedor | null>(null);
  const cb = useRef(alCambiar);
  cb.current = alCambiar;

  useEffect(() => () => rec.current?.abort(), []);

  const detener = useCallback(() => rec.current?.stop(), []);

  const empezar = useCallback((base: string) => {
    const C = constructor();
    if (!C) return setError('otro');
    rec.current?.abort();
    const r = new C();
    r.lang = 'es-PE';
    r.continuous = true;
    r.interimResults = true;
    let definitivo = '';
    let oyoAlgo = false;
    const unir = (extra: string) => [base.trim(), extra.trim()].filter(Boolean).join(base.trim() ? ' ' : '');
    r.onresult = (e) => {
      let parcial = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) definitivo += res[0].transcript + ' ';
        else parcial += res[0].transcript;
      }
      oyoAlgo = true;
      cb.current(unir(definitivo + parcial));
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setError('permiso');
      else if (e.error === 'network') setError('red');
      else if (e.error === 'no-speech') setError('nada');
      else if (e.error !== 'aborted') setError('otro');
    };
    r.onend = () => {
      setEscuchando(false);
      if (oyoAlgo) cb.current(unir(definitivo));
    };
    setError(null);
    try {
      r.start();
      rec.current = r;
      setEscuchando(true);
    } catch {
      setError('otro');
    }
  }, []);

  return { escuchando, error, empezar, detener, disponible: vozDisponible() };
}
