# CLAUDE.md — Chambea (MVP) · Innovathon Ulima x Tether 2026

Eres el desarrollador principal de **Chambea**, un MVP para la Innovathon Ulima x Tether (reto del Ministerio de Trabajo y Promoción del Empleo del Perú, MTPE). Este archivo es tu prompt maestro. Léelo completo y luego lee los documentos de `docs/` en el orden indicado antes de escribir código.

El equipo tiene 5 integrantes (Comunicaciones, 2 de Sistemas, Ingeniería Industrial y Administración). **La persona que te da instrucciones puede no saber programar**: explica cada comando que pidas ejecutar, en español simple, y nunca asumas que sabe usar la terminal.

**Fecha límite:** Demo Day el viernes 30 de octubre de 2026 (pitch de 3 minutos + preguntas del jurado). Desarrollo: lunes 26 a jueves 29 de octubre.

---

## 1. Qué es Chambea (una frase)

Un **servicio** (no solo una app) que ayuda a personas que aprendieron su oficio en la práctica a reconocer lo que ya saben hacer y a convertirlo en un siguiente paso laboral concreto (recolocación lateral), usando servicios que el Estado ya ofrece: Empleos Perú, Capacítate Perú, Centros de Empleo y la certificación de competencias del MTPE.

Eslogan: **"Tu chamba cuenta."**

## 2. Lee esto antes de programar (en este orden)

1. `docs/01-reto-y-contexto.md` — el reto, la rúbrica, las reglas del Ministerio y el público.
2. `docs/02-solucion-chambea.md` — qué hace Chambea, flujo y lo que NO promete.
3. `docs/03-investigacion-simulada.md` — 5 entrevistas **SIMULADAS**, patrones e insight de trabajo.
4. `docs/04-marca.md` — colores, tipografías, tono, logo.
5. `docs/05-arquitectura-qvac.md` — arquitectura, QVAC y privacidad.
6. `data/*.json` — catálogo de competencias, ocupaciones, regiones y capacitaciones (**datos ilustrativos**).

Si algo de este archivo contradice a `docs/`, manda este archivo. Si algo no está definido, pregunta antes de inventarlo.

## 3. Objetivo del MVP

Un prototipo **funcional y usable** en el navegador del celular, que reproduzca el recorrido del flyer de 4 pasos con datos de ejemplo, y que pueda funcionar **sin IA real** (modo simulado) y luego **con QVAC** cambiando una variable de configuración.

### Dentro del alcance
- Aplicación web *mobile-first* (responsive), en español, lista para verse en un celular de gama baja.
- Los 4 pasos completos (ver sección 6) + pantalla de inicio + resumen final "Mi panal".
- Motor de coincidencias (matching) y lógica de "primer paso" (sección 7), con datos de `data/`.
- Capa de IA intercambiable: `mock` (reglas y palabras clave, sin modelo) y `qvac` (QVAC vía API compatible con OpenAI).
- Selección de región (3 regiones de ejemplo) para demostrar escalabilidad.
- Modo "Asesor" (misma interfaz, con texto que indica que se usa acompañado en un Centro de Empleo).

### Fuera del alcance (no lo construyas)
- Login, cuentas de usuario, base de datos de personas.
- Integración real con Empleos Perú o Capacítate Perú (solo enlaces configurables).
- Certificación, puntajes oficiales, ranking de personas, gamificación.
- Panel del empleador.

## 4. Reglas no negociables

1. **Privacidad:** no guardes datos personales en ningún servidor ni base de datos. Todo lo que la persona cuenta vive en la sesión del navegador y se procesa en el backend propio (QVAC), sin enviarse a terceros. No uses APIs de IA en la nube (OpenAI, Google, etc.) ni el reconocimiento de voz del navegador (Web Speech API envía audio a terceros).
2. **Honestidad:** la interfaz nunca dice que Chambea "certifica" ni que "consigue trabajo". Siempre: "identificación preliminar" y "te conectamos con…". Debe aparecer el aviso: *"Esto no es una certificación. Para certificarte, el Ministerio de Trabajo tiene un proceso oficial."*
3. **Recolocar, no ascender:** solo se sugieren ocupaciones de nivel operativo similar (campo `nivel` en `data/ocupaciones.json`). Nunca rutas a jefaturas, gerencias o puestos que exigen título universitario o idiomas.
4. **No asumir la situación:** el recorrido empieza preguntando la situación laboral (3 perfiles) y la lógica se adapta.
5. **Lenguaje de la persona:** textos cortos, tú, sin jerga ("brecha de competencias", "upskilling" están prohibidos). Lectura fácil.
6. **Datos ilustrativos marcados:** todo dato de `data/` tiene `"ilustrativo": true`. Muestra en la UI una nota discreta "Datos de ejemplo para el prototipo" mientras sea así.
7. **No inventes URLs ni nombres de cursos reales.** Los enlaces de Empleos Perú y Capacítate Perú van en configuración (`.env`) y quedan como `TODO` hasta que el equipo los confirme.
8. **Accesibilidad:** contraste AA, botones de al menos 48 px de alto, funciona con conexión lenta (sin imágenes pesadas), tamaño de letra base 16 px o más.

## 5. Stack y arquitectura

Usa este stack salvo que el equipo pida otro:

- **Monorepo** con dos carpetas: `web/` (frontend) y `server/` (backend).
- **Frontend:** Vite + React + TypeScript. CSS simple (CSS Modules o un archivo de tokens), sin librerías pesadas de UI.
- **Backend:** Node.js (LTS) + TypeScript + Express (o Fastify). Expone una API REST pequeña.
- **IA:** interfaz `AIProvider` con dos implementaciones:
  - `MockProvider`: extrae competencias por palabras clave usando `keywords` del catálogo. Debe funcionar siempre, sin internet ni modelo.
  - `QvacProvider`: llama a un servidor QVAC con API compatible con OpenAI (configurable con `QVAC_BASE_URL` y `QVAC_MODEL`). Pide salida JSON estricta y valídala; si falla, cae al `MockProvider`.
  - Selección con `AI_PROVIDER=mock|qvac` en `.env`.
- **Datos:** archivos JSON en `data/`, cargados por el backend. Nada de base de datos en el MVP.
- **Scripts:** un solo comando para levantar todo en desarrollo (por ejemplo `npm run dev` en la raíz) y un `README.md` en español con pasos para alguien que no programa.

Antes de escribir `QvacProvider`, **lee la documentación oficial**: https://docs.qvac.tether.io (SDK `@qvac/sdk` en npm y CLI `@qvac/cli`, que ofrece un servidor HTTP compatible con OpenAI). Confirma ahí los comandos exactos; no los adivines. Usa solo paquetes oficiales de Tether (hay un paquete de Python de terceros llamado `qvac-sdk` en PyPI: **no lo uses**).

### Endpoints sugeridos
- `GET /api/regiones` → lista de regiones.
- `POST /api/extraer` → recibe `{ texto, respuestas_guiadas }`, devuelve `{ competencias: [{id, dimension, evidencia}] }`.
- `POST /api/rutas` → recibe `{ competencias_ids, region_id, perfil }`, devuelve ocupaciones ordenadas con cobertura, faltantes, demanda y alias.
- `POST /api/primer-paso` → recibe `{ ocupacion_id, faltantes, perfil, horas_semana, modalidad }`, devuelve una sola recomendación + alternativas.
- `GET /api/salud` → estado del proveedor de IA (`mock` o `qvac` conectado).

## 6. Flujo y pantallas (igual al flyer)

0. **Inicio:** logo, "Tu chamba cuenta.", una línea de qué hace, botón "Empezar", enlace "Lo hago con un asesor". Selector de región.
1. **Cuéntalo (ANTES):**
   - Pregunta 1: "¿Cómo estás hoy con tu trabajo?" con 3 botones: "Busco trabajo" (`sin_empleo`), "Trabajo, pero es inestable" (`informal`), "Tengo trabajo, pero me preocupa perderlo" (`planilla_riesgo`).
   - Luego 4 preguntas guiadas, una por pantalla, con caja de texto grande (y botón de audio deshabilitado con etiqueta "Voz: próximamente con QVAC"):
     1. "Cuéntame cómo aprendiste lo que haces hoy."
     2. "¿Cómo es un día normal en tu trabajo?"
     3. "¿Qué cosas te piden a ti porque saben que las haces bien?"
     4. "¿Cómo le demostrarías a un nuevo empleador que sabes hacerlo?"
   - Cada pregunta se puede saltar. Mostrar un ejemplo de respuesta en gris.
2. **Arma tu panal (HOY):** hexágonos por competencia detectada, de 4 colores (Sabe / Sabe hacer / Cómo es / Logra). Cada celda se puede quitar o confirmar ("Sí, eso hago"). Botón "Agregar algo que falta" con lista del catálogo. Si hay evidencia (frase de la persona), se muestra como "Lo demuestra: «…»".
3. **Mira tus rutas (DESPUÉS):** aviso si la ocupación actual tiene demanda baja en la región ("La demanda de [ocupación] baja en tu región"). Tarjetas de 3 ocupaciones como máximo: nombre, "Tienes X de Y", barra, etiqueta de demanda ("Se busca en tu región"), y "También se publica como: …" (alias de avisos reales). Al tocar una tarjeta: lista de lo que ya tiene (verde) y lo que falta (gris).
4. **Da el paso:** 3 preguntas cortas (horas libres por semana: 1–3 / 4–6 / 7+; modalidad: celular / presencial / me da igual; costo: solo gratis / puedo pagar poco). Luego **una** recomendación principal y dos alternativas: Capacítate Perú (curso para lo que falta), Empleos Perú (postular), Hablar con un asesor (Centro de Empleo). Al final: "Luego: certificación de competencias del MTPE".
5. **Mi panal (resumen):** tarjeta con las competencias confirmadas, sus evidencias, la ruta elegida y el primer paso. Botón "Descargar mi panal (imagen)" generado en el navegador. Aviso de identificación preliminar. Botón "Empezar de nuevo" que borra todo.

Barra de progreso arriba (paso 1 de 4, etc.) y botón "Atrás" en todas las pantallas.

## 7. Lógica de matching y primer paso

**Cobertura por ocupación** (solo ocupaciones con `nivel === "operativo"` y distintas a la actual):
```
peso por dimensión: competencia = 3, habilidad = 2, conocimiento = 2, cualidad = 1
cobertura = suma(pesos de requeridas que la persona tiene) / suma(pesos de todas las requeridas)
```
Ordena por: (1) cobertura, (2) demanda en la región (alta > media > baja). Muestra máximo 3. Si la persona eligió su ocupación actual, úsala para el aviso de demanda.

**Ajuste por perfil:**
- `sin_empleo`: prioriza ocupaciones con cobertura ≥ 0.8 (puede postular ya).
- `informal`: prioriza cursos de ≤ 4 semanas y ≤ 3 h/semana, modalidad celular.
- `planilla_riesgo`: prioriza capacitación antes que postular, aunque la cobertura sea alta.

**Primer paso (una sola recomendación):**
- cobertura ≥ 0.85 → "Postula en Empleos Perú" (salvo `planilla_riesgo`, que primero ve el curso de lo que falta).
- 0.5 ≤ cobertura < 0.85 → "Capacítate": el curso de `data/capacitaciones.json` que cubra más faltantes y respete horas, modalidad y costo.
- cobertura < 0.5 o sin datos suficientes → "Habla con un asesor en un Centro de Empleo".
Siempre explica el porqué en una línea: "Porque ya sabes [2 competencias] y solo te falta [1]."

## 8. Datos (`data/`)

- `competencias.json`: catálogo con `id`, `dimension` (`conocimiento|habilidad|cualidad|competencia`), `nombre`, `nombre_simple` (como lo diría la persona) y `keywords` para el modo mock.
- `ocupaciones.json`: 5 ocupaciones priorizadas por el MTPE, con `requeridas` (ids), `alias` (cómo aparecen en avisos), `nivel`, `requisitos_minimos`.
- `regiones.json`: demanda por ocupación y región (`alta|media|baja`).
- `capacitaciones.json`: cursos de ejemplo con `cubre` (ids), duración, horas, modalidad y costo.

Todos son **ilustrativos**. El equipo los reemplazará con los estándares de competencia del MTPE, la Encuesta de Demanda Ocupacional 2026, el catálogo de Capacítate Perú y el análisis de avisos reales. Diseña el código para que reemplazar estos archivos (o agregar una región nueva) **no requiera cambiar código**.

## 9. Prompt para el `QvacProvider` (extracción)

Usa un prompt de sistema similar a este y fuerza salida JSON:

```
Eres un orientador laboral peruano. Recibes lo que una persona cuenta sobre su trabajo, con sus palabras.
Tu tarea: identificar SOLO competencias del catálogo dado (por id) que el texto respalde.
Reglas: no inventes; si no hay evidencia, no la incluyas. Para cada una, copia la frase exacta de la persona que la respalda.
Devuelve únicamente JSON: {"competencias":[{"id":"...","evidencia":"frase textual"}]}
Catálogo: <lista de id + nombre + dimension>
```
Valida que cada `id` exista en el catálogo; descarta lo demás.

## 10. Escalabilidad

- Regiones, ocupaciones, competencias y cursos se agregan solo con datos.
- Textos de la interfaz en un archivo de traducciones (`web/src/i18n/es.json`) para poder agregar quechua después.
- `AI_PROVIDER` permite pasar de mock a QVAC sin tocar la interfaz.
- Documenta en `README.md` cómo agregar una región nueva.

## 11. Marca e interfaz

Ver `docs/04-marca.md`. Resumen: verde `#26A17B` (principal), verde oscuro `#1A7A5C` (botones y texto verde pequeño), amarillo miel `#F5B82E` (acento), negro panal `#0E1A17`, crema `#FFF6DE`. Títulos en Bricolage Grotesque, textos en Inter (Google Fonts, con respaldo `system-ui`). Hexágonos como motivo (celdas del panal, números de paso). Logo en `assets/`.

## 12. Plan de trabajo y criterios de aceptación

Trabaja por fases. Al terminar cada una, muéstrale al equipo cómo probarla y espera su visto bueno.

1. **Esqueleto (lunes):** monorepo, `npm run dev` levanta web y server, pantalla de inicio con marca, `/api/salud` responde. ✔ Se abre en el celular por la red local.
2. **Recorrido con mock (lunes–martes):** pasos 1–5 funcionando con `MockProvider` y datos de `data/`. ✔ El caso de Rosa (ver `docs/03`) produce "Vendedora de tienda" como primera ruta y un curso como primer paso.
3. **Pulido (miércoles):** diseño fiel al flyer, accesibilidad, textos revisados, descarga de "Mi panal". ✔ Funciona en pantalla de 360 px.
4. **QVAC (miércoles–jueves):** `QvacProvider` siguiendo la documentación oficial, con caída automática a mock. ✔ `/api/salud` muestra `qvac` conectado y el caso de Rosa funciona.
5. **Demo (jueves):** modo demo con 2 casos precargados (Rosa y Marleny) para el pitch. ✔ El recorrido completo dura menos de 90 segundos.

## 13. Forma de trabajar

- Antes de cada fase, escribe un plan corto y pide confirmación.
- Commits pequeños con mensajes en español.
- Si algo es ambiguo, pregunta. Si un dato falta, usa un marcador `TODO` visible, no lo inventes.
- Al final de cada sesión, actualiza `README.md` con lo que cambió y cómo probarlo.
