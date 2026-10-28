# 07 · Banco de talento y plataforma web

## La idea
Un **banco de personas con oficio**, organizado por **sector y profesión**, donde empresas y Centros de Empleo buscan por **lo que la persona sabe hacer** (su panal), no por el nombre de su último puesto.

Ejemplo: quien busca *Vendedor/a de tienda* encuentra también a cajeras con 86 % de coincidencia, que con una búsqueda por título nunca aparecerían. Es el mismo insight de la investigación (P3: "solo buscan avisos con el nombre de su puesto"), pero del lado del empleador.

## Cómo funciona (prototipo)
1. La persona arma su panal y, si quiere, **crea su cuenta** (nombre, celular y PIN de 4 números; sin correo ni CV).
2. Marca **"Quiero aparecer en el Banco de talento"** (opcional, se puede quitar cuando quiera).
3. Empresas y Centros de Empleo filtran por **sector**, **profesión**, **región** y "listos para postular" (≥ 85 %).
4. Cada perfil muestra: iniciales, oficio actual, región, % para la profesión buscada, sus 4 habilidades más fuertes y sellos ("Panal confirmado", "Llevando un curso").
5. **Contacto con intermediación:** la solicitud llega al Centro de Empleo, el asesor llama a la persona y ella decide. Nunca se publica el celular.

## Lo que es demo y lo que sería real
| En el prototipo | En la versión real |
|---|---|
| La cuenta se guarda solo en el navegador (PIN cifrado con SHA-256) | Registro con la cuenta de **Empleos Perú (MTPE)** |
| Perfiles de ejemplo generados a partir de `data/` (marcados "Ejemplo") | Perfiles reales de personas que dieron su consentimiento |
| "Solicitar contacto" no envía nada | La solicitud llega al Centro de Empleo de la región |
| — | Tratamiento de datos según la **Ley N.° 29733 de Protección de Datos Personales**, con consentimiento explícito, finalidad limitada y derecho a salir del banco |

## Por qué el MTPE debería operarlo
- Convierte a Chambea en un **servicio de intermediación** con datos de habilidades por región y sector.
- Da información agregada (anónima) para planificar cursos: qué habilidades faltan más por región.
- Refuerza Empleos Perú y los Centros de Empleo en vez de competir con ellos.

## Plataforma web
"Mi panal" y el banco usan un diseño de plataforma: barra superior con **Inicio, Mi panal, Banco de talento, Ingresar y Registrarme**; columna izquierda con el perfil (y % completo), la navegación y la privacidad; columna derecha con el plan, las ofertas y el banco. En celular, todo se apila y la navegación pasa al menú.
