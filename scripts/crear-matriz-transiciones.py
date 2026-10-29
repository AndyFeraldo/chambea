# Crea la matriz Ocupación × Habilidades y la matriz de proximidad entre ocupaciones de Chambea.
import json, sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import ColorScaleRule, CellIsRule, FormulaRule
from openpyxl.utils import get_column_letter as L
from openpyxl.comments import Comment

RAIZ, SALIDA = sys.argv[1], sys.argv[2]
ocup = json.load(open(f'{RAIZ}/data/ocupaciones.json'))['ocupaciones']
comp = json.load(open(f'{RAIZ}/data/competencias.json'))['competencias']
reg = json.load(open(f'{RAIZ}/data/regiones.json'))['regiones']
cidx = {c['id']: c for c in comp}
ORDEN = ['conocimiento', 'habilidad', 'cualidad', 'competencia']
ETQ = {'conocimiento': 'Conocimiento', 'habilidad': 'Habilidad', 'cualidad': 'Cualidad', 'competencia': 'Logro (competencia)'}
QUE = {'conocimiento': 'Lo que sabe', 'habilidad': 'Lo que sabe hacer', 'cualidad': 'Cómo es', 'competencia': 'Lo que logra y cómo lo demuestra'}
PESO = {'competencia': 3, 'habilidad': 2, 'conocimiento': 2, 'cualidad': 1}
FILL_DIM = {'conocimiento': 'CDEBDF', 'habilidad': 'FDE9B9', 'cualidad': 'E3E9E7', 'competencia': '1A7A5C'}
usadas = {r for o in ocup for r in o['requeridas']}
skills = sorted([c for c in comp if c['id'] in usadas], key=lambda c: (ORDEN.index(c['dimension']), c.get('nombre_corto', c['nombre'])))
N, M = len(skills), len(ocup)

F = 'Arial'
fnt = lambda **k: Font(name=F, **k)
NEGRO, VERDE, VO, MIEL, CREMA = '0E1A17', '26A17B', '1A7A5C', 'F5B82E', 'FFF6DE'
fill = lambda c: PatternFill('solid', start_color=c, end_color=c)
fino = Side(style='thin', color='D3DED9')
borde = Border(left=fino, right=fino, top=fino, bottom=fino)
AZUL = '0000FF'

wb = Workbook()

def titulo(ws, texto, sub):
    ws['A1'] = texto; ws['A1'].font = fnt(bold=True, size=16, color=NEGRO)
    ws['A2'] = sub; ws['A2'].font = fnt(size=10, color='4A5A55', italic=True)
    ws.sheet_view.showGridLines = False

def cab(c, oscuro=True):
    c.font = fnt(bold=True, color='FFFFFF' if oscuro else NEGRO, size=10)
    c.fill = fill(NEGRO if oscuro else CREMA)
    c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    c.border = borde

# ---------------- Supuestos ----------------
sup = wb.active; sup.title = 'Supuestos'
titulo(sup, 'Supuestos del cálculo', 'Celdas en azul: se pueden cambiar. Todo el libro se recalcula solo.')
sup['A4'], sup['B4'], sup['C4'] = 'Dimensión del perfil (MTPE)', 'Peso', 'Qué significa'
for c in ('A4', 'B4', 'C4'): cab(sup[c])
for i, d in enumerate(['competencia', 'habilidad', 'conocimiento', 'cualidad']):
    r = 5 + i
    sup[f'A{r}'] = ETQ[d]; sup[f'B{r}'] = PESO[d]; sup[f'C{r}'] = QUE[d]
    sup[f'B{r}'].font = fnt(color=AZUL, bold=True)
    for col in 'ABC': sup[f'{col}{r}'].border = borde; 
    sup[f'A{r}'].font = fnt(bold=True); sup[f'C{r}'].font = fnt()
    sup[f'A{r}'].fill = fill(FILL_DIM[d])
    if d == 'competencia': sup[f'A{r}'].font = fnt(bold=True, color='FFFFFF')
sup['A9'] = 'Fuente de los pesos: motor de Chambea (shared/src/motor.ts, constante PESOS). Un logro pesa más porque es la prueba más fuerte; una cualidad pesa menos porque la comparten casi todos los trabajos.'
sup['A9'].font = fnt(size=9, italic=True, color='4A5A55')
sup['A11'], sup['B11'], sup['C11'] = 'Clasificación de la cercanía (solo para esta matriz)', 'Desde', 'Lectura'
for c in ('A11', 'B11', 'C11'): cab(sup[c])
niveles = [('Cercana', 0.40, 'Comparten buena parte del perfil: la transición es natural.'),
           ('Media', 0.20, 'Comparten algo: con un curso corto se acercan.'),
           ('Lejana', 0.0, 'Comparten poco o nada: haría falta empezar casi de cero.')]
for i, (n, v, t) in enumerate(niveles):
    r = 12 + i
    sup[f'A{r}'] = n; sup[f'B{r}'] = v; sup[f'C{r}'] = t
    sup[f'B{r}'].number_format = '0%'; sup[f'B{r}'].font = fnt(color=AZUL, bold=True)
    sup[f'A{r}'].font = fnt(bold=True); sup[f'C{r}'].font = fnt()
    for col in 'ABC': sup[f'{col}{r}'].border = borde
sup['A15'] = ('Supuesto del equipo: estos cortes ordenan ocupación contra ocupación usando solo las 7 habilidades típicas de cada una. '
              'En la app, la cobertura se calcula con el panal real de la persona (que suele tener más habilidades), y ahí se usan otros cortes: '
              '85 % o más = puede postular; 50 % a 85 % = curso; menos de 50 % = asesor.')
sup['A15'].font = fnt(size=9, italic=True, color='4A5A55'); sup['A15'].alignment = Alignment(wrap_text=True, vertical='top')
sup.merge_cells('A15:C17'); sup.merge_cells('A9:C10'); sup['A9'].alignment = Alignment(wrap_text=True, vertical='top')
sup.column_dimensions['A'].width = 44; sup.column_dimensions['B'].width = 10; sup.column_dimensions['C'].width = 70
PESOS_RANGO = "Supuestos!$B$5:$B$8"; DIMS_RANGO = "Supuestos!$A$5:$A$8"
U_CERCANA, U_MEDIA = 'Supuestos!$B$12', 'Supuestos!$B$13'

# ---------------- Matriz habilidades ----------------
mh = wb.create_sheet('Matriz habilidades')
titulo(mh, 'Matriz Ocupación × Habilidades', '1 = la ocupación pide esa habilidad (dato de data/ocupaciones.json). Cada ocupación pide 7. Datos ilustrativos, a reemplazar por los estándares de competencia del MTPE.')
FILA0 = 5; PRIM = FILA0 + 1; ULT = FILA0 + N
heads = ['Id', 'Habilidad', 'Cómo lo diría la persona', 'Dimensión', 'Peso'] + [o['nombre'] for o in ocup] + ['N.º de ocupaciones que la piden']
for j, h in enumerate(heads, start=1):
    c = mh.cell(FILA0, j, h); cab(c)
mh.row_dimensions[FILA0].height = 62
COL_OC = {o['id']: L(6 + k) for k, o in enumerate(ocup)}
for i, s in enumerate(skills):
    r = PRIM + i
    vals = [s['id'], s.get('nombre_corto', s['nombre']), s['nombre_simple'], ETQ[s['dimension']]]
    for j, v in enumerate(vals, start=1):
        c = mh.cell(r, j, v); c.font = fnt(size=10); c.border = borde
    mh.cell(r, 4).fill = fill(FILL_DIM[s['dimension']])
    if s['dimension'] == 'competencia': mh.cell(r, 4).font = fnt(size=10, color='FFFFFF', bold=True)
    c = mh.cell(r, 5, f'=INDEX({PESOS_RANGO},MATCH(D{r},{DIMS_RANGO},0))'); c.font = fnt(size=10); c.alignment = Alignment(horizontal='center'); c.border = borde
    for k, o in enumerate(ocup):
        c = mh.cell(r, 6 + k, 1 if s['id'] in o['requeridas'] else None)
        c.font = fnt(size=10, color=AZUL, bold=True); c.alignment = Alignment(horizontal='center'); c.border = borde
    c = mh.cell(r, 6 + M, f'=COUNT({L(6)}{r}:{L(5 + M)}{r})'); c.font = fnt(size=10, bold=True); c.alignment = Alignment(horizontal='center'); c.border = borde
# Totales
rt = ULT + 1
mh.cell(rt, 2, 'Habilidades que pide').font = fnt(bold=True)
mh.cell(rt + 1, 2, 'Suma de pesos que pide (denominador)').font = fnt(bold=True)
for k in range(M):
    col = L(6 + k)
    c = mh.cell(rt, 6 + k, f'=COUNT({col}{PRIM}:{col}{ULT})'); c.font = fnt(bold=True); c.alignment = Alignment(horizontal='center'); c.border = borde
    c = mh.cell(rt + 1, 6 + k, f'=SUMPRODUCT($E${PRIM}:$E${ULT},{col}{PRIM}:{col}{ULT})'); c.font = fnt(bold=True); c.alignment = Alignment(horizontal='center'); c.border = borde
mh.conditional_formatting.add(f'{L(6)}{PRIM}:{L(5 + M)}{ULT}', CellIsRule(operator='equal', formula=['1'], fill=fill(MIEL)))
mh.column_dimensions['A'].width = 26; mh.column_dimensions['B'].width = 24; mh.column_dimensions['C'].width = 40; mh.column_dimensions['D'].width = 18; mh.column_dimensions['E'].width = 7
for k in range(M): mh.column_dimensions[L(6 + k)].width = 12
mh.column_dimensions[L(6 + M)].width = 14
mh.freeze_panes = mh.cell(PRIM, 6)
mh.cell(rt + 3, 1, f'Se muestran las {N} habilidades del catálogo que pide al menos una ocupación (el catálogo tiene {len(comp)}).').font = fnt(size=9, italic=True, color='4A5A55')

MH = "'Matriz habilidades'"
rng = lambda col: f"{MH}!${col}${PRIM}:${col}${ULT}"
PES = f"{MH}!$E${PRIM}:$E${ULT}"

# ---------------- Proximidad ----------------
px = wb.create_sheet('Proximidad')
titulo(px, 'Matriz de proximidad entre ocupaciones', 'Fila = oficio de hoy (lo que la persona ya sabe). Columna = ocupación a la que podría pasar. Valor = % ponderado de lo que pide la columna que ya tiene la fila.')
R0, C0 = 5, 2
px.cell(R0, C0, 'Oficio de hoy ↓  /  Podría pasar a →'); cab(px.cell(R0, C0))
for k, o in enumerate(ocup):
    cab(px.cell(R0, C0 + 1 + k, o['nombre']))
    c = px.cell(R0 + 1 + k, C0, o['nombre']); cab(c); c.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
for i, a in enumerate(ocup):
    for j, b in enumerate(ocup):
        r, col = R0 + 1 + i, C0 + 1 + j
        ca, cb = COL_OC[a['id']], COL_OC[b['id']]
        c = px.cell(r, col, '—' if i == j else f'=SUMPRODUCT({PES},{rng(ca)},{rng(cb)})/SUMPRODUCT({PES},{rng(cb)})')
        c.number_format = '0%'; c.font = fnt(size=10); c.alignment = Alignment(horizontal='center', vertical='center'); c.border = borde
        if i == j: c.fill = fill('D9D9D9'); c.font = fnt(size=10, color='808080')
area = f'{L(C0 + 1)}{R0 + 1}:{L(C0 + M)}{R0 + M}'
px.conditional_formatting.add(area, FormulaRule(formula=[f'ROW()-{R0}=COLUMN()-{C0}'], fill=fill('D9D9D9'), stopIfTrue=True))
px.conditional_formatting.add(area, ColorScaleRule(start_type='num', start_value=0, start_color='FFFFFF', mid_type='num', mid_value=0.3, mid_color='FDE9B9', end_type='num', end_value=0.6, end_color=VERDE))
px.row_dimensions[R0].height = 62
for k in range(M): px.row_dimensions[R0 + 1 + k].height = 30
px.column_dimensions['A'].width = 2; px.column_dimensions[L(C0)].width = 30
for k in range(M): px.column_dimensions[L(C0 + 1 + k)].width = 12
px.freeze_panes = px.cell(R0 + 1, C0 + 1)
nota = R0 + M + 2
px.cell(nota, C0, 'Cómo se calcula (igual que el motor de Chambea):').font = fnt(bold=True)
px.cell(nota + 1, C0, 'Proximidad(A → B) = suma de pesos de las habilidades de B que A también tiene ÷ suma de pesos de todas las habilidades de B.').font = fnt(size=10)
px.cell(nota + 2, C0, 'No es simétrica: A → B puede ser distinto de B → A, porque cada ocupación pide habilidades con pesos distintos. La diagonal (—) es la misma ocupación.').font = fnt(size=10)
px.cell(nota + 3, C0, 'Colores: blanco = no comparten nada · amarillo = comparten algo · verde = muy cercanas.').font = fnt(size=10)
PX_AREA = f"Proximidad!${L(C0 + 1)}${R0 + 1}:${L(C0 + M)}${R0 + M}"
PX_FILAS = f"Proximidad!${L(C0)}${R0 + 1}:${L(C0)}${R0 + M}"
PX_COLS = f"Proximidad!${L(C0 + 1)}${R0}:${L(C0 + M)}${R0}"

# ---------------- En común ----------------
ec = wb.create_sheet('En común')
titulo(ec, 'Habilidades en común entre ocupaciones', 'Cuántas de sus 7 habilidades típicas comparten dos ocupaciones (sin pesos). Esta matriz sí es simétrica.')
ec.cell(R0, C0, 'Ocupación'); cab(ec.cell(R0, C0))
for k, o in enumerate(ocup):
    cab(ec.cell(R0, C0 + 1 + k, o['nombre']))
    c = ec.cell(R0 + 1 + k, C0, o['nombre']); cab(c); c.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
for i, a in enumerate(ocup):
    for j, b in enumerate(ocup):
        c = ec.cell(R0 + 1 + i, C0 + 1 + j, '—' if i == j else f'=SUMPRODUCT({rng(COL_OC[a["id"]])},{rng(COL_OC[b["id"]])})')
        c.font = fnt(size=10); c.alignment = Alignment(horizontal='center', vertical='center'); c.border = borde
        if i == j: c.fill = fill('D9D9D9'); c.font = fnt(size=10, color='808080')
ec.conditional_formatting.add(f'{L(C0 + 1)}{R0 + 1}:{L(C0 + M)}{R0 + M}', FormulaRule(formula=[f'ROW()-{R0}=COLUMN()-{C0}'], fill=fill('D9D9D9'), stopIfTrue=True))
ec.conditional_formatting.add(f'{L(C0 + 1)}{R0 + 1}:{L(C0 + M)}{R0 + M}', ColorScaleRule(start_type='num', start_value=0, start_color='FFFFFF', end_type='num', end_value=4, end_color=VERDE))
ec.row_dimensions[R0].height = 62
ec.column_dimensions['A'].width = 2; ec.column_dimensions[L(C0)].width = 30
for k in range(M): ec.column_dimensions[L(C0 + 1 + k)].width = 12
ec.freeze_panes = ec.cell(R0 + 1, C0 + 1)

# ---------------- Python: orden y textos (con los pesos actuales) ----------------
def peso(sid): return PESO[cidx[sid]['dimension']]
def prox(a, b):
    A = set(a['requeridas']); return sum(peso(r) for r in b['requeridas'] if r in A) / sum(peso(r) for r in b['requeridas'])
nombre = lambda sid: cidx[sid].get('nombre_corto', cidx[sid]['nombre'])
def nivel(v): return 'Cercana' if v >= 0.40 else 'Media' if v >= 0.20 else 'Lejana'

# ---------------- Rutas por oficio ----------------
ru = wb.create_sheet('Rutas por oficio')
titulo(ru, 'De cada oficio a las demás ocupaciones: de la más cercana a la más lejana', 'El orden se calculó con los pesos actuales; el % y el nivel se recalculan si cambian los Supuestos. «Comparten» y «Le falta» salen de la Matriz de habilidades.')
hr = ['Oficio de hoy', 'Puesto', 'Podría pasar a', 'Proximidad', 'Nivel', 'Habilidades en común', 'Lo que comparten (similitudes)', 'Lo que le falta', 'Demanda del destino en Lima']
for j, h in enumerate(hr, start=1): cab(ru.cell(4, j, h))
ru.row_dimensions[4].height = 34
demanda_lima = next((r['demanda'] for r in reg if r['id'] == 'lima-metropolitana'), {})
r = 5
for a in ocup:
    destinos = sorted([b for b in ocup if b is not a], key=lambda b: (-prox(a, b), b['nombre']))
    for pos, b in enumerate(destinos, start=1):
        com = [nombre(s) for s in b['requeridas'] if s in a['requeridas']]
        fal = [f"{nombre(s)} ({ETQ[cidx[s]['dimension']].split(' ')[0].lower()})" for s in b['requeridas'] if s not in a['requeridas']]
        etiqueta = 'Más cercana' if pos <= 3 else ('Más lejana' if pos > len(destinos) - 3 else '')
        fila = [a['nombre'], f'{pos} {etiqueta}'.strip(), b['nombre'], None, None, None, ', '.join(com) or '—', ', '.join(fal), demanda_lima.get(b['id'], '')]
        for j, v in enumerate(fila, start=1):
            c = ru.cell(r, j, v); c.font = fnt(size=10); c.border = borde; c.alignment = Alignment(vertical='top', wrap_text=j in (7, 8))
        ru.cell(r, 4, f'=INDEX({PX_AREA},MATCH(A{r},{PX_FILAS},0),MATCH(C{r},{PX_COLS},0))').number_format = '0%'
        ru.cell(r, 5, f'=IF(D{r}>={U_CERCANA},"Cercana",IF(D{r}>={U_MEDIA},"Media","Lejana"))')
        ru.cell(r, 6, f"=INDEX('En común'!${L(C0 + 1)}${R0 + 1}:${L(C0 + M)}${R0 + M},MATCH(A{r},'En común'!${L(C0)}${R0 + 1}:${L(C0)}${R0 + M},0),MATCH(C{r},'En común'!${L(C0 + 1)}${R0}:${L(C0 + M)}${R0},0))")
        for j in (4, 5, 6):
            ru.cell(r, j).font = fnt(size=10, bold=(j == 4)); ru.cell(r, j).border = borde; ru.cell(r, j).alignment = Alignment(horizontal='center', vertical='top')
        if pos == 1:
            for j in range(1, len(hr) + 1): ru.cell(r, j).border = Border(left=fino, right=fino, bottom=fino, top=Side(style='medium', color=NEGRO))
        r += 1
ULT_RU = r - 1
ru.conditional_formatting.add(f'E5:E{ULT_RU}', CellIsRule(operator='equal', formula=['"Cercana"'], fill=fill('CDEBDF')))
ru.conditional_formatting.add(f'E5:E{ULT_RU}', CellIsRule(operator='equal', formula=['"Media"'], fill=fill('FDE9B9')))
ru.conditional_formatting.add(f'E5:E{ULT_RU}', CellIsRule(operator='equal', formula=['"Lejana"'], fill=fill('F2F2F2')))
ru.conditional_formatting.add(f'D5:D{ULT_RU}', ColorScaleRule(start_type='num', start_value=0, start_color='FFFFFF', mid_type='num', mid_value=0.3, mid_color='FDE9B9', end_type='num', end_value=0.6, end_color=VERDE))
for col, w in zip('ABCDEFGHI', [26, 16, 28, 12, 11, 12, 48, 56, 14]): ru.column_dimensions[col].width = w
ru.freeze_panes = 'D5'
ru.auto_filter.ref = f'A4:I{ULT_RU}'

# ---------------- Resumen ----------------
rs = wb.create_sheet('Resumen', 1)
titulo(rs, 'Resumen: las ocupaciones más próximas y más lejanas de cada oficio', 'Para leer de un vistazo. El detalle (qué comparten y qué les falta) está en «Rutas por oficio».')
hrs = ['Oficio de hoy', 'Más cercana 1', '%', 'Más cercana 2', '%', 'Más cercana 3', '%', 'Más lejana', '%', 'Lo que comparte con la más cercana']
for j, h in enumerate(hrs, start=1): cab(rs.cell(4, j, h))
rs.row_dimensions[4].height = 30
for i, a in enumerate(ocup):
    r = 5 + i
    destinos = sorted([b for b in ocup if b is not a], key=lambda b: (-prox(a, b), b['nombre']))
    elegidos = destinos[:3] + [destinos[-1]]
    rs.cell(r, 1, a['nombre']).font = fnt(bold=True, size=10)
    for k, b in enumerate(elegidos):
        cn, cp = 2 + 2 * k, 3 + 2 * k
        rs.cell(r, cn, b['nombre']).font = fnt(size=10)
        c = rs.cell(r, cp, f'=INDEX({PX_AREA},MATCH($A{r},{PX_FILAS},0),MATCH({L(cn)}{r},{PX_COLS},0))'); c.number_format = '0%'; c.font = fnt(size=10, bold=True); c.alignment = Alignment(horizontal='center')
    rs.cell(r, 10, ', '.join(nombre(s) for s in destinos[0]['requeridas'] if s in a['requeridas'])).font = fnt(size=10)
    for j in range(1, 11): rs.cell(r, j).border = borde; rs.cell(r, j).alignment = Alignment(vertical='center', wrap_text=True, horizontal=rs.cell(r, j).alignment.horizontal)
    rs.row_dimensions[r].height = 32
for col in ('C', 'E', 'G'):
    rs.conditional_formatting.add(f'{col}5:{col}{4 + M}', ColorScaleRule(start_type='num', start_value=0, start_color='FFFFFF', mid_type='num', mid_value=0.3, mid_color='FDE9B9', end_type='num', end_value=0.6, end_color=VERDE))
rs.conditional_formatting.add(f'I5:I{4 + M}', ColorScaleRule(start_type='num', start_value=0, start_color='F2F2F2', end_type='num', end_value=0.3, end_color='FDE9B9'))
for col, w in zip('ABCDEFGHIJ', [26, 24, 7, 24, 7, 24, 7, 24, 7, 52]): rs.column_dimensions[col].width = w
rs.freeze_panes = 'B5'
rs.cell(6 + M, 1, 'Cuando varias ocupaciones empatan en 0 % como «más lejana», se muestra la primera por orden alfabético: ninguna comparte habilidades típicas con el oficio de hoy.').font = fnt(size=9, italic=True, color='4A5A55')

# ---------------- Validación ----------------
va = wb.create_sheet('Validación')
titulo(va, 'Sustento técnico y mecanismos de validación', 'Cómo sabemos que dos ocupaciones se relacionan, y cómo lo vamos a comprobar.')
hv = ['#', 'Mecanismo', 'Qué comprueba', 'Estado']
for j, h in enumerate(hv, start=1): cab(va.cell(4, j, h))
mec = [
 ('Competencias compartidas (esta matriz)', 'Dos ocupaciones se relacionan por las habilidades que piden en común, con el perfil de 4 dimensiones del MTPE (conocimiento, habilidad, cualidad, logro).', 'Hecho'),
 ('Pesos por dimensión', 'Un logro pesa 3, una habilidad o un conocimiento 2 y una cualidad 1: lo más específico y demostrable pesa más que lo genérico. Se pueden cambiar en «Supuestos» para ver si el orden se mantiene (análisis de sensibilidad).', 'Hecho'),
 ('Mismo cálculo que la app', 'La proximidad de esta hoja usa la misma fórmula del motor de Chambea (calcularCobertura). Hay 15 pruebas automáticas que verifican el motor (ej.: Rosa, cajera → Vendedor/a de tienda; Marleny, limpieza → Conserje).', 'Hecho'),
 ('Contraste con avisos reales', 'Los «alias» de cada ocupación salen de cómo se publican los avisos (ej.: Vendedor/a de tienda = Asesor/a de ventas). Se revisa que los avisos de la ocupación destino pidan las habilidades que la matriz dice que comparten.', 'Parcial'),
 ('Estándares de competencia del MTPE', 'Reemplazar las 7 habilidades de ejemplo de cada ocupación por las unidades de competencia oficiales. La matriz se recalcula sola al cambiar los datos.', 'Pendiente'),
 ('Validación con expertos (asesores de Centros de Empleo)', 'Los asesores califican si cada transición propuesta es realista (tabla de abajo). Si una ruta cercana sale mal calificada, se revisan sus habilidades o pesos.', 'Pendiente'),
 ('Demanda real (EDO 2026)', 'Que la ocupación destino tenga demanda en la región. Hoy la demanda es de ejemplo.', 'Pendiente'),
 ('Transiciones observadas', 'Con datos de colocaciones (Empleos Perú / Centros de Empleo), comprobar que las personas sí pasan entre las ocupaciones que la matriz marca como cercanas.', 'Futuro'),
]
for i, (m, q, e) in enumerate(mec, start=1):
    r = 4 + i
    for j, v in enumerate([i, m, q, e], start=1):
        c = va.cell(r, j, v); c.font = fnt(size=10, bold=(j == 2)); c.border = borde; c.alignment = Alignment(vertical='top', wrap_text=True)
    va.row_dimensions[r].height = 48
va.conditional_formatting.add('D5:D12', CellIsRule(operator='equal', formula=['"Hecho"'], fill=fill('CDEBDF')))
va.conditional_formatting.add('D5:D12', CellIsRule(operator='equal', formula=['"Parcial"'], fill=fill('FDE9B9')))
va.conditional_formatting.add('D5:D12', CellIsRule(operator='equal', formula=['"Pendiente"'], fill=fill('F2F2F2')))
# Plantilla para expertos
t0 = 15
va.cell(t0, 1, 'Plantilla de validación con asesores').font = fnt(bold=True, size=13)
va.cell(t0 + 1, 1, 'Para llenar: celdas amarillas. Calificación de 1 (nada realista) a 5 (muy realista; es común que la gente pase así). Ejemplo de respuesta: 4 — «Sí, muchas cajeras pasan a ventas en la misma tienda».').font = fnt(size=10, italic=True, color='4A5A55')
hp = ['Oficio de hoy', 'Podría pasar a', 'Proximidad', '¿Es realista? (1–5)', 'Comentario del asesor', 'Nombre del asesor y Centro de Empleo']
for j, h in enumerate(hp, start=1): cab(va.cell(t0 + 2, j, h))
r = t0 + 3
for a in ocup:
    destinos = sorted([b for b in ocup if b is not a], key=lambda b: (-prox(a, b), b['nombre']))
    for b in destinos[:2]:
        va.cell(r, 1, a['nombre']); va.cell(r, 2, b['nombre'])
        va.cell(r, 3, f'=INDEX({PX_AREA},MATCH(A{r},{PX_FILAS},0),MATCH(B{r},{PX_COLS},0))').number_format = '0%'
        for j in range(1, 7):
            c = va.cell(r, j); c.border = borde; c.font = fnt(size=10)
            if j >= 4: c.fill = fill('FFFF00')
        r += 1
fin = r - 1
va.cell(r + 1, 1, 'Promedio de las calificaciones').font = fnt(bold=True)
va.cell(r + 1, 4, f'=IFERROR(AVERAGE(D{t0 + 3}:D{fin}),"Sin datos aún")').font = fnt(bold=True)
for col, w in zip('ABCDEF', [26, 34, 70, 18, 44, 34]): va.column_dimensions[col].width = w

# ---------------- Léeme ----------------
le = wb.create_sheet('Léeme', 0)
titulo(le, 'Chambea · Matriz de transiciones entre ocupaciones', 'Innovathon Ulima x Tether 2026 · Reto del MTPE · Datos ilustrativos para el prototipo')
pares = sorted([(prox(a, b), a['nombre'], b['nombre']) for a in ocup for b in ocup if a is not b], reverse=True)
texto = [
 ('¿Para qué sirve?', 'No existe una base oficial de transiciones entre ocupaciones: identificarlas es parte del reto. Esta matriz las construye a partir de las competencias que comparten las ocupaciones, con sustento técnico y mecanismos de validación.'),
 ('Idea central', 'Si soy cajera, ya desarrollé habilidades como cobrar sin errores, manejar medios de pago, atender al cliente y tener paciencia. Esas mismas habilidades las pide un vendedor de tienda. Por eso «Vendedor/a de tienda» está cerca de «Cajero/a», y «Auxiliar de almacén» está lejos.'),
 ('Cómo se calcula', 'Proximidad(A → B) = suma de pesos de las habilidades de B que A ya tiene ÷ suma de pesos de todas las habilidades de B. Pesos: logro 3 · habilidad 2 · conocimiento 2 · cualidad 1 (hoja «Supuestos»). Es la misma fórmula que usa la app.'),
 ('Pares más cercanos (con los pesos actuales)', ' · '.join(f'{x} → {y}: {v:.0%}' for v, x, y in pares[:6])),
 ('Cómo leer las hojas', '«Resumen»: las 3 más cercanas y la más lejana de cada oficio. «Proximidad»: matriz 13 × 13 con colores. «Rutas por oficio»: de la más cercana a la más lejana, con lo que comparten y lo que les falta. «Matriz habilidades»: qué habilidades pide cada ocupación. «En común»: cuántas habilidades comparten. «Validación»: sustento técnico y plantilla para asesores. «Supuestos»: pesos y cortes que se pueden cambiar.'),
 ('Ojo: matriz vs. app', 'La matriz compara el perfil típico de una ocupación con otra (7 habilidades cada una). En la app se compara el panal real de la persona, que suele tener más habilidades; por eso allí la cobertura suele ser mayor (ej.: Rosa tiene 6 de 7 para Vendedor/a de tienda).'),
 ('Datos', f'{M} ocupaciones de nivel operativo (5 priorizadas por el MTPE + 8 para ampliar rutas) y {N} habilidades usadas, de un catálogo de {len(comp)}. Todos son ilustrativos: se reemplazarán por los estándares de competencia del MTPE y la EDO 2026 sin cambiar el cálculo.'),
 ('Colores', 'Celdas con texto azul = datos o supuestos que se pueden cambiar. Celdas amarillas (hoja Validación) = para que las llenen los asesores. Matrices: blanco = lejanas, amarillo = medias, verde = cercanas.'),
]
for i, (k, v) in enumerate(texto):
    r = 4 + i
    le.cell(r, 1, k).font = fnt(bold=True, size=11, color=VO); le.cell(r, 1).alignment = Alignment(vertical='top', wrap_text=True)
    le.cell(r, 2, v).font = fnt(size=11); le.cell(r, 2).alignment = Alignment(vertical='top', wrap_text=True)
    le.row_dimensions[r].height = 62
le.column_dimensions['A'].width = 30; le.column_dimensions['B'].width = 120

wb.save(SALIDA)
print('ok', N, M, ULT_RU)
