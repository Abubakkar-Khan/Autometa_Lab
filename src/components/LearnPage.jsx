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
    { key: "CONWAY",      name: "Conway's Game of Life", pattern: ".O.\n..O\nOOO",           patternLabel: "Glider" },
    { key: "HIGHLIFE",    name: "HighLife",              pattern: "...O..\n.O.O..\n..OO..\n......",  patternLabel: "Replicator" },
    { key: "SEEDS",       name: "Seeds",                 pattern: "OO\n..\n..\nOO",             patternLabel: "Explosive" },
    { key: "DAY & NIGHT", name: "Day & Night",           pattern: "OOO\nO.O\nOOO",             patternLabel: "Block" },
    { key: "MAZE",        name: "Maze",                  pattern: ".O.\n..O\nOOO",             patternLabel: "Seed" },
    { key: "ANNEAL",      name: "Anneal",                pattern: "OOO\nO.O\nOOO",             patternLabel: "Ring" },
    { key: "CORAL",       name: "Coral",                 pattern: "OO\nOO",                     patternLabel: "Block" },
    { key: "DIAMOEBA",    name: "Diamoeba",              pattern: "..O..\n.OOO.\nOOOOO\n.OOO.\n..O..", patternLabel: "Diamond" },
    { key: "REPLICATOR",  name: "Replicator",            pattern: "OOO\nO..\nO..",             patternLabel: "Corner" },
    { key: "2x2",         name: "2×2",                   pattern: "OO\nOO",                     patternLabel: "Block" },
    { key: "MOVE",        name: "Move",                  pattern: ".O.\n..O\nOOO",             patternLabel: "Glider" },
    { key: "FLOCK",       name: "Flock",                 pattern: ".O.\n..O\nOOO",             patternLabel: "Seed" },
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
                            <h3>COUNT THE NEIGHBORS</h3>
                            <p>
                                For every cell, count its 8 surrounding neighbors. The center cell (marked <strong>?</strong>) looks at the ring around it to decide its fate.
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
                                <p>{info.desc}</p>
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
