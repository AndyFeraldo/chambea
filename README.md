# Chambea · Tu chamba cuenta.

MVP para la **Innovathon Ulima x Tether 2026** (reto del Ministerio de Trabajo y Promoción del Empleo, MTPE).

Chambea ayuda a personas que aprendieron su oficio en la práctica a reconocer lo que ya saben hacer y a convertirlo en un siguiente paso laboral concreto, con lo que el Estado ya ofrece: Empleos Perú, Capacítate Perú, Centros de Empleo y la certificación de competencias del MTPE.

> ⚠️ Todos los datos de `data/` son **ilustrativos** y las entrevistas de `docs/03` son **simuladas**. Reemplázalos con datos reales antes de presentarlos como evidencia.

---

## Qué hay en el prototipo

| Pantalla | Qué hace |
|---|---|
| Inicio | Abejas volando, eslogan, los 4 pasos en hexágonos, región, "Empezar", "Lo hago con un asesor" y 2 ejemplos (Rosa y Marleny) |
| 1 · Cuéntalo | Situación, ocupación y **entrevista guiada**: 3 preguntas por dimensión (tareas, herramientas, confianza/logros) + 1 que **se adapta al oficio** (`data/entrevista.json`). Se responde hablando o escribiendo, y la pregunta se puede escuchar. Luego, **intereses** y **lo que prefiere evitar**, y **preguntas puente**: "¿también sabes hacer esto?", con lo que más la acerca a otras profesiones |
| 2 · Tus habilidades | Colmena animada donde cada celda es una **habilidad con nombre claro** ("Organización y orden", "Control de inventario"…), en 4 colores: conocimientos, habilidades, cualidades y logros. Al tocar una celda: de dónde sale (tu relato, tu tarea o tu oficio), confirmar o quitar. "Agregar más habilidades": eliges a qué trabajo te quieres acercar y agregas lo que ya sabes |
| 3 · Mira tus rutas | Carrusel de hasta 5 rutas. Cada trabajo llega con **su abeja vestida para ese oficio**, que entra volando desde la derecha; con "Siguiente" sale por la izquierda y entra la del siguiente trabajo. Mini panal con lo que tienes y lo que **falta**, demanda, alias y **enlaces a ofertas reales** (Empleos Perú y Computrabajo) |
| 4 · Da el paso | **Una sola pantalla visual**: muestra lo que falta para la ruta elegida, pregunta tiempo libre (con su equivalencia diaria) y dónde aprender (pre-marcado según la situación), y una **vista previa en vivo** del curso y de cómo pasarías de 6 de 7 a 7 de 7. Luego, **una** recomendación con su porqué, **línea de tiempo** (hoy → semanas del curso → postular → certificación) y 2 alternativas. Ya no se pregunta el costo: todos los cursos recomendados son gratuitos |
| Mi panal | Tarjeta resumen, imagen descargable, **plan de acción** con checklist (Capacíta-T, CUL, postular, certificación), **texto para presentarse** (copiar o WhatsApp) y **QR/enlace para el asesor**: el panal viaja dentro del enlace, sin servidor |
| Siempre | Menú con **Ir al inicio**, **Guardar mi progreso en este celular** (opcional, solo en el teléfono), **Crear cuenta en Empleos Perú** y **Borrar todo** |

**Diseño:** una idea por pantalla, poco texto, íconos grandes y movimiento de marca: abejas con estela, celdas que brotan y transiciones suaves. Si el teléfono tiene activado "reducir movimiento", las animaciones se apagan.

**Privacidad:** no hay cuentas, ni base de datos, ni analítica. Lo que la persona cuenta vive solo en la memoria del navegador. El servidor no guarda ni registra esos textos.

---

## Cómo probarlo en tu computadora (paso a paso)

### 1. Instala Node.js (una sola vez)
Entra a https://nodejs.org, descarga la versión que dice **LTS** e instálala con las opciones por defecto.

### 2. Descarga el proyecto
En GitHub, botón verde **Code → Download ZIP**, y descomprímelo. (Si sabes usar git: `git clone` del repositorio).

### 3. Abre una terminal dentro de la carpeta
- **Windows:** abre la carpeta `chambea`, haz clic en la barra de direcciones, escribe `cmd` y presiona Enter.
- **Mac:** clic derecho sobre la carpeta → "Nuevo terminal en la carpeta".

### 4. Instala las dependencias (una sola vez)
```
npm install
```
Descarga las librerías que usa el proyecto. Tarda 1 o 2 minutos.

### 5. Crea tu archivo de configuración (una sola vez)
- **Windows:** `copy .env.example .env`
- **Mac/Linux:** `cp .env.example .env`

### 6. Levanta Chambea
```
npm run dev
```
Este comando enciende dos cosas: el **servidor** (puerto 3001) y la **web** (puerto 5173). Abre en tu navegador: **http://localhost:5173**

Para apagarlo, presiona `Ctrl + C` en la terminal.

### 7. Verlo en tu celular
El celular y la computadora tienen que estar en el **mismo wifi**. Al correr `npm run dev`, la terminal muestra una línea `Network: http://192.168.x.x:5173`. Escribe esa dirección en el navegador del celular.

---

## Otros comandos útiles

| Comando | Para qué sirve |
|---|---|
| `npm test` | Prueba el motor con los casos de Rosa y Marleny. Debe decir `pass 7` |
| `npm run build` y luego `npm start` | Versión final: un solo servidor en http://localhost:3001 |
| `npm run build:demo` | Genera `web/dist-demo/index.html`: la app completa en **un solo archivo** que funciona sin servidor (motor en el navegador). Sirve para compartir un enlace de prueba |

---

## Voz (micrófono) en la demo

En cada pregunta hay un botón grande de micrófono: **"Toca y habla"**. Lo que la persona dice aparece escrito en vivo y se puede corregir con "Prefiero escribir".

- Funciona en **Chrome (Android)** y **Safari (iPhone)**. Necesita internet y que la página se abra por **HTTPS** (GitHub Pages) o en `localhost`. Por la red local (`http://192.168.x.x`) el navegador bloquea el micrófono.
- La primera vez, el teléfono pide permiso para usar el micrófono.
- ⚠️ **Excepción solo para la demo:** el dictado usa el reconocimiento de voz del navegador, que envía el audio a Google o Apple. Esto va contra la regla de privacidad de `CLAUDE.md` y se acordó solo para la demostración. En producción se reemplaza por el reconocimiento de voz de **QVAC** en el backend propio. El código está aislado en `web/src/voz.ts`. Para apagar la voz, usa `VITE_VOZ=apagada`.

## Demo en internet (GitHub Pages)

La demo se publica como sitio estático: el motor corre en el navegador y no necesita servidor.

1. Para actualizarla: `bash scripts/publicar-pages.sh`. Construye la web y la sube a la rama `gh-pages`.
2. La primera vez, en GitHub: **Settings → Pages → Branch: `gh-pages` / `(root)` → Save**. En una cuenta gratuita, el repositorio debe ser público para usar Pages.
3. La dirección queda así: `https://<usuario>.github.io/chambea/`

---

## Conectar la IA local con QVAC

Por defecto Chambea usa el modo **mock**: busca palabras clave del catálogo, sin modelo y sin internet. Para usar un modelo real con QVAC, la IA local de Tether:

1. Instala el CLI oficial de QVAC (paquete oficial `@qvac/cli` en npm):
   ```
   npm i -g @qvac/cli
   qvac doctor
   ```
   `qvac doctor` revisa si tu computadora puede correr QVAC.
2. En la carpeta del proyecto ya está `qvac.config.json`, que registra un modelo con el nombre `chambea-llm`. Levanta el servidor QVAC compatible con OpenAI:
   ```
   qvac serve --openai
   ```
   Queda escuchando en `http://127.0.0.1:11434`. La primera vez descarga el modelo, así que puede tardar.
3. En `.env` cambia `AI_PROVIDER=mock` por `AI_PROVIDER=qvac` y reinicia `npm run dev`.
4. Comprueba que funcione en http://localhost:3001/api/salud. Debe decir `"proveedor":"qvac","conectado":true`.

Si QVAC no responde, o responde algo que no es JSON válido, Chambea **vuelve sola al modo mock** y el recorrido sigue funcionando. Además, cada competencia que propone el modelo se valida contra el catálogo. Si el modelo no puede citar una frase que la persona realmente dijo, la competencia se descarta.

> Los comandos salen del README oficial de `@qvac/cli` 0.16.0. El modelo `QWEN3_600M_INST_Q4` es el ejemplo de esa documentación y es pequeño. Para mejores resultados, prueben un modelo más grande del catálogo (`GET http://127.0.0.1:11434/v1/models/catalog?role=chat`). Confírmenlo en https://docs.qvac.tether.io y con el equipo de Tether.

---

## De tareas a habilidades

Chambea razona como la lámina del workshop "Descubriendo el valor de cada tarea": cada tarea que la persona cuenta revela habilidades transferibles.

| Tarea | Revela |
|---|---|
| Limpiar oficinas | organización, atención al detalle y cumplimiento de protocolos |
| Cobrar en caja | precisión, manejo de dinero y atención al cliente |
| Cocinar | organización de tiempos, higiene y trabajo bajo presión |
| Vender en tienda | comunicación, identificación de necesidades y orientación al cliente |

Las 14 tareas están en `data/tareas.json`. En el panal, cada celda deducida así dice "Viene de tu tarea: …". El modo QVAC recibe la misma guía en su prompt.

## Del oficio a las habilidades

Si la persona elige su oficio o lo menciona al hablar ("soy almacenero", "trabajé de mesera"), el panal suma las habilidades típicas de ese oficio, como "Típica de tu oficio", para que las confirme o las quite. Las menciones se configuran en el campo `menciones` de cada ocupación (`data/ocupaciones.json`) y el nombre claro de cada habilidad en `nombre_corto` (`data/competencias.json`).

En Rutas, las celdas que **faltan** se pueden tocar: "¿Ya sabes hacer esto?". Si la persona dice que sí, se suma a su panal y las rutas se recalculan.

## Fuentes reales enlazadas

- **Empleos Perú** (MTPE): https://www.empleosperu.gob.pe/
- **Capacíta-T** (MTPE), plataforma de cursos gratuitos: https://capacitacionlaboral.trabajo.gob.pe/. Es el nombre actual de la oferta de capacitación virtual del Ministerio.
- **Ofertas por puesto:** búsquedas en vivo en Computrabajo (`https://pe.computrabajo.com/trabajo-de-<puesto>`), armadas con el campo `busqueda` de cada ocupación. Se usan búsquedas y no avisos sueltos porque los avisos caducan en días.
- Cursos con `"verificado": true` son temas que el MTPE anuncia en Capacíta-T (Ventas, Excel básico, Word básico, Atención al cliente, Seguridad y salud en el trabajo). Los demás dicen "Curso de ejemplo". Las duraciones son aproximadas.

## Cambiar o agregar datos (sin tocar código)

Todo está en `data/`:

- **Agregar una región:** en `data/regiones.json`, copia un bloque `{ "id": ..., "nombre": ..., "demanda": {...} }`, cambia el `id` (sin espacios, por ejemplo `cusco`), el nombre y la demanda (`alta`, `media` o `baja`) de cada ocupación. Guarda y recarga.
- **Agregar una ocupación:** en `data/ocupaciones.json`, con `nivel: "operativo"`, sus `requeridas` (ids de `competencias.json`) y sus `alias`. Agrega su demanda en cada región.
- **Agregar una competencia:** en `data/competencias.json`, con `dimension` (`conocimiento`, `habilidad`, `cualidad` o `competencia`), `nombre_simple` (cómo lo diría la persona) y `keywords` (para el modo mock). Opcional: `nombre_corto` para el texto del hexágono.
- **Agregar un curso:** en `data/capacitaciones.json`, con `cubre` (ids), semanas, horas, modalidad (`celular` o `presencial`) y costo (`gratuito` o `pagado`).
- **Cuando los datos sean reales:** cambia `"ilustrativo": true` a `false` y desaparecerá la nota "Datos de ejemplo para el prototipo".

**Enlaces oficiales (TODO):** cuando el equipo confirme las direcciones de Empleos Perú y Capacítate Perú, colócalas en `.env` (`EMPLEOS_PERU_URL` y `CAPACITATE_PERU_URL`). Mientras tanto, la app muestra "Enlace por confirmar (TODO)".

**Textos de la interfaz:** están en `web/src/i18n/es.json`. Para agregar quechua, se crea `qu.json` con las mismas claves.

---

## Cómo está construido

```
chambea/
├── data/          catálogo de competencias, ocupaciones, regiones, cursos y casos demo (JSON)
├── shared/src/    motor compartido: coincidencias, primer paso y extracción por palabras clave
├── server/src/    API en Node + Express  (/api/salud, /api/catalogo, /api/regiones,
│                  /api/extraer, /api/rutas, /api/primer-paso)
│   └── ia/        AIProvider → MockProvider (palabras clave) y QvacProvider (QVAC)
├── web/src/       app React + Vite, mobile-first
├── tests/         pruebas automáticas (npm test)
├── docs/          contexto del reto, solución, investigación simulada, marca y arquitectura
└── CLAUDE.md      instrucciones maestras del proyecto
```

**Lógica (CLAUDE.md, sección 7):**
- La cobertura se calcula con pesos: competencia 3, habilidad 2, conocimiento 2, cualidad 1. Solo cuentan ocupaciones `operativo` distintas a la actual. Se ordenan por cobertura y luego por demanda en la región.
- Primer paso: con cobertura ≥ 0,85 recomienda postular en Empleos Perú (si la persona está en planilla en riesgo, primero el curso). Entre 0,5 y 0,85 recomienda un curso que cubra lo que falta y respete horas, modalidad y costo. Por debajo de 0,5 recomienda un asesor.

## Registro de cambios

**28/10/2026 (paso 4 rediseñado):** las 3 preguntas sueltas pasan a una pantalla visual con el porqué, equivalencias de tiempo, opciones sugeridas según la situación, vista previa en vivo del curso y del avance, y línea de tiempo en el resultado. Se quita la pregunta de costo.

**28/10/2026 (entrevista inteligente y plataforma):** entrevista guiada por dimensiones con pregunta por oficio, intereses y límites que reordenan las rutas (+10 % / −20 %), preguntas puente, fichas de profesión con sector y descripción, insignias, "¿Por qué esta ruta?" con la fórmula, menú con inicio y guardado opcional en el celular, plan de acción, texto para presentarse, QR/enlace para el asesor, "¿Para quién es Chambea?" en el inicio y botón para escuchar las preguntas. Ver `docs/06-valor-y-hoja-de-ruta.md`.

**24/10/2026 (habilidades claras):** cada celda muestra el nombre de la habilidad. Se suman las habilidades típicas del oficio elegido o mencionado. "Agregar más habilidades" permite acercarse a otro trabajo, y en Rutas se pueden agregar las celdas que faltan. Marleny ahora ve primero Conserje (5 de 7) y luego Reponedor/a (5 de 7). Se corrigió que "cuento las cajas" contara como cobrar en caja.

**24/10/2026 (más rutas y abejas vestidas):** 8 ocupaciones nuevas (13 en total) y hasta 5 rutas por persona. Tareas → habilidades (`data/tareas.json`). Enlaces reales a Empleos Perú, Capacíta-T y ofertas de Computrabajo. Carrusel de rutas con una abeja vestida por oficio. Se corrigió que "productos" sumara siempre la celda de limpieza.

**24/10/2026 (rediseño):** menos información por pantalla, flujo más ilustrativo, micrófono para responder, abejas animadas con estela, colmena que brota, rutas como mini panal (tienes / falta), preguntas del primer paso una por una y hoja inferior para el detalle de cada celda. Se agregó la publicación en GitHub Pages.

**24/10/2026:** primera versión completa con el recorrido de 4 pasos y Mi panal, el motor con pruebas (Rosa → Vendedor/a de tienda 6 de 7 y curso de ventas; Marleny → Reponedor/a 5 de 7 y curso de almacén), los modos mock y QVAC con respaldo automático, el modo asesor, el modo demo y la versión de un solo archivo para compartir.
