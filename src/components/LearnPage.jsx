import React, { useState } from 'react';
import { Play, ArrowLeft, Zap, Cpu, Waves, Hexagon, Shuffle } from 'lucide-react';
import { AutomataEngine } from '../engine/AutomataEngine';

/* ─── Mini grid diagram ─── */
const MiniGrid = ({ matrix }) => (
    <div className="mini-grid">
        {matrix.map((row, r) => (
            <div key={r} className="mini-grid-row">
                {row.map((val, c) => (
                    <div key={c} className={`mini-grid-cell ${val === 2 ? 'center' : val === 1 ? 'alive' : ''}`} />
                ))}
            </div>
        ))}
    </div>
);

/* ─── Pattern preview diagram ─── */
const PatternDiagram = ({ patternString }) => {
    const rows = patternString.split('\n');
    return (
        <div className="pattern-diagram">
            {rows.map((row, r) => (
                <div key={r} className="pattern-row">
                    {row.split('').map((char, c) => (
                        <div key={c} className={`pattern-cell ${char === 'O' ? 'alive' : ''}`} />
                    ))}
                </div>
            ))}
        </div>
    );
};

/* ─── Mode badge colors ─── */
const MODE_META = {
    BINARY:      { label: 'Binary',      color: '#6366f1', bg: 'rgba(99,102,241,0.1)',     icon: <Cpu size={12} /> },
    MULTI_STATE: { label: 'Multi-State', color: '#ec4899', bg: 'rgba(236,72,153,0.1)',      icon: <Zap size={12} /> },
    CONTINUOUS:  { label: 'Continuous',  color: '#10b981', bg: 'rgba(16,185,129,0.1)',      icon: <Waves size={12} /> },
    HEXAGONAL:   { label: 'Hexagonal',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',      icon: <Hexagon size={12} /> },
    STOCHASTIC:  { label: 'Stochastic',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',       icon: <Shuffle size={12} /> },
};

/* ─── Rule cards data ─── */
const RULE_DATA = [
    {
        key: 'CONWAY',
        name: "Conway's Life",
        pattern: '.O.\n..O\nOOO',
        patternLabel: 'Glider',
        details: 'The foundational cellular automaton invented by John Conway in 1970. Simple rules give rise to gliders, oscillators, spaceships, and patterns of startling complexity. It is provably Turing-complete.'
    },
    {
        key: 'MAZE',
        name: 'Maze',
        pattern: 'OOO',
        patternLabel: 'Seed',
        details: 'Cells survive with 1–5 neighbors (very easy) but are born only with exactly 3. Patterns crystallize outward into dense, branching labyrinthine structures that fill the entire grid.'
    },
    {
        key: 'BRIANS_BRAIN',
        name: "Brian's Brain",
        pattern: 'O.O\n...\nO.O',
        patternLabel: 'Neural seed',
        details: 'A 3-state system: Alive → Dying → Dead. Because a dying cell cannot immediately become alive again, signals can only travel forward. The result is endless crawling worms and neural pulse waves.'
    },
    {
        key: 'CYCLIC',
        name: 'Cyclic Spirals',
        pattern: 'OOO\nO.O\nOOO',
        patternLabel: 'Spirals',
        details: '16 distinct color states cycle through the grid. A cell advances only if a neighbor is already in the next state. From random noise, vast multi-armed spirals self-organize and rotate hypnotically.'
    },
    {
        key: 'SMOOTH_LIFE',
        name: 'Smooth Organic',
        pattern: 'OOO\nOOO\nOOO',
        patternLabel: 'Amoeba seed',
        details: 'Operates in the continuous floating-point domain (0.0–1.0). Cells have fractional vitality that bleeds and bleeds into neighbors. Blob-like organisms emerge, pulse, divide, and swim like microbes under glass.'
    },
    {
        key: 'HEX_LIFE',
        name: 'Hexagonal Life',
        pattern: '.OO\nO.O\n.OO',
        patternLabel: 'Snowflake',
        details: "Standard birth/survival rules evaluated on a staggered honeycomb (6 neighbors instead of 8). The grid's 6-fold symmetry forces growth into organic snowflake and coral-like crystal patterns."
    },
    {
        key: 'MOLD',
        name: 'Stochastic Mold',
        pattern: 'OO\nOO',
        patternLabel: 'Growth core',
        details: 'Pure probability replaces strict rules. Alive cells have a 5% random chance to die, and dead cells have a % chance to be born proportional to their neighbor count. The result is fuzzy, creeping growth that perfectly mimics lichen or mold on a petri dish.'
    },
];

/* ─── Interactive card ─── */
const RuleCard = ({ rd, onTryPattern }) => {
    const info = AutomataEngine.RULES[rd.key] || {};
    const mode = info.mode || 'BINARY';
    const meta = MODE_META[mode] || MODE_META.BINARY;

    return (
        <div className="learn-rule-card" style={{ '--card-accent': meta.color }}>
            <div className="lrc-header">
                <div className="lrc-title-row">
                    <h3 className="lrc-name">{rd.name}</h3>
                    <span className="lrc-mode-badge" style={{ color: meta.color, background: meta.bg }}>
                        {meta.icon}&nbsp;{meta.label}
                    </span>
                </div>
                <span className="rule-notation">{info.label}</span>
            </div>
            <p className="lrc-desc">{rd.details}</p>
            <div className="lrc-footer">
                <div className="lrc-pattern">
                    <PatternDiagram patternString={rd.pattern} />
                    <span className="lrc-pattern-label">{rd.patternLabel}</span>
                </div>
                <button className="try-btn" onClick={() => onTryPattern(rd.key, rd.pattern)}>
                    <Play size={13} /> Try it
                </button>
            </div>
        </div>
    );
};

/* ─── Main page ─── */
export const LearnPage = ({ onClose, onTryPattern }) => {
    return (
        <div className="learn-page">
            {/* Sticky top bar */}
            <div className="learn-topbar">
                <button className="topbar-btn" onClick={onClose} title="Back to Lab">
                    <ArrowLeft size={18} />
                </button>
                <h1>AUTOMETA</h1>
                <span className="logo-sub">LAB&nbsp;/&nbsp;DOCS</span>
            </div>

            <div className="learn-body">

                {/* ── Hero ── */}
                <section className="learn-hero">
                    <div className="learn-hero-tag">FIELD GUIDE</div>
                    <h2>How Cellular Automata Work</h2>
                    <p>Autometa Lab simulates mathematical universes where cells live and die by ruthless rules. Each generation, every cell on the grid surveys its neighbors and decides its fate — birth, survival, or death.</p>
                </section>

                {/* ── Steps ── */}
                <section className="learn-steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Every cell has 8 neighbors</h3>
                            <p>For most rules, each cell checks all 8 surrounding cells — up, down, left, right, and all four diagonals. These are counted to determine the next state.</p>
                            <div className="step-diagram">
                                <MiniGrid matrix={[[1,0,1],[0,2,1],[1,0,0]]} />
                                <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem', marginLeft:'1rem' }}>
                                    <span style={{ fontSize:'0.85rem' }}><strong>4 alive neighbors</strong></span>
                                    <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Red = cell being evaluated</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Survive, die, or be born</h3>
                            <p>In Conway's rules: a cell survives with <strong>2 or 3</strong> neighbors. A dead cell is born with exactly <strong>3</strong>. Any other count means death or stasis.</p>
                            <div className="step-diagram">
                                <div>
                                    <MiniGrid matrix={[[1,0,0],[0,1,0],[0,0,0]]} />
                                    <div className="step-caption">1 neighbor → Dies</div>
                                </div>
                                <div>
                                    <MiniGrid matrix={[[1,0,0],[0,1,1],[0,0,0]]} />
                                    <div className="step-caption">2 neighbors → Lives</div>
                                </div>
                                <div>
                                    <MiniGrid matrix={[[1,1,0],[1,0,0],[0,0,0]]} />
                                    <div className="step-caption">3 neighbors → Born!</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Beyond binary — multi-state &amp; continuous</h3>
                            <p>Advanced rules break the binary Alive/Dead model. Cells can hold <strong>16 distinct states</strong> (Cyclic Spirals), <strong>fractional values</strong> (Smooth Organic), or be governed by <strong>probability</strong> (Stochastic Mold) — producing radically different behaviors.</p>
                        </div>
                    </div>
                </section>

                {/* ── Mode Legend ── */}
                <section className="learn-mode-legend">
                    <h2 className="learn-heading">Rule Paradigms</h2>
                    <div className="mode-legend-grid">
                        {Object.entries(MODE_META).map(([key, m]) => (
                            <div key={key} className="mode-legend-item" style={{ borderColor: m.color + '44', background: m.bg }}>
                                <span className="mode-legend-icon" style={{ color: m.color }}>{m.icon}</span>
                                <div>
                                    <div className="mode-legend-name" style={{ color: m.color }}>{m.label}</div>
                                    <div className="mode-legend-desc">
                                        {key === 'BINARY'      && 'Classic 0/1 cells, Moore neighborhood, deterministic rules.'}
                                        {key === 'MULTI_STATE' && 'Cells cycle through N states; creates directional flow & spirals.'}
                                        {key === 'CONTINUOUS'  && 'Cells hold float values 0–1; produces fluid, organic blobs.'}
                                        {key === 'HEXAGONAL'   && '6-neighbor honeycomb grid; forces organic crystal symmetry.'}
                                        {key === 'STOCHASTIC'  && 'Probabilistic rules; randomness drives fuzzy, organic spread.'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Rule Cards ── */}
                <h2 className="learn-heading">All Rules</h2>
                <div className="learn-rules-grid">
                    {RULE_DATA.map(rd => <RuleCard key={rd.key} rd={rd} onTryPattern={onTryPattern} />)}
                </div>

                {/* ── Controls cheatsheet ── */}
                <section className="learn-controls">
                    <h2 className="learn-heading">Controls</h2>
                    <div className="controls-grid">
                        {[
                            ['Left click / drag', 'Draw cells'],
                            ['Right click / drag', 'Pan the canvas'],
                            ['Middle click / drag', 'Pan the canvas'],
                            ['Scroll wheel', 'Zoom in / out'],
                            ['▶ / ⏸', 'Play / Pause simulation'],
                            ['↺', 'Rewind one saved snapshot'],
                            ['⏭', 'Step forward one generation'],
                            ['✏ / 💨 / ✕', 'Pencil / Spray / Eraser brush'],
                            ['😊', 'Toggle Cute Mode'],
                            ['0.5× / 1× / 2× / 4×', 'Simulation speed'],
                        ].map(([key, val]) => (
                            <div key={key} className="control-row">
                                <span className="control-key">{key}</span>
                                <span className="control-val">{val}</span>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};
