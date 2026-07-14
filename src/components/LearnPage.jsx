import React from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { AutomataEngine } from '../engine/AutomataEngine';

/* ─── Tiny grid renderer ─── */
const PatternDiagram = ({ patternString }) => {
    const lines = patternString.trim().split('\n');
    return (
        <div className="pattern-diagram">
            {lines.map((line, y) => (
                <div key={y} className="pattern-row">
                    {line.split('').map((char, x) => (
                        <div key={`${x}-${y}`} className={`pattern-cell ${char === 'O' ? 'alive' : ''}`} />
                    ))}
                </div>
            ))}
        </div>
    );
};

/* ─── Neighbor diagram for step 2 ─── */
const NeighborDiagram = () => {
    const grid = [
        [false, true,  false],
        [true,  null,  true],
        [false, true,  true],
    ];
    return (
        <div>
            <div className="mini-grid">
                {grid.map((row, y) => (
                    <div key={y} className="mini-grid-row">
                        {row.map((cell, x) => (
                            <div key={x} className={`mini-grid-cell ${cell === null ? 'center' : cell ? 'alive' : ''}`}>
                                {cell === null ? '?' : cell ? '1' : '0'}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="step-caption">Count alive neighbors = 4</div>
        </div>
    );
};

/* ─── Before/After diagram for step 3 ─── */
const BeforeAfterDiagram = () => {
    const before = [
        [0,1,0],
        [0,0,1],
        [1,1,1],
    ];
    const after = [
        [0,0,0],
        [1,0,1],
        [0,1,1],
    ];
    return (
        <div className="step-diagram">
            <div>
                <div className="mini-grid">
                    {before.map((row, y) => (
                        <div key={y} className="mini-grid-row">
                            {row.map((cell, x) => (
                                <div key={x} className={`mini-grid-cell ${cell ? 'alive' : ''}`} />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="step-caption">Before</div>
            </div>
            <span className="step-arrow">→</span>
            <div>
                <div className="mini-grid">
                    {after.map((row, y) => (
                        <div key={y} className="mini-grid-row">
                            {row.map((cell, x) => (
                                <div key={x} className={`mini-grid-cell ${cell ? 'alive' : ''}`} />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="step-caption">After (1 step)</div>
            </div>
        </div>
    );
};

/* ─── Rule data with patterns ─── */
const RULE_DATA = [
    { key: "CONWAY",      name: "Conway's Game of Life", pattern: ".O.\n..O\nOOO",           patternLabel: "Glider", details: "Invented by John Conway in 1970, this is the most famous cellular automaton. It perfectly balances chaos and order, creating complex spaceships, oscillators, and stable forms. It is computationally Turing-complete." },
    { key: "HIGHLIFE",    name: "HighLife",              pattern: "...O\n..O.\n.O..\nO...",  patternLabel: "Replicator", details: "Similar to Conway's Game of Life, but with an extra birth condition at 6 neighbors. This seemingly minor tweak gives rise to spectacular self-replicating patterns." },
    { key: "SEEDS",       name: "Seeds",                 pattern: "OO\n..\n..\nOO",             patternLabel: "Explosive", details: "Cells never survive; they only burst into existence when surrounded by exactly 2 neighbors. Every pattern expands outward like an explosive shockwave, often growing infinitely." },
    { key: "DAY & NIGHT", name: "Day & Night",           pattern: "OOOOO\nO...O\nO...O\nO...O\nOOOOO", patternLabel: "Ring", details: "This rule is symmetric: if you invert all dead and alive cells, the universe evolves in exactly the same way. It is characterized by shifting, bubbling pools of 'day' and 'night'." },
    { key: "MAZE",        name: "Maze",                  pattern: "OOO",                       patternLabel: "Seed", details: "Cells survive very easily (1 to 5 neighbors) but are only born with exactly 3. This causes patterns to solidify into intricate, branching, crystalline mazes that expand until the grid is filled." },
    { key: "ANNEAL",      name: "Anneal",                pattern: "O.O.O\n.O.O.\nO.O.O",       patternLabel: "Noise", details: "Also known as the 'Majority' rule, this mimics the physical process of annealing or surface tension. A chaotic starting grid rapidly smooths out into stable pools and bubbles." },
    { key: "CORAL",       name: "Coral",                 pattern: ".O.\nOOO\n.O.",             patternLabel: "Cross", details: "Growth is extremely slow and happens only at the edges of the structure. It forms dense, jagged, fractal-like patterns resembling a growing coral reef." },
    { key: "DIAMOEBA",    name: "Diamoeba",              pattern: "OOOO\nO..O\nO..O\nOOOO",    patternLabel: "Hollow", details: "Creates large, shifting, amoeba-like blobs with solid diamond-shaped boundaries. The patterns fluctuate unpredictably but rarely die out completely." },
    { key: "REPLICATOR",  name: "Replicator",            pattern: "OOO\nO..\nO..",             patternLabel: "Corner", details: "An extraordinary automaton created by Edward Fredkin. Every single pattern, no matter how complex, will eventually create infinite copies of itself. It is a mathematical guarantee." },
    { key: "2x2",         name: "2×2",                   pattern: "OOO\nO..\nO..",             patternLabel: "Corner", details: "Patterns tend to form stable or oscillating blocks made of 2×2 squares. It is heavily biased towards rigid, grid-aligned structures and spaceships." },
    { key: "MOVE",        name: "Move",                  pattern: "O.O\nO..\nOOO",             patternLabel: "Spaceship", details: "A rule designed specifically to encourage movement. While it does not support large static structures, it is incredibly rich with tiny gliders, spaceships, and oscillating travelers." },
    { key: "FLOCK",       name: "Flock",                 pattern: ".OO\nO.O\nO..",             patternLabel: "Glider", details: "Mimics flocking behavior. Structures glide and crash into each other violently, usually destroying themselves quickly. It is highly volatile and rarely forms stable endpoints." },
];

export const LearnPage = ({ onClose, onTryPattern }) => {
    return (
        <div className="learn-page">
            {/* Sticky top bar */}
            <header className="learn-topbar">
                <button className="topbar-btn" onClick={onClose}>
                    <ArrowLeft size={18} />
                </button>
                <h1>AUTOMETA</h1>
                <span>DOCUMENTATION</span>
            </header>

            <div className="learn-body">
                {/* Hero */}
                <div className="learn-hero">
                    <h2>THE MATHEMATICS<br/>OF EMERGENCE</h2>
                    <p>
                        Cellular automata are among the simplest possible models of computation — yet they produce patterns of extraordinary complexity. A grid of cells. A set of rules. And from nothing, life emerges.
                    </p>
                </div>

                {/* Step-by-step explanation */}
                <h2 className="learn-heading">HOW IT WORKS</h2>
                <div className="learn-steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>START WITH A GRID</h3>
                            <p>
                                Every cell in the grid is either <strong>alive</strong> (filled) or <strong>dead</strong> (empty). You begin with a random or hand-drawn pattern.
                            </p>
                            <div className="step-diagram">
                                <PatternDiagram patternString={"..O..\n.O.O.\nO...O\n.O.O.\n..O.."} />
                            </div>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>COUNT THE 8 NEIGHBORS</h3>
                            <p>
                                For every cell, count its <strong>8 surrounding neighbors</strong> (top, bottom, left, right, and 4 diagonals). The center cell (marked <strong>?</strong>) looks at the ring around it to decide its fate.
                            </p>
                            <div className="step-diagram">
                                <NeighborDiagram />
                            </div>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>APPLY THE RULES</h3>
                            <p>
                                Based on the neighbor count, the cell lives, dies, or is born. In Conway's rules: a cell is <strong>born</strong> with exactly 3 neighbors, and <strong>survives</strong> with 2 or 3. All other cells die.
                            </p>
                            <BeforeAfterDiagram />
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h3>REPEAT FOREVER</h3>
                            <p>
                                Apply the rules to every cell simultaneously. The next generation replaces the current one. Simple rules, iterated infinitely, produce gliders, oscillators, spaceships, and chaos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* All rules */}
                <h2 className="learn-heading">RULE VARIATIONS ({RULE_DATA.length})</h2>
                <div className="learn-rules-grid">
                    {RULE_DATA.map(rd => {
                        const info = AutomataEngine.RULES[rd.key];
                        return (
                            <div key={rd.key} className="learn-rule-card">
                                <div>
                                    <h3>{rd.name}</h3>
                                    <span className="rule-notation">{info.label}</span>
                                </div>
                                <p style={{ color: 'var(--text)', fontWeight: 600 }}>{info.desc}</p>
                                <p style={{ fontSize: '0.85rem', lineHeight: '1.6', marginTop: '-0.25rem' }}>{rd.details}</p>
                                <div className="card-bottom">
                                    <div>
                                        <PatternDiagram patternString={rd.pattern} />
                                        <div className="step-caption">{rd.patternLabel}</div>
                                    </div>
                                    <button className="try-btn" onClick={() => onTryPattern(rd.key, rd.pattern)}>
                                        <Play size={14} /> TRY IT
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
