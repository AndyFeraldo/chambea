# 09 · Matriz de transiciones entre ocupaciones

> Archivo: `docs/Chambea-Matriz-Transiciones.xlsx` (se regenera con `python3 scripts/crear-matriz-transiciones.py . docs/Chambea-Matriz-Transiciones.xlsx`).
> Datos ilustrativos: se reemplazarán por los estándares de competencia del MTPE y la EDO 2026 sin cambiar el cálculo.

## Por qué existe
El MTPE aclaró que **no existe una base de transiciones**: identificarlas es parte de la innovación del reto. Dos ocupaciones se relacionan **por las competencias que comparten**, y se debe mostrar **sustento técnico y mecanismos de validación**. Esta matriz hace exactamente eso con la información estructurada de Chambea.

## Cómo se calcula (igual que el motor de la app)
```
Proximidad(A → B) = suma de pesos de las habilidades de B que A también tiene
                  ÷ suma de pesos de todas las habilidades de B
Pesos: logro (competencia) 3 · habilidad 2 · conocimiento 2 · cualidad 1
```
- No es simétrica: Cajero/a → Vendedor/a de tienda = 50 %, pero Vendedor/a de tienda → Cajero/a = 54 %.
- La matriz compara el perfil típico de cada ocupación (7 habilidades). En la app se compara el **panal real** de la persona, que suele tener más habilidades: por eso Rosa llega a 6 de 7 para Vendedor/a de tienda.
- Cortes de lectura (solo para esta matriz, editables): cercana ≥ 40 %, media 20–40 %, lejana < 20 %.

## Las 3 ocupaciones más próximas de cada oficio
| Oficio de hoy | Más cercana | 2.ª | 3.ª | Lo que comparte con la más cercana |
|---|---|---|---|---|
| Cajero/a | Vendedor/a de tienda (50%) | Mozo/a de restaurante (38%) | Repartidor/a (25%) | Atención al cliente, Medios de pago, Cobro en caja, Paciencia |
| Vendedor/a de tienda | Cajero/a (54%) | Mozo/a de restaurante (38%) | Asesor/a de atención al cliente (29%) | Cobro en caja, Medios de pago, Atención al cliente, Paciencia |
| Reponedor/a y abastecedor/a | Auxiliar de almacén (46%) | Operario/a de producción (18%) | Vendedor/a de tienda (14%) | Recepción de mercadería, Control de inventario, Organización y orden, Resistencia física |
| Auxiliar administrativo/a | Asesor/a de atención al cliente (29%) | Conserje / mantenimiento (25%) | Auxiliar de almacén (23%) | Registro de datos, Computación básica |
| Personal de limpieza | Conserje / mantenimiento (58%) | Operario/a de producción (27%) | Repartidor/a (25%) | Seguridad en el trabajo, Honestidad, Puntualidad, Ambientes impecables |
| Ayudante de cocina | Cuidador/a de personas (33%) | Repartidor/a (25%) | Auxiliar de almacén (23%) | Higiene de alimentos, Cocina |
| Mozo/a de restaurante | Cajero/a (38%) | Vendedor/a de tienda (36%) | Cuidador/a de personas (33%) | Cobro en caja, Atención al cliente, Paciencia |
| Auxiliar de almacén | Reponedor/a y abastecedor/a (46%) | Operario/a de producción (36%) | Conserje / mantenimiento (33%) | Control de inventario, Recepción de mercadería, Organización y orden, Resistencia física |
| Repartidor/a | Auxiliar de almacén (31%) | Personal de limpieza (25%) | Ayudante de cocina (23%) | Resistencia física, Pedidos a tiempo |
| Operario/a de producción | Auxiliar de almacén (31%) | Conserje / mantenimiento (25%) | Personal de limpieza (25%) | Organización y orden, Resistencia física, Seguridad en el trabajo |
| Asesor/a de atención al cliente | Auxiliar administrativo/a (31%) | Vendedor/a de tienda (29%) | Mozo/a de restaurante (23%) | Registro de datos, Computación básica |
| Cuidador/a de personas | Ayudante de cocina (31%) | Mozo/a de restaurante (31%) | Conserje / mantenimiento (17%) | Cocina, Higiene de alimentos |
| Conserje / mantenimiento | Personal de limpieza (58%) | Auxiliar de almacén (31%) | Operario/a de producción (27%) | Seguridad en el trabajo, Honestidad, Puntualidad, Ambientes impecables |

## Hojas del Excel
Léeme · Supuestos (pesos y cortes editables) · Resumen · Matriz habilidades (ocupación × habilidad) · Proximidad (13 × 13 con colores) · En común (n.º de habilidades compartidas) · Rutas por oficio (de la más cercana a la más lejana, con lo que comparten y lo que falta) · Validación.

## Mecanismos de validación
1. **Competencias compartidas** con las 4 dimensiones del MTPE (hecho).
2. **Pesos explícitos** y análisis de sensibilidad cambiando los pesos (hecho).
3. **Mismo cálculo que la app**, cubierto por 15 pruebas automáticas (hecho).
4. **Contraste con avisos reales** (alias de cada ocupación) (parcial).
5. **Estándares de competencia del MTPE** en lugar de las habilidades de ejemplo (pendiente).
6. **Validación con asesores de Centros de Empleo**: plantilla incluida para calificar de 1 a 5 si cada transición es realista (pendiente).
7. **Demanda real (EDO 2026)** (pendiente).
8. **Transiciones observadas** con datos de colocaciones (futuro).
