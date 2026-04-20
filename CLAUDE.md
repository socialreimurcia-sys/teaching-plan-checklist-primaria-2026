# Teaching Plan Checklist Primaria 2026

## Proyecto
App web para alumnos del curso de oposiciones de Inglés Primaria 2026 (Fustersaura). Permite revisar y generar programaciones didácticas mediante IA.

**URL desplegada:** `teaching-plan-checklist-primaria-2026.netlify.app`
**Repo GitHub:** `github.com/socialreimurcia-sys/teaching-plan-checklist-primaria-2026`
**Email admin:** `socialreimurcia@gmail.com`

---

## Stack
- **Frontend:** HTML estático single-file (`fustersaura_primary_checklist.html`) — ~4400 líneas, JS/CSS inline
- **Logo:** `logo fustersaura sin fondo.png` (referenciado como `./logo fustersaura sin fondo.png`)
- **Deploy:** Netlify (sitio estático, deploy automático desde GitHub)
- **API IA:** Anthropic Claude via proxy Netlify Function (`netlify/functions/anthropic-proxy.js`)
- **Auth + DB:** Supabase (Auth + PostgreSQL con RLS)
- **CDN libs:** Supabase JS v2 UMD, jsPDF 2.5.1, html2canvas 1.4.1, pdf.js 3.11.174, mammoth.js 1.6.0

## MCPs disponibles
- **GitHub MCP:** org `socialreimurcia-sys`
- **Netlify MCP:** deploy automático configurado
- **Supabase MCP:** base de datos del proyecto

---

## Estética FUSTERSAURA
- Granate: `#8B0000`
- Navy: `#1B2A4A`
- Gold: `#C8A951`
- Fuentes: DM Serif Display (títulos) + DM Sans (cuerpo)

---

## Estructura de la app

### Tabs
| Tab | Nombre | Función |
|-----|--------|---------|
| 1 | Checklist & Report | Checklist interactivo de secciones, progreso, descarga PDF/HTML |
| 2 | AI Quality Review | Análisis IA multi-sección con feedback HTML enriquecido |
| 3 | Draft Generator | Wizard 3 pasos para generar programación con IA |
| 4 | Admin (oculto) | Solo visible para admin; dashboard de alumnos y tokens |

`switchTab(n)` gestiona los tabs; llama `initDraftTab()` para n=3, `loadAdminDashboard()` para n=4.
Tab 4 solo se muestra si el usuario autenticado es el admin email.

### Autenticación
- Supabase Auth (email + password)
- Password por defecto alumnos: `Fustersaura2026`
- Admin email: `socialreimurcia@gmail.com` (también `esteban@cursosfustersaura.es`, `mluisa@cursosfustersaura.es`, `carmen@cursosfustersaura.es`)
- `showApp()` muestra `tab-btn-4` para admin; logout lo oculta

---

## Secciones del checklist (`DRAFT_SECTIONS` / `SECTION_NAMES`)
20 secciones: cover, introduction, justification, setting, diversity, key_comp, spc, stage_obj, unit_seq, methodology, assessment_learning, assessment_pupils, communication, transversal, attention_diversity, digital, bibliography, annexes, formatting, presentation

**Auto-generadas** (no requieren contexto manual): `key_comp`, `spc`, `assessment_criteria`, `basic_knowledge`, `transversal`
**Recomendadas** para Draft: `justification`, `setting`, `diversity`, `stage_obj`, `methodology`, `assessment_learning`, `communication`, `bibliography`

---

## Leyes de referencia (`LAWS_DATA`)
| ID | Nombre | Essential |
|----|--------|-----------|
| lomloe | LOMLOE (Ley Orgánica 3/2020) | ✓ |
| rd157 | RD 157/2022 (currículo EP) | ✓ |
| d209 | Decreto 209/2022 (Murcia EP) | ✓ |
| d359 | Decreto 359/2009 (atención diversidad) | ✓ |
| res2023 | Res. 20 Nov 2023 (evaluación) | ✓ |
| cefr | MCER/CEFR | ✓ |
| rd243 | RD 243/2022 (secundaria, opcional) | ✗ |
| res2025 | Res. 24 Jul 2025 (opcional) | ✗ |

---

## Componentes JS clave

### userContext (Step 2 Draft)
```javascript
const userContext = {
  yearGroup, studentName, schoolLocation, classSize,
  girlsCount, boysCount, sessionCount, engLevel,
  interests, hasAssistant, assistantNationality, assistantSessions
};
function ucv(key, fallback = '[not specified]') { ... }
function syncUserContext() { /* reads form → calls updateContextBanner() */ }
```

### localStorage (Step 2 Draft)
```javascript
function getDraftSaveKey() { return `fuster_draft_step2_${currentUser?.email || 'guest'}`; }
function scheduleSave()     { /* debounce 600ms, guarda todos los campos */ }
function flashSaved()       { /* muestra #dc-saved-indicator brevemente */ }
function restoreStep2Answers() { /* restaura todos los valores */ }
```

### qCard — constructor universal de tarjetas de pregunta
```javascript
function qCard({ id, label, tip, structured, placeholder, autofillKey, optional, rows, required })
// Genera HTML con: label + ⓘ tooltip, inputs estructurados, textarea, botón autofill
```

### doAutofill
```javascript
function doAutofill(inputId, key)
// Llama a AUTOFILL_TEXTS[key]() y rellena el textarea, pidiendo confirmación si ya tiene texto
```
**Claves AUTOFILL_TEXTS:** `setting-location`, `setting-school`, `addr-level`, `addr-interests`, `div-general`, `meth-assistant`, `seq-intro`, `comm-edvoice`, `biblio-standard`, `laws-paragraph`

### Draft generation (Tab 3)
```javascript
async function draftGenerate()
// Genera una sección a la vez (evita timeout 504)
// Llama callDraftAPI([sectionId], contextData) por cada sección activa

async function callDraftAPI(sectionIds, contextData)
// POST a /.netlify/functions/anthropic-proxy
// max_tokens: 2000, mode: 'draft' en body
```

### Markdown → HTML
```javascript
function markdownToHtml(md)  // convierte respuestas IA a HTML enriquecido
function processInline(text) // procesa negrita, cursiva, código inline
```

---

## Netlify Function: `netlify/functions/anthropic-proxy.js`
- Proxy seguro para Anthropic API (la API key nunca va al cliente)
- Soporta header `x-student-id` y `x-section` para tracking de tokens en Supabase
- Soporta `mode: 'draft'` en el body (fuerza `max_tokens = 4000`, elimina el campo antes de enviar a Anthropic)
- Variables de entorno necesarias: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

## Netlify Function: `.netlify/functions/create-students.js`
- Crea todos los alumnos en Supabase Auth + tabla `students`
- Requiere header `Authorization: Bearer <ADMIN_SECRET_TOKEN>`
- Variable de entorno: `ADMIN_SECRET_TOKEN`

## netlify.toml
```toml
[build]
  functions = "netlify/functions"
  command = "npm install"

[functions."*"]
  timeout = 26        # importante: sintaxis con "* " no [functions]

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

---

## Supabase
- Tabla `students`: `id` (UUID = auth.users.id), `name`, `surname`, `email`, `tokens_used`
- Tabla `token_logs`: `student_id`, `tokens_used`, `section`, `created_at`
- RPC `increment_tokens(student_id, amount)`: incrementa tokens_used en tabla students

---

## Variables de entorno (Netlify dashboard)
| Variable | Descripción |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Clave API de Anthropic |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | Service role key de Supabase |
| `ADMIN_SECRET_TOKEN` | Token para endpoint create-students |

---

## Reglas críticas de desarrollo

### Sintaxis JS
- **NUNCA** usar apóstrofes literales (`'`) dentro de strings con comillas simples
- Usar `\u2019` para apóstrofo curvo, o cambiar a template literals / comillas dobles
- **Siempre** validar después de cambios grandes:
  ```bash
  python3 -c "
  with open('fustersaura_primary_checklist.html') as f:
      lines = f.readlines()
  js = ''.join(lines[1849:4390])
  open('/tmp/appscript.js','w').write(js)
  " && node --check /tmp/appscript.js
  ```
  (El script principal está entre las líneas 1850–4390)

### Timeouts Netlify
- Máximo 26s por función (configurado en netlify.toml)
- Draft generation: **una sección por llamada API** — nunca batch múltiples secciones
- `max_tokens: 2000` por sección en draft mode

### Seguridad
- La API key de Anthropic NUNCA en ficheros del repo
- Siempre usar el proxy Netlify Function

---

## Historial de features implementadas
- [x] Checklist interactivo con progreso y descarga PDF/HTML (Tab 1)
- [x] AI Quality Review multi-sección con feedback HTML (Tab 2)
- [x] Select/Deselect all por sección y global (Tab 2)
- [x] Draft Generator wizard 3 pasos (Tab 3)
- [x] Fix 504 timeout: una sección a la vez
- [x] Step 2: userContext, qCard, autofill, laws checklist, localStorage
- [x] Admin dashboard oculto (Tab 4)
- [x] Proxy Netlify Function con token tracking Supabase
- [x] Fix sintaxis: apóstrofe en string → \u2019

## 15. Reference Documents

### `Marking_Primary_VersionB_Prose_Year5.md`
Official FUSTERSAURA marking model for Primary Year 5. Source of truth for:
- AC weights (per-AC percentages for Third Cycle / Year 5)
- Full instrument list with abbreviations (formative + summative)
- Grade calculation formula: `Final = [(T1×1)+(T2×2)+(T3×3)]/6`
- Grade conversion scale (INS/SU/BI/NOT/SOB)
- AC descriptions for all 15 ACs in Third Cycle (SPC1–SPC6)

When generating the `assessment_learning` section draft, read this file for the exact AC labels, weights, and instrument references. Do not invent or paraphrase them.

---

## Tareas pendientes
*(ninguna pendiente explícita — esperar nuevas peticiones del usuario)*
