# AI Workflow Generator

AI Workflow Generator is a production-oriented SaaS-style application that converts natural language prompts into structured diagrams:

- Workflow
- Flowchart
- Blueprint

This repository currently contains a fully implemented premium frontend (glassmorphism + motion-first UX) and a backend scaffold for API integration.

## Academic Project Details

- University: Dayananda Sagar University
- Project Type: Minor Project
- Team: Team No. 100
- Faculty Guide: Prof. Shubhra Jyoti Paul

## Current Project Status

- Frontend: Implemented and deployed-ready
- Backend: Scaffolded (files and folders present, business logic/API implementation pending)
- Integration behavior: Frontend is backend-first and will fetch live diagram data once backend API is connected

## Product Flow

1. Landing page (premium SaaS surface, animated glass UI)
2. Click `Get Started`
3. Diagram Generator tool loads with smooth in-app transition (no hard reload)

## Frontend Features Implemented

- Motion-first landing + generator transition using Framer Motion
- Glassmorphism design system with layered depth, animated background, and soft hover/focus states
- Diagram mode tabs: Workflow / Flowchart / Blueprint
- Prompt input with auto-resize, validation, and loading interaction
- Canvas board with:
  - smooth pan and zoom
  - inertia-style viewport smoothing
  - animated edge drawing
  - animated node entry
- Export menu:
  - PNG export
  - SVG export
  - JSON export
- Toast-based error handling and validation feedback

## Tech Stack

### Frontend

- React (Vite)
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Zustand
- Canvas/SVG rendering (without React Flow)

### Backend (planned implementation)

- Python service scaffold is present under `backend/`
- API + LLM + validation + RAG folders are already structured for future implementation

## Repository Structure

```text
.
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── store/
│   │   ├── styles/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── api/
│   ├── app/
│   ├── llm/
│   ├── rag/
│   ├── schemas/
│   ├── services/
│   ├── tests/
│   └── validation/
└── README.md
```

## Run Frontend Locally

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (recommended)

### Commands

```bash
cd frontend
npm install
npm run dev
```

Vite dev server starts on the local URL shown in terminal (usually `http://localhost:5173`).

### Build for production

```bash
cd frontend
npm run build
npm run preview
```

## Backend Integration (Important)

Frontend intentionally does not generate local fake diagrams when backend is missing.
It expects a real API endpoint via environment variable.

Create `frontend/.env`:

```env
VITE_DIAGRAM_API_URL=http://localhost:8000/api/diagram/generate
VITE_DIAGRAM_API_TIMEOUT_MS=25000
```

Then restart Vite:

```bash
cd frontend
npm run dev
```

If `VITE_DIAGRAM_API_URL` is missing, UI shows a clear runtime error toast:

`Backend not connected. Set VITE_DIAGRAM_API_URL in frontend/.env and restart the app.`

## API Contract for Backend Team

### Request (POST)

```json
{
  "prompt": "Design an approval workflow for invoice processing",
  "kind": "workflow"
}
```

### Expected Response (minimum shape)

```json
{
  "nodes": [
    { "id": "n1", "type": "start", "label": "Start", "x": 0, "y": 0 },
    { "id": "n2", "type": "process", "label": "Review Invoice", "x": 0, "y": 150 },
    { "id": "n3", "type": "end", "label": "Approved", "x": 0, "y": 300 }
  ],
  "edges": [
    { "id": "e1", "from": "n1", "to": "n2" },
    { "id": "e2", "from": "n2", "to": "n3" }
  ]
}
```

Notes:

- Frontend parser is tolerant to alternate keys (`vertices`, `links`, `data`, etc.) but `nodes + edges` is preferred.
- If backend skips coordinates, frontend auto-layout engine computes positions.
- Supported node types include `start`, `process`, `decision`, `end`, and blueprint variants.

## Suggested Next Backend Milestones

1. Implement generation route in `backend/api/workflow_routes.py`
2. Wire route in `backend/app/main.py`
3. Implement LLM prompt-to-diagram transformation in `backend/llm/`
4. Add schema + logical validation in `backend/validation/`
5. Add API tests in `backend/tests/`

## License

Currently repository has an empty `LICENSE` file. Add your preferred license text before public distribution.
