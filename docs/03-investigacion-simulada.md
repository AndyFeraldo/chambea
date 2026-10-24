# 03 · Investigación SIMULADA (5 entrevistas)

> ⚠️ **IMPORTANTE:** estas entrevistas son **simuladas** para poder empezar a construir el MVP. **No son evidencia real** y no deben presentarse como hallazgos al jurado. El equipo las reemplazará con entrevistas reales. El código no debe depender de los nombres ni de las frases de este archivo, salvo los 2 casos precargados del modo demo.

## Las 5 preguntas usadas (guía, no cuestionario)
1. **Aprendizaje (antes):** "Cuéntame cómo aprendiste lo que haces hoy."
2. **Valor (hoy):** "¿Cómo es un día normal en tu trabajo? ¿Qué cosas te piden a ti porque saben que las haces bien?"
3. **Riesgo (hoy):** "Cuéntame la última vez que bajaron tus horas, turnos o encargos, o que te quedaste sin trabajo. ¿Qué hiciste?"
4. **Canales (después):** "Cuéntame la última vez que buscaste trabajo o un curso. ¿Dónde buscaste y qué pasó?"
5. **Evidencia y barreras (después):** "¿Cómo le demostrarías a un nuevo empleador que sabes hacerlo? ¿Qué te ha detenido para cambiar?"

## Casos

### 1. Rosa — 41 años, cajera en planilla, supermercado, Lima Metropolitana (perfil: en planilla, pero en riesgo)
- **Dijo:** "Me dejan cerrar la caja sola, nunca me falta plata." / "Si ponen más cajas de esas donde uno mismo cobra, a las primeras que sacan es a nosotras."
- **Hizo:** solo revisó avisos que decían "cajera"; no postuló a "asesora de ventas" aunque atiende clientes todo el día.
- **Contexto:** el supermercado instaló 4 cajas de autoservicio; le redujeron un turno.
- **Le dolió:** sentir que 8 años "solo sirven para cobrar".
- **Quería:** mantener un sueldo fijo sin dejar de trabajar para estudiar.
- **Sorpresa:** no conocía Capacítate Perú; pensaba que los cursos del Estado eran presenciales y largos.

### 2. Jorge — 35 años, reponedor por temporada vía agencia, Arequipa (perfil: con empleo informal)
- **Dijo:** "Yo sé dónde va cada producto sin ver la etiqueta." / "Cuando acaba la campaña, te llaman de nuevo si te portaste bien."
- **Hizo:** consigue trabajo por recomendación de un exjefe y por un grupo de Facebook de empleos.
- **Contexto:** contratos de 2 o 3 meses; entre campañas hace mudanzas.
- **Le dolió:** no tener nada "en papel" que muestre lo que sabe.
- **Quería:** algo estable, aunque sea con el mismo sueldo.
- **Sorpresa:** entró una vez a Empleos Perú, pero le pedían correo y CV y lo dejó.

### 3. Marleny — 48 años, limpieza por días en casas y oficinas, Lima Metropolitana (perfil: con empleo informal)
- **Dijo:** "Yo sé qué productos no se mezclan, eso nadie me lo enseñó en un curso." / "Las señoras me dejan las llaves."
- **Hizo:** cuando una oficina cerró, llamó a todas las señoras de su lista; no buscó en internet.
- **Contexto:** pasó de 6 a 3 días de trabajo a la semana.
- **Le dolió:** "Para trabajar en una empresa de limpieza piden secundaria completa y yo no la terminé."
- **Quería:** días fijos y seguro de salud.
- **Sorpresa:** valora más la confianza de sus clientes que cualquier diploma, pero no sabe cómo "mostrar" esa confianza.

### 4. Kevin — 24 años, vendedor en galería de celulares, sin contrato, se quedó sin empleo, Trujillo (La Libertad) (perfil: sin empleo)
- **Dijo:** "Yo vendo lo que sea, el tema es que no tengo experiencia 'formal'." / "Necesito algo ya, no puedo estar dos meses estudiando."
- **Hizo:** postuló por Computrabajo a 10 avisos de "vendedor"; lo llamaron de uno y le pidieron constancia de trabajo.
- **Contexto:** la galería cerró por baja de ventas.
- **Le dolió:** que su experiencia "no cuente" porque no hay quien la firme.
- **Quería:** un ingreso este mes.
- **Sorpresa:** usa el celular para todo, pero nunca usó una computadora para buscar trabajo.

### 5. Carmen — 39 años, auxiliar administrativa en empresa familiar, en planilla, Lima Metropolitana (perfil: en planilla, pero en riesgo)
- **Dijo:** "Hago de todo: facturas, archivo, atiendo proveedores." / "Ahora el contador quiere que todo sea con un sistema y yo aprendí en cuaderno."
- **Hizo:** pidió a su sobrina que le enseñe Excel por las noches.
- **Contexto:** la empresa está digitalizando procesos.
- **Le dolió:** sentir que "ya no está a la altura".
- **Quería:** seguir en una oficina, con horario fijo.
- **Sorpresa:** le daba vergüenza decir que no sabía usar el sistema; prefería aprender sola.

## Patrones (simulados)
- **P1 · Describen su trabajo por tareas y por lugar, no por competencias.** "Soy cajera de [tienda]", "hago de todo". (5/5)
- **P2 · Su prueba de valor es la confianza:** "me dejan las llaves", "me dejan cerrar la caja", "te llaman si te portaste bien". (4/5)
- **P3 · Buscan solo avisos con el mismo nombre de su puesto** y descartan puestos cercanos. (3/5)
- **P4 · No pueden dejar de generar ingresos para capacitarse:** cualquier paso debe ser corto, flexible y desde el celular. (5/5)
- **P5 · Los canales formales los frenan:** piden CV, correo, constancia o secundaria completa; recurren a recomendados y grupos de Facebook. (4/5)

## Cadena hacia el insight (simulada)
- **Dato:** Rosa, con 8 años como cajera, no postuló a "asesora de ventas".
- **Comportamiento:** solo revisa avisos con el nombre de su puesto actual.
- **Patrón:** varias personas descartan puestos que no reconocen, aunque piden lo que ya hacen.
- **Motivación:** no buscan cambiar de rubro; buscan no volver a empezar de cero.
- **Tensión:** saben que valen porque les confían cosas, pero esa confianza no tiene nombre ni papel, y no viaja con ellas.
- **Insight de trabajo:** *"La confianza que se ganaron se queda en el lugar donde la ganaron: lo que saben hacer no tiene nombre ni prueba, y por eso no se lo pueden llevar a otro puesto."*

## Qué implica para el MVP
| Patrón | Funcionalidad |
|---|---|
| P1 | Preguntas abiertas en su lenguaje; la IA traduce tareas a competencias. |
| P2 | Cada competencia puede llevar su evidencia ("Lo demuestra: «…»"); "Mi panal" descargable. |
| P3 | En cada ruta: "También se publica como: …" con nombres reales de avisos. |
| P4 | Primer paso filtrado por horas, modalidad celular y costo cero. |
| P5 | No pedir CV ni correo; opción de ir con un asesor; mostrar requisitos mínimos de cada ocupación con honestidad. |
