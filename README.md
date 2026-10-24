# Chambea · Tu chamba cuenta.

MVP para la **Innovathon Ulima x Tether 2026** (reto del Ministerio de Trabajo y Promoción del Empleo, MTPE).

Chambea ayuda a personas que aprendieron su oficio en la práctica a reconocer lo que ya saben hacer y a convertirlo en un siguiente paso laboral concreto, con lo que el Estado ya ofrece: Empleos Perú, Capacítate Perú, Centros de Empleo y la certificación de competencias del MTPE.

> ⚠️ Todos los datos de `data/` son **ilustrativos** y las entrevistas de `docs/03` son **simuladas**. Reemplázalos con datos reales antes de presentarlos como evidencia.

---

## Qué hay en el prototipo

| Pantalla | Qué hace |
|---|---|
| Inicio | Logo, eslogan, región, "Empezar", "Lo hago con un asesor" y 2 casos de ejemplo (Rosa y Marleny) |
| 1 · Cuéntalo | Situación laboral (3 perfiles), ocupación actual y 4 preguntas abiertas (se pueden saltar) |
| 2 · Arma tu panal | Celdas de 4 colores (Sabe / Sabe hacer / Cómo es / Logra) con "Lo demuestra: «…»". Se confirman, se quitan o se agregan |
| 3 · Mira tus rutas | Máximo 3 ocupaciones operativas, "Tienes X de Y", demanda en la región, alias de avisos y aviso de demanda baja |
| 4 · Da el paso | 3 preguntas (horas, modalidad, costo) y **una** recomendación con su porqué, más 2 alternativas |
| Mi panal | Resumen e imagen descargable. "Empezar de nuevo" borra todo |

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

**24/10/2026:** primera versión completa con el recorrido de 4 pasos y Mi panal, el motor con pruebas (Rosa → Vendedor/a de tienda 6 de 7 y curso de ventas; Marleny → Reponedor/a 5 de 7 y curso de almacén), los modos mock y QVAC con respaldo automático, el modo asesor, el modo demo y la versión de un solo archivo para compartir.
