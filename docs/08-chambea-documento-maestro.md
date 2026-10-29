# Chambea · Documento maestro (contexto completo del proyecto)

> **Para quién es este documento:** para una persona o una IA que no estuvo en el desarrollo y necesita entender Chambea a fondo: qué es, por qué existe, qué hace pantalla por pantalla, cómo decide, con qué datos, qué es real y qué es de ejemplo, y qué falta.
> **Actualizado:** 29/10/2026 (víspera del Demo Day).
> **Proyecto:** Innovathon Ulima x Tether 2026, reto del Ministerio de Trabajo y Promoción del Empleo del Perú (MTPE).
> **Repositorio:** https://github.com/AndyFeraldo/chambea · **Demo en línea:** https://andyferaldo.github.io/chambea/

---

## 0. Resumen en 5 líneas

1. **Chambea** es un servicio web (pensado primero para el celular) que ayuda a personas que aprendieron su oficio **en la práctica, sin certificados**, a **reconocer lo que ya saben hacer** y convertirlo en un **siguiente paso laboral concreto**.
2. La persona cuenta su trabajo con sus palabras (escribiendo o hablando). Chambea arma su **"panal" de habilidades**, cada una con la frase que la respalda.
3. Le muestra **otras ocupaciones de nivel parecido y con demanda en su región** a las que puede pasar **sin empezar de cero** (recolocación lateral, no ascenso).
4. Le da **una sola recomendación de primer paso**: un curso gratis de **Capacíta-T**, postular en **Empleos Perú** o ir a un **Centro de Empleo**. Después, la certificación de competencias del MTPE.
5. La IA corre sobre **QVAC** (la IA local de Tether), así que los datos no salen del ecosistema persona–Ministerio. Si la IA falla, un motor de reglas responde igual.

**Eslogan:** "Tu chamba cuenta."
**Frase de valor:** "Cualquiera puede programar una app. Lo difícil es saber qué preguntar, cómo convertir 'me dejan las llaves' en 'honestidad' y conectar eso con lo que el Estado ya ofrece."

---

## 1. Identidad (como si fuera una organización)

### Misión
Ayudar a las personas que aprendieron su oficio trabajando a ponerle nombre y prueba a lo que ya saben hacer, y a convertirlo en un siguiente trabajo concreto, usando los servicios gratuitos que el Estado ya ofrece.

### Visión
Que en el Perú ninguna persona sienta que cambiar de trabajo es empezar de cero: que la experiencia ganada en la práctica cuente igual que un papel, y que cada Centro de Empleo pueda orientar a cualquier trabajador en minutos.

### Propósito (por qué existimos)
La confianza que una persona se ganó en su trabajo ("me dejan las llaves", "me dejan cerrar la caja") se queda en el lugar donde la ganó. Chambea hace que esa experiencia **tenga nombre, tenga prueba y viaje con la persona**.

### Valores / principios de diseño
| Principio | Qué significa en la práctica |
|---|---|
| **Honestidad** | Nunca decimos que "certificamos" ni que "conseguimos trabajo". Decimos "identificación preliminar" y "te conectamos con…". Siempre aparece el aviso: *"Esto no es una certificación. Para certificarte, el Ministerio de Trabajo tiene un proceso oficial."* |
| **Recolocar, no ascender** | Solo sugerimos ocupaciones de **nivel operativo** parecido. Nunca jefaturas, gerencias ni puestos que piden título universitario o idiomas. |
| **No asumir la situación** | El recorrido empieza preguntando la situación laboral (3 perfiles) y la lógica se adapta. |
| **Lenguaje de la persona** | Textos cortos, de "tú", sin jerga ("brecha de competencias", "upskilling" están prohibidos). Lectura fácil. |
| **Privacidad por diseño** | Sin CV, sin correo obligatorio. Lo que la persona cuenta se procesa con IA local (QVAC), sin enviarse a terceros. |
| **No competir con el Estado** | Siempre terminamos en un servicio público y gratuito existente. |
| **Explicable** | Cada recomendación muestra su porqué y su fórmula. No es una caja negra. |
| **Accesible** | Contraste AA, botones de 48 px o más, letra base de 16 px o más, funciona con conexión lenta y en celulares de gama baja. |

### Tono de voz
Cercano, cálido y directo, como un orientador del barrio que sabe de trabajo. Tutea. Frases cortas. Celebra lo que la persona ya sabe. Ejemplos reales de la interfaz: "Tu chamba cuenta.", "Cuéntalo", "Arma tu panal", "Mira tus rutas", "Da el paso", "Sí, eso hago", "Lo demuestra: «…»".

---

## 2. Contexto: el concurso y el reto

### El concurso
- **Innovathon Ulima x Tether**, organizada por la **Universidad de Lima** a través de **Innova Ulima** (Centro de Emprendimiento e Innovación), y coorganizada por **Tether**.
- **El reto lo brinda el Ministerio de Trabajo y Promoción del Empleo (MTPE).**
- Fechas: Open Day 23/10 · Workshops 24/10 · desarrollo 26–29/10 · **Demo Day viernes 30/10/2026** (pitch de 3 minutos + preguntas del jurado).
- Equipo de 5 personas: Comunicaciones, 2 de Sistemas, Ingeniería Industrial y Administración.

### El reto (texto oficial de las bases)
> ¿Cómo podríamos ayudar a las personas con experiencia laboral informal a reconocer las competencias que ya tienen y convertirlas en una ruta concreta hacia una ocupación con demanda en su región?

Las propuestas deben: **identificar competencias**, **mostrar ocupaciones compatibles con demanda en su territorio** y **proponer un primer paso formativo realista** según tiempo, recursos e intereses. Se valora que las competencias **puedan presentarse de forma creíble ante un empleador**.

### Condición técnica de las bases
La solución se desarrolla como **integración al portal de empleo de gob.pe** y se conecta a un **backend que corre un modelo de IA sobre QVAC** (https://docs.qvac.tether.io), para que los datos de los usuarios **no salgan del ecosistema usuario/Ministerio de Trabajo**.

### Lo que el MTPE explicó (Open Day y Workshop)
- Esperan: identificar competencias, descubrir conexiones con otras ocupaciones, ver qué se aprovecha y qué hay que fortalecer, visualizar transiciones, y sumar poco a poco demanda territorial y capacitación.
- Una transición depende de **competencias + demanda en el territorio + capacitación accesible + intereses**.
- No hace falta usar todas las ocupaciones: un grupo acotado basta.
- **La IA no puede certificar**: solo identifica de forma preliminar.
- Fuentes oficiales a usar en el futuro: perfiles y estándares de competencia del MTPE, Encuesta de Demanda Ocupacional (EDO) 2026, oferta de capacitación, estudios del INEI.
- Integraciones estratégicas: Empleos Perú (vacantes) y Capacíta-T (cursos gratuitos; antes llamado Capacítate Perú).
- **Ocupaciones priorizadas:** personal de limpieza, auxiliares administrativos, reponedores y abastecedores, cajeros, vendedores de tienda.
- Sesgos a evitar: "si no tiene título no sabe mucho", "si está en planilla no corre riesgo", "cambiar de trabajo es empezar de cero", "no se capacita porque no quiere", "todos usan computadora y correo", "informal significa ilegal", "solo le interesa ganar más", "la solución es una app".
- Orientación clave: **recolocar, no hacer línea de carrera** (nada de junior → senior → jefe).

### Rúbrica del jurado
| Criterio | Pregunta | Peso |
|---|---|---|
| Comprensión del reto | ¿Entiende el problema y el público objetivo? | 25 % |
| Creatividad e innovación | ¿Aporta un enfoque distinto o disruptivo? | 20 % |
| Viabilidad y potencial | ¿Es factible? ¿Incluye insights sobre el usuario? | 20 % |
| Prototipo | ¿Qué tan fácil y atractivo es interactuar con la solución? | 25 % |
| Presentación y storytelling | ¿Se comunicó con claridad y de forma atractiva? | 10 % |

Premios: 1.° USDT 1000 · 2.° USDT 600 · 3.° USDT 500 (por equipo).

---

## 3. Público objetivo

**Personas que aprendieron su oficio en la práctica, sin certificados, cuyo trabajo está en riesgo por la reducción de su ocupación**, tengan o no contrato.

Dato de contexto: **7 de cada 10 trabajadores en el Perú tienen empleo informal (69,8 %, INEI).**

| Perfil (id interno) | Cómo lo dice la persona en la app | Situación | Qué prioriza Chambea |
|---|---|---|---|
| `sin_empleo` | "Busco trabajo" | Necesita un ingreso pronto y no sabe qué puestos encajan con lo que ya hace | Rutas que ya puede ejercer (cobertura ≥ 80 %) y postular pronto |
| `informal` | "Trabajo, pero es inestable" | Trabaja por día, por encargo o por cuenta propia; sus horas pueden bajar | Cursos cortos (≤ 4 semanas, ≤ 3 h/semana), desde el celular y gratis |
| `planilla_riesgo` | "Tengo trabajo, pero me preocupa perderlo" | Tiene contrato, pero su ocupación se reduce (ej.: cajas de autoservicio) | Capacitarse antes de postular, aunque ya califique |

**Regla de oro:** no asumir que todas las personas están desempleadas ni que todas son informales.

---

## 4. Investigación e insights

> ⚠️ **Muy importante:** las 5 entrevistas que hay en `docs/03-investigacion-simulada.md` (Rosa, Jorge, Marleny, Kevin, Carmen) son **SIMULADAS**. Se crearon para poder empezar a construir. **No son evidencia real y no deben presentarse como entrevistas reales al jurado.** Los insights de abajo se apoyan en lo que el MTPE compartió en el Open Day y el Workshop, en las bases y en el dato del INEI, y se presentan como **hallazgos que el prototipo pone a prueba**. Si el equipo tiene entrevistas reales, deben reemplazar a las simuladas.

### Insights
1. **La gente se describe por tareas, no por competencias.** "Soy cajera", "hago de todo", "me dejan las llaves". Nadie dice "manejo de efectivo" u "honestidad". → La herramienta debe **traducir tareas a habilidades**.
2. **Su prueba de valor es la confianza, no un papel.** Les dejan cerrar la caja, les dan las llaves, los vuelven a llamar. Esa confianza **no viaja** con ellos a otro empleo.
3. **Buscan solo avisos con el nombre de su puesto actual** y descartan ocupaciones cercanas que piden casi lo mismo (una cajera que nunca postula a "asesora de ventas"). Además, un mismo puesto se publica con nombres distintos.
4. **No pueden dejar de generar ingresos para capacitarse:** el paso formativo debe ser corto, gratis, flexible y desde el celular.
5. **Los canales formales los frenan:** piden CV, correo, constancias o secundaria completa; recurren a recomendados y grupos de Facebook.
6. **No asumir la situación:** hay quienes buscan trabajo, quienes trabajan de forma inestable y quienes están en planilla pero en riesgo.

### Insight central
> *"La confianza que se ganaron se queda en el lugar donde la ganaron: lo que saben hacer no tiene nombre ni prueba, y por eso no se lo pueden llevar a otro puesto. Sienten que cambiar de trabajo es empezar de cero."*

### De insight a funcionalidad
| Insight | Funcionalidad en Chambea |
|---|---|
| Hablan por tareas | Preguntas abiertas en su lenguaje; la IA y las reglas traducen tareas → habilidades (`data/tareas.json`) |
| Su prueba es la confianza | Cada habilidad lleva su evidencia "Lo demuestra: «…»"; "Mi panal" descargable; texto para presentarse sin CV |
| Solo buscan su mismo puesto | Cada ruta muestra "También se publica como: …" (alias reales de avisos) y enlaces a ofertas |
| No pueden dejar de trabajar | Primer paso filtrado por horas libres y modalidad; cursos gratis desde el celular |
| Los canales formales frenan | Sin CV ni correo; opción de hacerlo con un asesor; requisitos mínimos mostrados con honestidad |
| No asumir la situación | El recorrido empieza preguntando la situación y adapta el primer paso |

---

## 5. El problema que resolvemos

En el Perú, la mayoría de trabajadores aprendió su oficio en la práctica y no tiene certificados. Cuando su ocupación se reduce (automatización como las cajas de autoservicio, cierre de negocios, baja de encargos), **no saben nombrar lo que saben hacer ni ver qué tan cerca están de otra ocupación**. Por eso:
- sienten que cambiar de trabajo es empezar de cero;
- buscan solo su mismo puesto;
- no conocen los servicios gratuitos del Estado o creen que son largos y presenciales;
- no tienen cómo demostrar su experiencia ante un nuevo empleador.

Chambea responde punto por punto al reto: identifica competencias (4 dimensiones del MTPE), muestra ocupaciones compatibles con demanda regional, propone un primer paso formativo realista y ayuda a presentar las competencias de forma creíble.

---

## 6. La solución: el recorrido completo, pantalla por pantalla

Chambea reproduce un recorrido de **4 pasos** (como un flyer): **Cuéntalo (antes) → Arma tu panal (hoy) → Mira tus rutas (después) → Da el paso**. Al final está **"Mi panal"** (resumen) y, opcionalmente, la **cuenta** y el **Banco de talento**.

En celular todo va en una columna. En computadora se ve como plataforma web: barra superior, panel lateral con los 4 pasos y contenido a lo ancho. Hay barra de progreso y botón "Atrás" en todas las pantallas.

### 6.0 Página principal (Inicio)
- **Barra superior:** logo, "Inicio", "Mi panal" (si ya hay uno), "Banco de talento", "Ingresar" y "Registrarme" (o el avatar con el nombre estilo Yape y "Salir"), y un menú.
- **Portada (hero) oscura con patrón de panal:**
  - Etiqueta: "Reto del Ministerio de Trabajo · Innovathon Ulima x Tether 2026" (con banderita del Perú).
  - Título grande: **"Tu chamba cuenta."**
  - Texto: "Aprendiste tu oficio trabajando. Chambea te ayuda a ponerle nombre a lo que ya sabes hacer, ver a qué otros trabajos con demanda puedes pasar en tu región y dar tu primer paso con los servicios gratuitos del Estado."
  - Botones: **"Empezar gratis"** (amarillo), **"Lo hago con un asesor"**, y "Continuar donde lo dejé" si hay progreso guardado.
  - Selector de región (3 regiones de ejemplo) y "Ver un ejemplo: Rosa · Marleny" (casos demo precargados).
  - Garantías: Gratis · Sin CV ni correo · 5 minutos · Hablas o escribes.
  - **QR** (solo en pantallas grandes con mouse, como laptop o proyector): "Escanea y pruébalo ahora", que abre la versión pública en el celular. Tiene la abeja al centro y una línea de "escaneo" animada.
  - **Ilustración "panal vivo":** 7 celdas hexagonales que brotan con habilidades reales del vendedor de tienda, abejas vestidas por oficio y tarjetas flotantes: «Lo demuestra: "Atiendo a los clientes y les recomiendo lo que buscan"», «Tu mejor ruta: Vendedor/a de tienda · Tienes 6 de 7 · 86 % · Se busca en tu región», «Tu primer paso: Curso gratis en Capacíta-T».
  - Franja de aliados: "Un reto del" MTPE · "Organizan" Universidad de Lima, Innova Ulima, Tether · "IA local con" QVAC.
- **Franja de cifras:** 7/10 trabajadores aprendieron en la práctica (bases, MTPE) · 13 oficios · 48 habilidades · 3 regiones.
- **"Así funciona":** los 4 pasos con su momento (Antes / Hoy / Después / Ya).
- **"¿Para quién es Chambea?":** 3 tarjetas por situación que empiezan el recorrido con ese perfil ya elegido, y una cinta con los 13 oficios y sus abejas.
- **"A dónde te lleva":** "No reemplazamos al Estado: te conectamos con lo que ya ofrece". Mapa: Chambea al centro conectado a Empleos Perú, Capacíta-T, Centros de Empleo y Certificación de competencias. Notas: pensado para integrarse al portal de empleo de gob.pe; la IA corre con QVAC en servidor propio.
- **"Para empresas y Centros de Empleo":** "Encuentra talento por lo que sabe hacer, no por su último puesto" → Banco de talento.
- **"Quiénes están detrás":** aliados por rol (Brinda el reto / Organizan / Se conecta con / Tecnología).
- **Pie:** privacidad, aviso de prototipo ("Prototipo estudiantil… No es un sitio oficial del Estado peruano; cada marca pertenece a su dueño"), estado de la IA y la nota "Datos de ejemplo para el prototipo".
- **Modo asesor:** misma interfaz, con textos que indican que se usa acompañado en un Centro de Empleo.

### 6.1 Paso 1 · Cuéntalo (ANTES)

**a) Situación** — "¿Cómo estás hoy con tu trabajo?" con 3 tarjetas con ícono: "Busco trabajo" / "Trabajo, pero es inestable" / "Tengo trabajo, pero me preocupa perderlo".

**b) Ocupación actual** — mosaico de los 13 oficios, cada uno con su **abeja vestida** (gorra, casco, gorro de chef, audífonos…) y su sector. También se puede elegir "otro oficio". Sirve para adaptar la pregunta 4, para sumar las habilidades típicas del oficio y para el aviso de demanda.

**c) Cuatro preguntas guiadas** (una por pantalla, caja de texto grande, **micrófono** para dictar, botón para **escuchar** la pregunta en voz alta, ejemplo de respuesta en gris, pista y opción de saltar). Cada pregunta apunta a una dimensión:
1. **Tareas → habilidades:** "Cuéntame un día normal: ¿qué tareas haces de principio a fin?" (ej.: "Abro a las 7, recibo la mercadería, atiendo y al final cuadro la caja…"; pista: "Di por lo menos 3 cosas que haces.")
2. **Herramientas → conocimientos:** "¿Qué herramientas, máquinas, productos o sistemas sabes usar?" (ej.: "El POS, Yape, la balanza, el cuaderno de inventario, productos de limpieza…")
3. **Confianza → logros y cualidades:** "¿Qué te encargan a ti porque confían en ti? Cuéntame algo que hayas logrado." (ej.: "Me dejan cerrar la tienda sola y nunca me falta plata…")
4. **De tu oficio** (cambia según la ocupación elegida; hay una por cada uno de los 13 oficios). Ej. para cajero: "¿Qué haces si un cliente se molesta o si la caja no cuadra?". Si no eligió oficio, se usa una general: "¿Con quién tratas en tu trabajo y qué problemas resuelves?"

**d) Intereses** — "¿Qué te gustaría hacer más?" (elige varios): Atender y ayudar a la gente · Vender y convencer · Ordenar y organizar · Trabajar con mis manos o máquinas · Cocinar y preparar alimentos · Moverme por la ciudad · Cuidar a otras personas · Papeles y computadora.

**e) Lo que prefiere evitar** — "¿Hay algo que prefieras evitar?": Cargar peso · Estar de pie todo el día · Turnos de noche · Usar computadora.

**f) "Armando tu panal…"** — pantalla animada de transición mientras se procesa.

**g) Preguntas puente** (si aplica) — "Unas preguntas rápidas: ¿también sabes hacer esto?". El sistema pregunta **justo las habilidades que más acercarían a la persona a otra ocupación** y que no detectó. Respuestas: "Sí, lo hago" / "No". Es la parte más "recolocadora" de la entrevista.

### 6.2 Paso 2 · Arma tu panal (HOY)
- Las habilidades detectadas aparecen como **hexágonos (celdas de un panal)** que brotan con animación, en **4 colores** según la dimensión del perfil del MTPE:
  - **Conocimiento** ("lo que sabes") — verde claro
  - **Habilidad** ("lo que sabes hacer") — amarillo miel
  - **Cualidad** ("cómo eres") — gris claro
  - **Logro / competencia** ("lo que consigues y cómo lo demuestras") — verde oscuro
- Cada celda muestra un **nombre corto y claro** (ej.: "Cuadre de caja", "Honestidad", "Control de inventario").
- Al tocar una celda se abre una hoja con el detalle:
  - **"Lo demuestra: «frase textual de la persona»"**, o el origen: "Viene de tu tarea: Cobrar en caja", "Típica de tu oficio" o "Lo confirmaste en las preguntas rápidas".
  - Botones **"Sí, eso hago"** (confirmar) y **"Quitar"**.
- **"Agregar más habilidades":** catálogo completo por dimensión, o la opción **"¿A qué trabajo te quieres acercar?"**: eliges una ocupación, ves las 7 habilidades que pide y tocas las que ya sabes hacer. Así la persona alinea su perfil a otra línea de trabajo.
- Botón final: "Sí, ese es mi panal".

### 6.3 Paso 3 · Mira tus rutas (DESPUÉS)
- **Aviso de demanda:** si su ocupación actual tiene demanda baja en la región: "[Ocupación]: la demanda baja en tu región".
- **Carrusel de hasta 5 rutas.** Cada ruta entra con una **abeja vestida de esa profesión** que llega volando desde la derecha (con estela de movimiento) y sale por la izquierda al pasar a la siguiente.
- Cada ficha de ruta muestra:
  - nombre de la ocupación, sector y qué hace;
  - **"Tienes X de Y"** con barra y porcentaje de cobertura;
  - etiqueta de demanda: "Se busca en tu región" / "Demanda media" / "Poca demanda";
  - **"También se publica como: …"** (alias de avisos reales, ej. Vendedor/a de tienda = Asesor/a de ventas, Promotor/a de ventas, Vendedor/a de piso);
  - "Suelen pedir:" requisitos mínimos (ej. secundaria, carné de sanidad);
  - marcas: "Va con lo que te gusta" (interés) o "Suele pedir: [algo que prefieres evitar]";
  - mini panal de lo que **ya tiene** (verde) y lo que **falta** (gris). Tocar lo que falta permite agregarlo: "¿Ya sabes hacer esto? Sí, agrégalo a mi panal";
  - **"¿Por qué esta ruta?"**: tabla de las 7 habilidades que pide, con su peso, y la fórmula de cobertura;
  - **"Ver ofertas reales"**: enlaces a Empleos Perú y a búsquedas en vivo de Computrabajo para ese puesto;
  - botón **"Quiero esta ruta"**.
- Si no hay una ruta clara: "Aún no vemos una ruta clara. Un asesor te ayuda a encontrarla."

### 6.4 Paso 4 · Da el paso
**Pantalla de preferencias** ("Armemos un plan que sí puedas cumplir"):
- Explica el porqué: "Te preguntamos dos cosas para recomendarte un curso que puedas hacer sin dejar de trabajar."
- Muestra la meta: "Para ser [ruta] te falta: …" (o "Ya tienes todo lo que suelen pedir").
- **¿Cuánto tiempo libre tienes a la semana?** 1 a 3 h (≈ 20 min al día) · 4 a 6 h (≈ 45 min al día) · 7 h o más (1 h o más al día), con un medidor visual.
- **¿Dónde prefieres aprender?** Celular (a tu ritmo, donde estés) · Presencial (en un local, con horario) · Me da igual.
- Todos los cursos sugeridos son gratuitos (la pregunta de costo se quitó).
- **Vista previa en vivo** del curso que le tocaría y de su avance.

**Resultado:**
- **Una sola recomendación principal**, con su porqué en una línea ("Porque ya sabes [2 competencias] y solo te falta [1].").
- **"Tu camino"**: línea de tiempo del plan.
- **Dos alternativas**: entre Capacíta-T (curso para lo que falta), Empleos Perú (postular) y "Hablar con un asesor" (Centro de Empleo).
- Al final: **"Después: certifica lo que sabes con el MTPE"**.
- Botón "Cambiar tiempo o lugar".

### 6.5 Mi panal (resumen final)
En computadora, en 3 columnas; en celular, el panal primero.
- **Centro:** tarjeta "Mi panal" con nombre (si tiene cuenta) y región, colmena de habilidades confirmadas con leyenda, frases de evidencia, "Mi ruta" (con X de Y) y "Mi primer paso". Botón **"Descargar mi panal"** (imagen generada en el navegador). Aviso de identificación preliminar. Botón **"Empezar de nuevo"**, que borra todo previa confirmación.
- **Izquierda:**
  - **Tu plan** (checklist que se puede marcar): descargar o guardar el panal → inscribirse gratis en el curso en Capacíta-T → visitar un Centro de Empleo → crear cuenta en Empleos Perú → sacar gratis el **Certificado Único Laboral (CUL)** → postular a ofertas de la ruta → preguntar por la certificación de competencias del MTPE.
  - **Cómo presentarte:** texto corto generado ("Hola, tengo experiencia como… Lo que mejor sé hacer: … Por ejemplo: «…». Busco trabajo…"), con botones Copiar y enviar por WhatsApp.
- **Derecha:**
  - **Llévalo a un asesor:** QR y enlace del panal. Los datos viajan **dentro del enlace**, sin servidor.
  - Perfil y completitud ("Perfil X % completo · Siguiente: …"), opción "Guardar mi progreso en este celular" y crear cuenta o unirse al banco.
  - Invitación al Banco de talento.
  - Ofertas para la ruta.
- **Panal compartido:** quien abre el enlace o QR ve el panal en modo solo lectura.

### 6.6 Cuenta (registro e ingreso)
- **Registro en 3 pasos**, con indicador de avance:
  1. **Tus datos:** nombres, apellidos, documento (DNI / Carné de extranjería / PTP-CPP), fecha de nacimiento (18 años o más), hasta dónde estudió (opcional).
  2. **Contacto:** celular (será su usuario; 9 dígitos que empiezan con 9), correo (opcional), región, distrito, "Tengo alguna discapacidad" (opcional, para mostrar ofertas de empleo inclusivo).
  3. **Acceso:** PIN de 4 números (repetido), aceptación del tratamiento de datos (Ley N.° 29733), "Acepto que un Centro de Empleo me contacte", "Quiero unirme al Banco de talento" (lleva al paso siguiente).
- Panel lateral "Así te verán en el banco": muestra en vivo el nombre estilo **Yape** ("Rosa Q.") y lo que **nunca** se muestra (apellido completo, documento, celular, correo).
- **Ingreso:** celular + PIN. Recupera el panal y el avance guardados.
- **En la demo**, la cuenta se guarda **solo en el navegador** y del documento se guardan **solo los últimos 3 dígitos**. En la versión real, el registro sería con la cuenta de **Empleos Perú (MTPE)** y validación con RENIEC o Migraciones.

### 6.7 Únete al Banco de talento (paso extra)
Camino visible: **1. Arma tu panal → 2. Crea tu cuenta → 3. Completa tu perfil laboral → 4. Publica.** Si falta el panal o la cuenta, se lo indica con un botón para resolverlo.

Asistente de 4 pasos, con **vista previa en vivo** de su tarjeta al costado:
1. **Experiencia:** años en el oficio (menos de 1 / 1–2 / 3–5 / 6–10 / más de 10), su oficio y su panal (con enlace para editarlo), y una frase opcional ("Soy puntual y aprendo rápido").
2. **Disponibilidad:** jornada (tiempo completo / medio tiempo / por horas / fines de semana), horarios (mañana / tarde / noche), cuándo puede empezar (ya / en 2 semanas / en 1 mes), distritos donde puede trabajar.
3. **Respaldo:**
   - documentos al día, solo se marcan, no se sube nada: DNI o carné, antecedentes, carné de sanidad, brevete, certificado de secundaria, constancia de curso. Se resaltan los que **piden sus rutas** ("Lo piden en: Vendedor/a de tienda…");
   - una **referencia** (nombre y relación; solo la ve el asesor);
   - cómo prefiere que le avisen (llamada / WhatsApp / solo por el Centro de Empleo).
4. **Publicar:**
   - su tarjeta tal como la verán las empresas;
   - lista **"Se muestra"**: primer nombre e inicial, habilidades, trabajos para los que calza, jornada, distritos, cantidad de documentos;
   - lista **"Nunca se muestra"**: apellido, documento, celular, correo, referencia;
   - consentimiento y botón "Publicar mi perfil".

Al publicar: "¡Ya estás en el Banco de talento!" y la persona puede "Editar mi perfil" o "Salir del banco" cuando quiera.

### 6.8 Banco de talento (para empresas y Centros de Empleo)
- Personas que **eligieron** aparecer, buscadas **por lo que saben hacer**, no solo por el nombre de su puesto.
- **Filtros:** sector, profesión que se busca, región, "Solo listos para postular" (≥ 85 %), jornada y "Pueden empezar ya". En celular, los filtros se pliegan.
- **Tarjeta de cada persona:**
  - abeja vestida, nombre **estilo Yape** ("Yesenia C."), "Hoy: [oficio] · 3 a 5 años", distritos y región;
  - % de cobertura para la profesión buscada y la etiqueta **"Viene de otro oficio"** si es recolocación;
  - habilidades principales, jornada y horario, "Puede empezar ya";
  - sellos: "Panal confirmado", "Documentos al día: N", "Llevando un curso", "Ejemplo".
- Contador **"N vienen de otro oficio y podrían hacer el trabajo de [profesión]"**: es el valor del banco, encontrar talento lateral.
- Si la persona usuaria está en el banco, su tarjeta aparece **primero, resaltada**, con "Tú".
- **Contactar:**
  - siempre **con intermediación**: la solicitud llega al Centro de Empleo, el asesor llama a la persona, y si acepta, el asesor los pone en contacto;
  - la empresa indica su nombre y el puesto que ofrece.
- Panel lateral: "¿Cómo funciona?" y barras de perfiles por sector.
- Hay decenas de **perfiles de ejemplo** generados (no son personas reales); se marcan con el sello "Ejemplo".

---

## 7. Cómo decide Chambea (lógica y fórmulas)

### 7.1 Extracción de habilidades (de lo que la persona cuenta)
Se combinan cuatro fuentes:
1. **Palabras clave** del catálogo (`keywords` de cada competencia), con normalización de tildes y raíces. Para la dimensión "competencia/logro" se exige más precisión.
2. **Tareas → habilidades transferibles** (`data/tareas.json`, 14 tareas). Si la persona dice "cobro" o "en la caja", se detecta la tarea "Cobrar en caja" y se suman precisión, manejo de dinero y atención al cliente. Tareas: limpiar, cobrar, cocinar, vender, atender, reponer, cargar, repartir, cuidar, archivar, servir, fabricar, arreglar, atender teléfono.
3. **Oficios:** se suman las habilidades típicas del oficio elegido o mencionado (campo `menciones`).
4. **IA con QVAC** (si está activada): un modelo local lee el texto y propone competencias del catálogo con la **frase textual** que las respalda.

**Validación anti-invención:** cada competencia que propone la IA se verifica. Si el id no existe en el catálogo, se descarta. Si la frase no es algo que la persona realmente dijo, solo se acepta si las palabras clave también la respaldan. Si QVAC no responde o no devuelve JSON válido, **se usa el modo de reglas automáticamente**.

Prompt base de la IA (resumen): *"Eres un orientador laboral peruano… identifica SOLO competencias del catálogo que el texto respalde. Razona: primero las TAREAS, luego las habilidades transferibles que revelan… No inventes. Copia la frase exacta. Devuelve únicamente JSON: {"competencias":[{"id":"…","evidencia":"frase textual"}]}"*

### 7.2 Cobertura por ocupación (qué tan cerca está de cada trabajo)
Solo se consideran ocupaciones con `nivel = "operativo"` y distintas a la actual.

```
Pesos por dimensión: logro (competencia) = 3 · habilidad = 2 · conocimiento = 2 · cualidad = 1
Cobertura = suma de pesos de las habilidades requeridas que la persona tiene
          ÷ suma de pesos de todas las habilidades requeridas
```
Cada ocupación pide 7 habilidades.

### 7.3 Orden de las rutas
1. Cobertura, con **+10 %** si la ruta va con sus intereses y **−20 %** si pide algo que prefiere evitar.
2. Demanda en su región (alta > media > baja).
3. Se muestran hasta **5 rutas**.

Ajuste por perfil: `sin_empleo` prioriza rutas con cobertura ≥ 80 %; `informal`, cursos cortos desde el celular; `planilla_riesgo`, capacitarse antes de postular.

### 7.4 Primer paso (una sola recomendación)
- Cobertura **≥ 85 %** → **"Postula en Empleos Perú"**, salvo `planilla_riesgo`, que primero ve el curso de lo que falta.
- **50 % a 85 %** → **"Capacíta-T"**: el curso que cubra más habilidades faltantes y respete horas y modalidad.
- **< 50 %** o sin datos suficientes → **"Habla con un asesor en un Centro de Empleo"**.
- Siempre explica el porqué en una línea.

### 7.5 Preguntas puente
Se eligen las habilidades que **no** detectó y que más subirían la cobertura de las rutas cercanas. Se preguntan una por una ("¿también sabes hacer esto?").

### 7.6 Casos demo (para el pitch)
- **Rosa** (cajera en planilla en riesgo, Lima): su mejor ruta es **Vendedor/a de tienda (6 de 7)** y su primer paso es el curso de **Ventas** (Capacíta-T).
- **Marleny** (limpieza por días, informal, Lima): primero **Conserje / mantenimiento (5 de 7)** y luego **Reponedor/a (5 de 7)**, con un curso de almacén.
- Hay **15 pruebas automáticas** que verifican estos resultados y la lógica (todas pasan).

---

## 8. Datos que usa (todos en `data/`, marcados como ilustrativos)

> Todos los datos tienen `"ilustrativo": true` y la interfaz muestra "Datos de ejemplo para el prototipo". El diseño permite reemplazarlos por los oficiales (estándares de competencia del MTPE, EDO 2026, catálogo real de Capacíta-T) **sin cambiar código**.

### 8.1 Ocupaciones (13, todas de nivel operativo)
| Ocupación | Sector | También se publica como | Suelen pedir |
|---|---|---|---|
| Cajero/a | Comercio | Cajera, Cajero/a polifuncional, Operador/a de caja | Secundaria (frecuente), disponibilidad de horario |
| Vendedor/a de tienda | Comercio | Asesor/a de ventas, Promotor/a de ventas, Vendedor/a de piso | Secundaria (frecuente), disponibilidad de horario |
| Reponedor/a y abastecedor/a | Comercio y logística | Reponedor/a, Abastecedor/a, Mercaderista | Secundaria (a veces), turnos |
| Auxiliar administrativo/a | Administración | Asistente administrativo/a, Auxiliar de oficina, Recepcionista | Secundaria completa, ofimática básica |
| Personal de limpieza | Servicios generales | Operario/a de limpieza, Auxiliar de limpieza | Secundaria (algunas empresas) |
| Ayudante de cocina | Gastronomía | Auxiliar de cocina, Asistente de cocina | Carné de sanidad, disponibilidad |
| Mozo/a de restaurante | Gastronomía | Mesero/a, Azafata de restaurante, Anfitrión/a | Fines de semana |
| Auxiliar de almacén | Logística | Almacenero/a, Operario/a de almacén, Despachador/a, Picker | Secundaria (frecuente), turnos |
| Repartidor/a | Reparto | Motorizado/a, Delivery, Courier | Brevete de moto, celular con datos |
| Operario/a de producción | Industria | Operario/a de planta, Empacador/a | Secundaria (a veces), turnos rotativos |
| Asesor/a de atención al cliente | Atención al cliente | Teleoperador/a, Agente de call center | Secundaria completa, computadora básica |
| Cuidador/a de personas | Cuidado de personas | Cuidador/a de adulto mayor, Niñera | Referencias |
| Conserje / mantenimiento | Servicios generales | Conserje, Portero/a, Auxiliar de mantenimiento | Referencias, disponibilidad |

Las 5 primeras de la lista oficial del MTPE son: limpieza, auxiliares administrativos, reponedores, cajeros y vendedores de tienda. Las otras 8 se agregaron para tener más rutas de recolocación.

Ejemplo de habilidades requeridas:
- **Cajero/a:** Cobro en caja, Cuadre de caja, Medios de pago, Atención al cliente, Honestidad, Paciencia, Caja sin faltantes.
- **Vendedor/a de tienda:** Atención al cliente, Medios de pago, Cobro en caja, Paciencia, Resolver reclamos, Reposición, Técnicas de venta.

Por eso una cajera ya tiene "6 de 7" para vendedora: solo le falta Técnicas de venta.

### 8.2 Competencias (48), en las 4 dimensiones del MTPE
- **Conocimiento (8):** Medios de pago, Productos de limpieza, Ubicación de productos, Documentos comerciales, Conocimiento de productos, Seguridad en el trabajo, Manejo de dinero, Higiene de alimentos.
- **Habilidad (22):** Cobro en caja, Cuadre de caja, Atención al cliente, Reposición, Control de inventario, Limpieza y desinfección, Exhibición de productos, Técnicas de venta, Archivo de documentos, Registro de datos, Computación básica, Recepción de mercadería, Cocina, Organización del tiempo, Comunicación, Detectar necesidades, Servicio de mesa, Reparto y rutas, Cuidado de personas, Atención telefónica, Manejo de máquinas, Mantenimiento básico.
- **Cualidad (9):** Honestidad, Puntualidad, Organización y orden, Paciencia, Trabajo en equipo, Resistencia física, Precisión, Cumplimiento de normas, Trabajo bajo presión.
- **Logro / competencia (9):** Caja sin faltantes, Ambientes impecables, Zona siempre abastecida, Resolver reclamos, Metas de venta, Documentos al día, Pedidos a tiempo, Clientes que vuelven, Meta del turno.

Cada competencia tiene un `nombre_simple`, como lo diría la persona. Ejemplos: "Me confían cosas importantes" (Honestidad), "Mi caja siempre cuadra" (Caja sin faltantes), "Sé qué productos usar y cuáles no se mezclan" (Productos de limpieza).

### 8.3 Regiones (3 de ejemplo) con demanda por ocupación
Lima Metropolitana, Arequipa y La Libertad. Ejemplo: en Lima, Cajero/a tiene demanda **baja** y Vendedor/a de tienda **alta** (por eso a Rosa le aparece el aviso de demanda baja). Una región nueva se agrega solo con datos.

### 8.4 Cursos (15), todos gratuitos, proveedor Capacíta-T (MTPE)
- **Temas que el MTPE sí anuncia en Capacíta-T** (`verificado: true`): Ventas (4 sem, 3 h/sem, celular), Atención al cliente, Excel básico, Word básico, Seguridad y salud en el trabajo.
- **Cursos de ejemplo** (marcados "Curso de ejemplo"): Recepción y abastecimiento de mercadería, Documentos comerciales básicos, Limpieza y desinfección seguras, Caja y medios de pago, Manipulación de alimentos, Servicio de mesa, Reparto seguro, Cuidado básico de personas, Mantenimiento básico de edificios, Operación segura de máquinas.

Cada curso indica qué habilidades **cubre**, su duración, sus horas por semana y su modalidad (celular o presencial).

### 8.5 Enlaces reales
- Empleos Perú (MTPE): https://www.empleosperu.gob.pe/
- Capacíta-T (MTPE): https://capacitacionlaboral.trabajo.gob.pe/
- Ofertas por puesto: búsquedas en vivo de Computrabajo (`https://pe.computrabajo.com/trabajo-de-<puesto>`). Son búsquedas y no avisos sueltos porque los avisos caducan.

---

## 9. Tecnología y arquitectura

- **Monorepo** con `web/` (frontend), `server/` (backend), `shared/` (motor de reglas compartido), `data/` (JSON) y `tests/`.
- **Frontend:** Vite + React + TypeScript, CSS propio con tokens (sin librerías pesadas), textos en `web/src/i18n/es.json` (listo para agregar quechua o aimara).
- **Backend:** Node.js + TypeScript + Express. API REST:
  - `GET /api/salud` → estado de la IA (`mock` o `qvac` conectado)
  - `GET /api/regiones`, `GET /api/catalogo`
  - `POST /api/extraer` → `{ texto, respuestas_guiadas }` → competencias con evidencia
  - `POST /api/rutas` → `{ competencias_ids, region_id, perfil, intereses, evitar }` → ocupaciones ordenadas con cobertura, faltantes, demanda y alias
  - `POST /api/primer-paso` → una recomendación + alternativas
- **Capa de IA intercambiable** (`AI_PROVIDER=mock|qvac` en `.env`):
  - `MockProvider`: reglas y palabras clave, sin modelo ni internet. Siempre funciona.
  - `QvacProvider`: llama al servidor local de QVAC (API compatible con OpenAI, `POST {QVAC_BASE_URL}/v1/chat/completions`), valida la respuesta y, si falla, vuelve al mock.
- **QVAC** (IA local de Tether):
  - se instala con `npm i -g @qvac/cli`, se revisa la computadora con `qvac doctor` y se prende con `qvac serve --openai` (puerto 11434);
  - el modelo se define en `qvac.config.json` (hoy `QWEN3_600M_INST_Q4`; opciones más grandes: `QWEN3_1_7B_INST_Q4`, `QWEN3_4B_INST_Q4_K_M`);
  - requiere Node 22.21+ o 24.9+, suficiente RAM y, en Windows, Vulkan 1.4.
- **Modo solo navegador:** la versión publicada en GitHub Pages y la de un solo archivo corren todo en el navegador (motor de reglas, sin servidor). **QVAC solo se usa cuando Chambea corre desde una computadora con el servidor y `AI_PROVIDER=qvac`.**
- **Escalable con datos:** regiones, ocupaciones, competencias, tareas, preguntas y cursos son archivos JSON. Se cambian sin tocar código.
- **Comandos:** `npm install` (una vez), `npm run dev` (levanta web en :5173 y server en :3001), `npm test`, `npm run build:pages` (versión web pública), `npm run build:demo` (un solo archivo HTML).
- **Persistencia:** sin base de datos. Progreso y cuentas demo en el `localStorage` del navegador, solo si la persona lo pide. El panal compartido viaja codificado en el enlace (`#panal=…`).

### Privacidad
- No se guarda nada en servidores ni bases de datos en el MVP. Nada se envía a IAs en la nube (ni OpenAI, ni Google, etc.).
- Excepciones **solo de la demo**, documentadas:
  - el micrófono usa el dictado del navegador (Web Speech), que procesa el audio en servicios del navegador. En la versión real se reemplazaría por transcripción local con QVAC (Whisper);
  - cuentas y banco guardados localmente en el navegador.
- Versión real: registro con Empleos Perú, consentimiento explícito, finalidad limitada, derecho a salir del banco, Ley N.° 29733.

---

## 10. Marca e interfaz

- **Nombre:** Chambea ("chamba" = trabajo en el Perú). **Eslogan:** "Tu chamba cuenta."
- **Logo:** hexágono verde con una abeja + la palabra "cham**bea**" (cham en negro o blanco, bea en verde o miel).
- **Colores:** verde `#26A17B` (principal), verde oscuro `#1A7A5C` (botones y texto verde pequeño), amarillo miel `#F5B82E` (acento), negro panal `#0E1A17`, crema `#FFF6DE`.
- **Tipografías:** Bricolage Grotesque (títulos), Inter (textos), Poppins (logo).
- **Motivo visual:** hexágonos y panal (celdas de habilidades, números de paso, avatares). **Abejas** animadas con alas que aletean y estela de movimiento. **Abejas vestidas por profesión** (13 atuendos: gorra y placa de cajero, mandil de vendedor, casco y chaleco de almacenero, gorro de chef, corbatín de mozo, casco de moto, audífonos de call center, etc.).
- **Metáfora:** cada habilidad es una celda; juntas forman tu panal. Lo que sabes hacer, ordenado y visible.

---

## 11. Aliados y vínculos

| Rol | Quién |
|---|---|
| Brinda el reto | Ministerio de Trabajo y Promoción del Empleo (MTPE) |
| Organizan | Universidad de Lima · Innova Ulima · Tether |
| Se conecta con | gob.pe (portal de empleo) · Empleos Perú · Capacíta-T · Centros de Empleo · Certificación de competencias del MTPE |
| Tecnología | QVAC (IA local de Tether) |

En la web se muestran como marcas de texto. Los logos oficiales se pueden poner en `web/public/aliados/` y configurar en `web/src/aliados.ts`. La web aclara que es un **prototipo estudiantil, no un sitio oficial del Estado**.

---

## 12. Valor agregado (por qué no es "cualquier app con IA")

| Valor | Qué es | Por qué importa |
|---|---|---|
| Método tarea → habilidad | Traduce cómo habla la gente a las 4 dimensiones del perfil del MTPE | La gente no se describe con competencias |
| Entrevista que pregunta lo que acerca | Preguntas por dimensión, una por oficio, y preguntas puente | Busca activamente la recolocación lateral |
| Motor explicable | Pesos públicos, evidencia por habilidad, "¿Por qué esta ruta?" | Un servicio público tiene que poder explicar cada recomendación |
| Puente con el Estado | Siempre termina en Capacíta-T, Empleos Perú, Centros de Empleo o certificación | Aumenta el uso de servicios existentes, no compite con ellos |
| Privacidad con QVAC | IA local, sin base de datos de personas | Cumple la condición de las bases |
| Funciona sin IA | El motor de reglas responde igual | Robusto con mala conexión y celulares de gama baja |
| Escala con datos | Todo en JSON | El MTPE carga sus estándares y la EDO 2026 sin reprogramar |
| Banco de talento lateral | Empresas encuentran gente de otro oficio que ya cumple casi todo | Abre vacantes a quien antes no habría postulado |

---

## 13. Impacto esperado

- **Personas:** población potencial = el 69,8 % de trabajadores con empleo informal (INEI), más los trabajadores en planilla cuya ocupación se reduce. *(Más de 12 millones de personas: cifra estimada, verificar con el último dato del INEI.)* Empezamos con las 5 ocupaciones priorizadas por el MTPE. En minutos descubren que no empiezan de cero, sin pagar ni dejar de trabajar, y reciben una ruta concreta y una forma creíble de presentarse. Así se reduce el tiempo sin ingresos entre un trabajo y otro.
- **MTPE / Estado:** más personas llegan a servicios gratuitos existentes. Los asesores atienden con un perfil ya armado. A futuro, datos agregados y anónimos de qué habilidades faltan por región, para planificar cursos.
- **Empresas:** personal operativo encontrado por lo que sabe hacer, incluida gente que viene de otro oficio.
- **Costos:** no crea servicios nuevos. La IA local con QVAC evita pagar a terceros por cada consulta. Agregar una región, un oficio o un curso es cargar datos.
- **Medición en un piloto** (ej. Centros de Empleo de 3 regiones): personas que completan su panal, inscritas en Capacíta-T, que postulan a otra ocupación, colocadas a 3 y 6 meses, y tiempo ahorrado por atención.

---

## 14. Hoja de ruta

**Ya implementado:** todo lo descrito en la sección 6. Además: modo asesor, casos demo, versión de un solo archivo y versión web pública con QR.

**Siguiente (con datos reales del MTPE):**
1. Estándares de competencia del MTPE en lugar del catálogo de ejemplo.
2. Demanda real (EDO 2026) por región y ocupación.
3. Catálogo real de Capacíta-T con enlace directo a cada curso.
4. Mapa de Centros de Empleo cercanos.
5. Voz con QVAC (transcripción local) en lugar del dictado del navegador.
6. Quechua y aimara.

**Más adelante:**
7. Referencias verificables (un exjefe confirma una habilidad con un enlace).
8. Simulador de entrevista por voz.
9. Recordatorios del plan por WhatsApp o SMS (con consentimiento).
10. Panel anónimo para el MTPE.
11. Postular en Empleos Perú con el panal como perfil.
12. Modo asesor ampliado.

---

## 15. Estado actual, límites honestos y pendientes (29/10/2026)

- ✅ El prototipo funciona completo en celular y computadora: https://andyferaldo.github.io/chambea/ (modo sin modelo, en el navegador).
- ✅ 15 pruebas automáticas del motor pasan (Rosa y Marleny dan lo esperado).
- ⚠️ **Datos ilustrativos:** ocupaciones, demanda, cursos y perfiles del banco son de ejemplo, salvo los enlaces a Empleos Perú y Capacíta-T, y los temas de curso marcados como verificados.
- ⚠️ **Investigación simulada:** las 5 entrevistas del documento 03 son simuladas; no presentarlas como reales.
- ⚠️ **QVAC:**
  - el código ya está listo para conectarse, pero falta probarlo en vivo en una laptop capaz (8 GB de RAM o más y la línea "GPU acceleration" de `qvac doctor` en ✅);
  - la laptop de Andy (4 GB de RAM, sin Vulkan) no puede correr el modelo.
- ⚠️ **Micrófono:** en la demo usa el dictado del navegador (excepción documentada a la regla de privacidad).
- ⚠️ **Cuentas y banco:** demo local en el navegador; en la versión real irían con Empleos Perú.
- ⚠️ **Regla de herramientas de IA:** los organizadores indicaron que se debe programar con herramientas habilitadas por Tether y no con plataformas como Claude. El prototipo se desarrolló con ayuda de Claude como asistente de programación (queda registrado en los commits del repositorio). La IA **de la solución** no usa Claude ni ninguna IA en la nube: usa QVAC o reglas. **Pendiente: pedir aclaración a los organizadores y declararlo con transparencia.**

---

## 16. Preguntas probables del jurado y respuestas cortas

- **¿Certifican competencias?** No. Es una identificación preliminar. Para certificarse, el MTPE tiene un proceso oficial, y Chambea lleva hacia él.
- **¿Consiguen trabajo?** No prometemos eso. Conectamos con Empleos Perú, Capacíta-T y los Centros de Empleo.
- **¿Cómo justifican qué habilidades tiene la persona?** Cada habilidad tiene evidencia: la frase textual de la persona, la tarea de la que viene, su oficio o una confirmación en las preguntas puente. La IA no puede inventar: lo que propone se valida contra el catálogo y contra lo que la persona dijo.
- **¿Cómo eligen las rutas?** Cobertura ponderada (logro 3, habilidad 2, conocimiento 2, cualidad 1), ajustada por intereses (+10 %) y límites (−20 %), y luego por la demanda regional. Solo ocupaciones de nivel operativo. Se muestra la fórmula en "¿Por qué esta ruta?".
- **¿Y si la persona no sabe usar el celular?** Puede hacerlo con un asesor en un Centro de Empleo (modo asesor), hablar en vez de escribir y escuchar las preguntas.
- **¿Dónde quedan los datos?** En el navegador de la persona y en el servidor propio con QVAC. Nada va a IAs de terceros.
- **¿Cómo escala?** Cargando datos oficiales (estándares, EDO 2026, Capacíta-T) en archivos JSON, sin reprogramar. Una región nueva es un bloque de datos.
- **¿Por qué no es "una app más"?** Es un servicio que se apoya en lo que el Estado ya tiene. El valor está en el método (tarea → habilidad, preguntas puente, motor explicable), no en la app.

---

## 17. Glosario

- **Panal:** el conjunto de habilidades de la persona, mostrado como celdas hexagonales.
- **Celda:** una habilidad (de una de las 4 dimensiones).
- **Dimensiones del perfil (MTPE):** conocimiento (qué sabe), habilidad (qué sabe hacer), cualidad (cómo es), competencia o logro (qué logra y cómo lo demuestra).
- **Ruta:** una ocupación a la que la persona podría pasar.
- **Cobertura:** porcentaje ponderado de lo que pide una ocupación que la persona ya tiene.
- **Recolocación lateral:** pasar a otra ocupación de nivel parecido, no ascender.
- **Preguntas puente:** preguntas sobre habilidades no detectadas que acercarían a otra ocupación.
- **Primer paso:** la recomendación única (curso, postular o asesor).
- **Banco de talento:** directorio voluntario de personas con su panal, para empresas y Centros de Empleo, con contacto intermediado.
- **Modo mock:** funcionamiento sin modelo de IA (reglas y palabras clave).
- **QVAC:** plataforma de IA local de Tether. Corre modelos en la propia computadora o servidor.
- **CUL:** Certificado Único Laboral, gratuito en Empleos Perú.
- **Capacíta-T:** plataforma de cursos gratuitos del MTPE (antes Capacítate Perú).
- **EDO 2026:** Encuesta de Demanda Ocupacional del MTPE.
