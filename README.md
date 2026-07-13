# AUTOMETA

**The Ultimate Generative Cellular Automata Playground**

A sketchy, hand-drawn cellular automata sandbox built with [Rough.js](https://roughjs.com/) and Swiss-inspired design. Explore 12 rule variations, draw your own patterns, and watch life emerge from simple mathematics.

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Features](#features)
- [Rule Variations](#rule-variations)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Controls](#controls)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Overview

Autometa transforms Conway's Game of Life from a sterile simulation into a tactile, sketchy art experience. Every cell is rendered with `rough.js` hachure strokes, giving the grid a hand-drawn quality. The UI follows Swiss Modernist design principles — minimal, typographic, functional.

```
┌─────────────────────────────────────────────────────┐
│  AUTOMETA SKETCH    GEN: 1247  POP: 832  RULE: CONWAY  │
├───────────────────────────────────────────┬──────────┤
│                                           │  RULES   │
│           ╔══╗  ╔══╗                      │  ──────  │
│           ║██║  ║██║    ← rough.js        │  CONWAY  │
│           ╚══╝  ╚══╝      hachure         │  HIGHLIFE│
│      ╔══╗       ╔══╗                      │  SEEDS   │
│      ║██║       ║██║                      │  MAZE    │
│      ╚══╝       ╚══╝                      │  CORAL   │
│                                           │  ...     │
│    ┌─────────────────────────┐            │          │
│    │ ▶ ⏭ │ ✏ 🎨 ⌫ │ 🗑 🔀 ⊕ │            │          │
│    └─────────────────────────┘            │          │
└───────────────────────────────────────────┴──────────┘
              floating toolbar
```

---

## How It Works

Cellular automata follow four simple steps, repeated forever:

### Step 1 — Start with a Grid

Every cell is either **alive** (■) or **dead** (□). You begin with a random seed or draw your own pattern.

```
□ □ ■ □ □
□ ■ □ ■ □
■ □ □ □ ■
□ ■ □ ■ □
□ □ ■ □ □
```

### Step 2 — Count Neighbors

For each cell, count its 8 surrounding neighbors:

```
┌───┬───┬───┐
│ 0 │ 1 │ 0 │
├───┼───┼───┤
│ 1 │ ? │ 1 │   ← Center cell checks its ring
├───┼───┼───┤
│ 0 │ 1 │ 1 │
└───┴───┴───┘
        Count = 4 alive neighbors
```

### Step 3 — Apply Rules

Based on the count, each cell lives, dies, or is born:

| Condition | Neighbor Count | Result |
|-----------|---------------|--------|
| **Survival** | 2 or 3 (if alive) | Cell stays alive |
| **Birth** | Exactly 3 (if dead) | Cell is born |
| **Death** | Any other count | Cell dies |

```
BEFORE          AFTER (1 step)
□ ■ □           □ □ □
□ □ ■    →      ■ □ ■
■ ■ ■           □ ■ ■
```

### Step 4 — Repeat

Apply the rules to every cell simultaneously. The new grid replaces the old one. From these trivially simple rules, gliders, oscillators, spaceships, and chaotic structures emerge.

---

## Features

| Feature | Description |
|---------|-------------|
| **Rough.js Rendering** | Every cell is drawn with sketchy hachure strokes |
| **12 Rule Variations** | From Conway to Replicator to Diamoeba |
| **Interactive Drawing** | Pencil, Spray, and Eraser brush tools |
| **Floating Toolbar** | Play/Pause, Step, Clear, Randomize, Center |
| **Collapsible Panel** | Right-side rule selector with descriptions |
| **Learn Mode** | Full documentation with step-by-step diagrams |
| **Try It Buttons** | Jump from docs straight into a pattern demo |
| **Dot Grid Background** | Subtle graph-paper aesthetic |
| **Pan Navigation** | Right-click or middle-click drag to explore |
| **Population Tracking** | Live generation and population counters |
| **Responsive** | Works on desktop, tablet, and mobile |
| **Stable Rendering** | Seeded rough.js paths — no visual flickering |

---

## Rule Variations

Autometa ships with 12 distinct rule sets. Each rule is defined by its **Born/Survive** notation:

| Rule | Notation | Behavior |
|------|----------|----------|
| **Conway** | B3/S23 | The classic. Balanced chaos and order. |
| **HighLife** | B36/S23 | Spawns self-replicating patterns. |
| **Seeds** | B2/S | Nothing survives. Pure explosive growth. |
| **Day & Night** | B3678/S34678 | Symmetric blobs that melt and shift. |
| **Maze** | B3/S12345 | Grows organic maze-like structures. |
| **Anneal** | B4678/S35678 | Smooths noise into stable regions. |
| **Coral** | B3/S45678 | Slow, branching coral-like growth. |
| **Diamoeba** | B35678/S5678 | Large amoeba-like diamond shapes. |
| **Replicator** | B1357/S1357 | Every pattern eventually copies itself. |
| **2×2** | B36/S125 | Forms blocky 2×2 stable structures. |
| **Move** | B368/S245 | Many small oscillators and spaceships. |
| **Flock** | B3/S12 | Chaotic flocking, dies quickly. |

---

## Architecture

```
src/
├── main.jsx                  # React entry point
├── App.jsx                   # App shell: topbar, toolbar, panel routing
├── index.css                 # Full design system (Swiss + responsive)
├── engine/
│   └── AutomataEngine.js     # Simulation: Uint8Array ping-pong, 12 rules
└── components/
    ├── Canvas.jsx             # Rough.js renderer, pan/zoom, brush tools
    └── LearnPage.jsx          # Documentation with interactive diagrams
```

### Data Flow

```
┌──────────────┐    step()     ┌──────────────┐
│  Read Buffer │ ──────────▶  │ Write Buffer  │
│  Uint8Array  │              │  Uint8Array   │
└──────┬───────┘              └───────┬───────┘
       │                              │
       │         swap buffers         │
       ◀──────────────────────────────┘
       │
       ▼
┌──────────────┐
│  Rough.js    │  ← renders alive cells as hachure rectangles
│  Canvas 2D   │
└──────────────┘
```

### Key Design Decisions

- **CPU-based simulation** with `Uint8Array` ping-pong buffers for clean double-buffering
- **Set-based rule lookups** (`new Set()`) instead of `.includes()` for O(1) neighbor checks
- **Stable `seed` parameter** in rough.js options prevents visual flickering between frames
- **ResizeObserver** instead of `window.resize` for accurate canvas sizing inside CSS Grid
- **Toroidal wrapping** — cells wrap around edges, creating an infinite plane

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repository
git clone https://github.com/your-username/autometa.git
cd autometa

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Controls

| Action | Input |
|--------|-------|
| Draw cells | Left-click / drag |
| Erase cells | Select Eraser, then left-click |
| Spray cells | Select Spray, then left-click |
| Pan canvas | Right-click drag / Middle-click drag |
| Play / Pause | Toolbar ▶ button |
| Step once | Toolbar ⏭ button |
| Clear canvas | Toolbar 🗑 button |
| Randomize | Toolbar 🔀 button |
| Center view | Toolbar ⊕ button |
| Change rule | Right panel rule list |
| Learn mode | Top-right 📖 button |

---

## Tech Stack

- **[React 19](https://react.dev/)** — UI framework
- **[Vite](https://vite.dev/)** — Build tool and dev server
- **[Rough.js](https://roughjs.com/)** — Sketchy, hand-drawn rendering
- **[Lucide React](https://lucide.dev/)** — Icon system
- **Vanilla CSS** — Custom design system, no utility frameworks

---

## License

MIT
