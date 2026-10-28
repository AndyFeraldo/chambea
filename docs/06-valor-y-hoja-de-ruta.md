# 06 · Valor agregado, público objetivo y hoja de ruta

## 1. ¿Cuál es el valor agregado? (si "cualquiera lo haría con IA")

El código es la parte fácil. El valor de Chambea está en cuatro decisiones de diseño que no vienen "de fábrica" en ninguna IA:

| Valor | Qué es | Por qué importa |
|---|---|---|
| **Método tarea → habilidad** | Traduce cómo habla la gente ("me dejan las llaves", "cobro en caja") a las 4 dimensiones del perfil del MTPE (conocimiento, habilidad, cualidad, logro) | La gente no se describe con competencias: se describe con tareas (patrón P1). Sin esta traducción, la IA no entiende a la persona |
| **Entrevista que pregunta lo que acerca** | Preguntas por dimensión, una adaptada al oficio y **preguntas puente**: el sistema pregunta justo lo que más acerca a la persona a otra profesión | No se queda en lo que la persona dijo: busca activamente la recolocación lateral |
| **Motor explicable, no caja negra** | La cobertura usa pesos públicos (logro 3, habilidad 2, conocimiento 2, cualidad 1) y cada habilidad muestra su evidencia. "¿Por qué esta ruta?" enseña la cuenta | Un servicio público tiene que poder explicar cada recomendación. La IA ayuda a entender a la persona, pero la decisión es auditable |
| **Puente con lo que el Estado ya tiene** | Termina siempre en Capacíta-T, Empleos Perú, Centros de Empleo o certificación MTPE | No compite con el Estado: aumenta el uso de sus servicios |
| **Privacidad por diseño (QVAC)** | Sin cuentas, sin base de datos de personas. La IA corre en servidores propios con QVAC. El panal se comparte dentro del enlace, sin servidor | Los datos de la persona no salen del ecosistema persona/MTPE (condición de las bases) |
| **Funciona sin IA** | Si la IA falla, el motor de reglas responde igual | Robusto en celulares de gama baja y con mala conexión |
| **Escala con datos, no con código** | Oficios, regiones, cursos, tareas y preguntas son archivos JSON | El MTPE carga sus estándares y la EDO 2026 sin reprogramar |

> Frase para el jurado: *"Cualquiera puede programar una app. Lo difícil es saber qué preguntar, cómo convertir 'me dejan las llaves' en 'honestidad' y conectar eso con lo que el Estado ya ofrece. Ese es nuestro aporte."*

## 2. Público objetivo (según el reto y el Workshop)

**Personas que aprendieron su oficio en la práctica, sin certificados, cuyo trabajo está en riesgo por la reducción de su ocupación**, tengan o no contrato.

| Perfil | Situación | Chambea prioriza |
|---|---|---|
| Sin empleo | Necesita un ingreso pronto y no sabe qué puestos encajan con lo que ya hace | Rutas que ya puede ejercer (≥ 80 %) |
| Con empleo informal | Trabaja por día, por encargo o por cuenta propia; sus horas pueden bajar | Cursos cortos, desde el celular y gratis |
| En planilla, pero en riesgo | Tiene contrato, pero su ocupación se reduce | Prepararse antes de perder el puesto |

**Ocupaciones priorizadas por el MTPE:** personal de limpieza, auxiliares administrativos, reponedores y abastecedores, cajeros y vendedores de tienda.
**Regla de oro:** no asumir que todas están desempleadas ni que todas son informales.

## 3. Hoja de ruta (ideas para agregar valor)

### Ya implementado en el prototipo
- Entrevista guiada por dimensiones + pregunta por oficio + intereses + límites.
- Preguntas puente ("¿también sabes hacer esto?").
- "¿Por qué esta ruta?" con la fórmula.
- Fichas de profesión con sector, qué hace, alias de avisos y requisitos.
- Plan de acción con checklist (curso, CUL, postular, certificación).
- Texto para presentarse sin CV (copiar o WhatsApp).
- QR/enlace del panal para el asesor (sin servidor).
- Guardado opcional en el celular, menú con inicio y borrar todo.
- Escuchar la pregunta en voz alta.

### Siguiente (con datos reales del MTPE)
1. **Estándares de competencia del MTPE** en lugar del catálogo de ejemplo.
2. **Demanda real (EDO 2026)** por región y ocupación.
3. **Catálogo real de Capacíta-T** con enlace directo a cada curso.
4. **Mapa de Centros de Empleo** cercanos (datos oficiales).
5. **Voz con QVAC** (reconocimiento de voz local) en lugar del dictado del navegador.
6. **Quechua y aimara** (los textos ya están en un archivo de traducciones).

### Más adelante
7. **Referencias verificables:** un exjefe o cliente confirma una habilidad con un enlace ("Sí, Rosa cerraba la caja sola").
8. **Simulador de entrevista** por voz para practicar.
9. **Recordatorios del plan** por WhatsApp o SMS (con consentimiento).
10. **Panel anónimo para el MTPE:** qué habilidades faltan más por región, para planificar cursos (datos agregados, nunca personales).
11. **Integración con Empleos Perú:** postular con el panal como perfil.
12. **Modo asesor ampliado:** el asesor del Centro de Empleo acompaña y anota con la persona.
