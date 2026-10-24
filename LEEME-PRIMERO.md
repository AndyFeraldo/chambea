# Paquete de contexto de Chambea para Claude Code

## Qué es esto
Una carpeta con todo lo que Claude Code necesita para entender Chambea y empezar a construir el MVP.

## Cómo usarlo
1. Descomprime esta carpeta en la computadora de quien va a programar (idealmente, alguien de Sistemas).
2. Instala Claude Code (versión de escritorio o terminal) e inicia sesión.
3. Abre Claude Code **dentro de esta carpeta**. Claude Code lee automáticamente el archivo `CLAUDE.md`.
4. Copia y pega el contenido de `PROMPT-INICIAL.md` como primer mensaje.
5. Avanza fase por fase (ver sección 12 de `CLAUDE.md`), probando cada una antes de seguir.

## Lo que hay que reemplazar con datos reales
- `docs/03-investigacion-simulada.md`: entrevistas **simuladas**. Reemplazar por las reales.
- `data/*.json`: datos **ilustrativos**. Reemplazar con estándares de competencia del MTPE, EDO 2026, catálogo de Capacítate Perú y avisos reales.
- Enlaces de Empleos Perú y Capacítate Perú: confirmar y poner en `.env`.

## Requisitos de la computadora (los instalará Claude Code con tu ayuda)
- Node.js (versión LTS).
- Para la fase de QVAC: seguir la documentación oficial en https://docs.qvac.tether.io.
