# Prompts iniciales — Ejercicio AI4Devs Frontend (vista "position")

Repositorio base: https://github.com/LIDR-academy/AI4Devs-frontend-202602
Rama de entrega: `frontend-iniciales`
Asistente usado: Claude Code (modelo `claude-opus-4-7`).

---

## Contexto entregado al asistente

Se le proporcionó al asistente:

1. El enunciado del ejercicio en español (objetivo: construir la vista de detalle de una `position` con interfaz kanban y drag-and-drop entre fases).
2. Los dos screenshots de referencia (listado de posiciones y vista kanban de candidatos con tarjetas y puntuación representada con puntos verdes).
3. La especificación de los tres endpoints del backend:
   - `GET /positions/:id/interviewFlow`
   - `GET /positions/:id/candidates`
   - `PUT /candidates/:id/stage`
4. El repositorio ya clonado en `frontend/` con el listado de posiciones existente (`src/components/Positions.tsx`) y los servicios actuales (`src/services/candidateService.js`).

---

## Prompt 1 — Inicialización y análisis

> "aqui hemos hecho un clon de `https://github.com/LIDR-academy/AI4Devs-frontend-202602` - inicialize y implemente las instrucciones abajo, pero antes hay 2 screenshots que voy poner en enlace abajo y estan referenciados en el ejercicio …"
>
> (seguido del enunciado completo del ejercicio y los enlaces a los dos screenshots)

Resultado esperado:

- Inspeccionar el código existente para entender la estructura (`App.js`, `Positions.tsx`, `services/`).
- Identificar dependencias presentes (`react-router-dom`, `react-bootstrap`, `react-bootstrap-icons`) y faltantes (librería de drag-and-drop, `axios`).
- Mirar los screenshots para definir el aspecto visual (cabecera con flecha + título, columnas con fondo gris claro, tarjetas blancas, puntuación como puntos verdes).
- Crear una rama `frontend-iniciales` para el entregable.

---

## Prompt 2 — Diseño técnico

Decisiones tomadas tras analizar el contexto:

- **Drag-and-drop**: usar `@hello-pangea/dnd` (fork mantenido de `react-beautiful-dnd`, compatible con React 18). Se descartó `react-beautiful-dnd` por estar deprecated en React 18 con StrictMode.
- **Llamadas API**: módulo nuevo `src/services/positionService.js` (mismo estilo que `candidateService.js`, basado en `axios` apuntando a `http://localhost:3010`).
- **Componente**: `src/components/PositionDetail.tsx` en TypeScript (alineado con `Positions.tsx`).
- **Ruta**: `/positions/:id` añadida en `App.js`.
- **Botón "Ver proceso"**: conectado al detalle mediante `useNavigate` desde `Positions.tsx` (los `mockPositions` recibieron un `id` numérico).
- **Responsive**: en `<md` las columnas pasan a 100% de ancho apiladas verticalmente; en `≥md` quedan en horizontal con scroll si el contenido excede el viewport.
- **Puntuación**: 5 puntos representados como círculos; los `averageScore` primeros se rellenan en verde (`#22c55e`) y el resto en gris claro, replicando el screenshot.
- **Optimistic update**: al soltar una tarjeta, se mueve inmediatamente en el estado y se llama al `PUT /candidates/:id/stage`; si falla, se revierte el estado y se muestra una alerta.

---

## Prompt 3 — Implementación

Pasos ejecutados por el asistente:

1. `npm install @hello-pangea/dnd axios` dentro de `frontend/`.
2. Crear `frontend/src/services/positionService.js` con `getInterviewFlow`, `getCandidatesByPosition`, `updateCandidateStage`.
3. Crear `frontend/src/components/PositionDetail.tsx`:
   - Carga paralela de `interviewFlow` y `candidates` con `Promise.all`.
   - Ordena las fases por `orderIndex` y agrupa los candidatos por `currentInterviewStep`.
   - `DragDropContext` + un `Droppable` por fase + un `Draggable` por candidato.
   - Cabecera con `<ArrowLeft />` (de `react-bootstrap-icons`) navegando a `/positions`.
   - `ScoreDots` para la puntuación visual.
   - Estilos responsive inline para el comportamiento móvil/desktop.
4. Actualizar `frontend/src/App.js` para registrar la nueva ruta `/positions/:id`.
5. Actualizar `frontend/src/components/Positions.tsx`:
   - Añadir `id` al tipo `Position` y a los `mockPositions`.
   - `onClick` en "Ver proceso" → `navigate(`/positions/${position.id}`)`.
6. Validar con `tsc --noEmit` (sin errores de tipos).

---

## Prompt 4 — Entrega

Pasos finales:

- Crear `prompts/prompts-iniciales.md` (este archivo).
- Commit en la rama `frontend-iniciales`.
- `git push -u origin frontend-iniciales` (manual por el usuario).
- Abrir Pull Request en GitHub apuntando a `main`.

---

## Endpoints consumidos

| Método | Ruta | Uso |
|--------|------|-----|
| GET    | `/positions/:id/interviewFlow` | Título de la posición y fases del proceso |
| GET    | `/positions/:id/candidates`    | Candidatos con `fullName`, `currentInterviewStep`, `averageScore` |
| PUT    | `/candidates/:id/stage`        | Actualizar la fase tras soltar la tarjeta (`{ applicationId, currentInterviewStep }`) |

---

## Cumplimiento de los requisitos del enunciado

- [x] Título de la posición en la parte superior.
- [x] Flecha a la izquierda del título para volver al listado (`/positions`).
- [x] Una columna por cada fase del proceso (ordenadas por `orderIndex`).
- [x] Tarjeta por candidato con nombre completo y puntuación media (puntos verdes).
- [x] Drag-and-drop entre columnas, persistido vía `PUT /candidates/:id/stage`.
- [x] Layout responsive: columnas en vertical ocupando todo el ancho en móvil.
