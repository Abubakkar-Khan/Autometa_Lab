import React, { useState } from 'react';
import { Play } from 'lucide-react';

/* ─── Helper to render mini grids in instructions ─── */
const MiniGrid = ({ matrix, centerStyle = false }) => {
    return (
        <div className="mini-grid">
            {matrix.map((row, r) => (
                <div key={r} className="mini-grid-row">
                    {row.map((val, c) => (
                        <div 
                            key={c} 
                            className={`mini-grid-cell ${val === 1 ? 'alive' : ''} ${centerStyle && r===1 && c===1 ? 'center' : ''}`}
                        >
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

/* ─── Helper to render pattern diagrams ─── */
const PatternDiagram = ({ patternString }) => {
    const rows = patternString.split('\n');
    return (
        <div className="pattern-diagram">
            {rows.map((row, r) => (
                <div key={r} className="pattern-row">
                    {row.split('').map((char, c) => (
                        <div key={c} className={`pattern-cell ${char === 'O' ? 'alive' : ''}`}></div>
                    ))}
                </div>
            ))}
        </div>
    );
};

/* ─── Rule data with patterns ─── */
const RULE_DATA = [
    { key: "CONWAY",      name: "Conway's Game of Life", pattern: ".O.\n..O\nOOO",           patternLabel: "Glider", details: "Invented by John Conway in 1970, this is the most famous cellular automaton. It perfectly balances chaos and order, creating complex spaceships, oscillators, and stable forms. It is computationally Turing-complete." },
    { key: "MAZE",        name: "Maze",                  pattern: "OOO",                       patternLabel: "Seed", details: "Cells survive very easily (1 to 5 neighbors) but are only born with exactly 3. This causes patterns to solidify into intricate, branching, crystalline mazes that expand until the grid is filled." },

    // Advanced / Evolution
    { key: "BRIANS_BRAIN",name: "Brian's Brain",         pattern: "O.O\n...\nO.O",             patternLabel: "Worms", details: "A 3-state automaton (Alive, Dying, Dead). A cell goes from Alive to Dying, then Dying to Dead. This forces movement in one direction, creating intricate neural pathways and crawling worms." },
    { key: "CYCLIC",      name: "Cyclic Spirals",        pattern: "OOO\nO.O\nOOO",             patternLabel: "Spirals", details: "Features 16 distinct states! A cell only advances to the next state if it touches a neighbor that is already in the next state. The result is a mesmerizing explosion of colorful, swirling psychedelic spirals." },
    { key: "SMOOTH_LIFE", name: "Smooth Organic",        pattern: "OOO\nOOO\nOOO",             patternLabel: "Amoebas", details: "A massive leap! This rule operates in the continuous floating-point domain (0.0 to 1.0) rather than binary. Cells blend, blur, and divide like fluid microscopic amoebas in a primordial soup." },
    { key: "HEX_LIFE",    name: "Hexagonal Life",        pattern: ".OO\nO.O\n.OO",             patternLabel: "Snowflake", details: "Standard life rules, but evaluated on a staggered honeycomb grid. Without the sharp 90-degree bias of a square grid, the structures that grow look far more organic and crystal-like." },
    { key: "MOLD",        name: "Stochastic Mold",       pattern: "OO\nOO",                    patternLabel: "Growth", details: "A probabilistic automaton. There are no strict rules. Alive cells have a small chance to die, and dead cells have a chance to be born based on their neighbors. It perfectly mimics the creeping spread of mold or lichen." },
];

export const LearnPage = ({ onClose, onTryPattern }) => {
    // Dynamic import to get the rule info from the engine without circularly depending on it
    const { AutomataEngine } = require('../engine/AutomataEngine');
    
    return (
        <div className="learn-page">
            <div className="learn-topbar">
                <button className="topbar-btn" onClick={onClose} title="Back to Lab" style={{marginRight: '1rem'}}>
                    <Play size={18} style={{transform: 'rotate(180deg)'}}/>
                </button>
                <h1>AUTOMETA</h1>
                <span>LAB</span>
            </div>

            <div className="learn-body">
                <section className="learn-hero">
                    <h2>How does it work?</h2>
                    <p>Autometa Lab is a cellular automata simulator. The universe consists of a vast, infinite grid of cells. Every generation, the cells live, die, or multiply based on a set of mathematical rules regarding their neighbors.</p>
                </section>

                <section className="learn-steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>The Neighborhood</h3>
                            <p>For standard rules, every cell looks at its 8 immediate neighbors (horizontal, vertical, and diagonal) to decide what to do next. Let's look at the center cell:</p>
                            <div className="step-diagram">
                                <MiniGrid matrix={[[1,0,0],[0,0,1],[0,0,0]]} centerStyle={true} />
                                <div style={{display:'flex', flexDirection:'column', gap:'0.2rem', marginLeft:'1rem'}}>
                                    <span style={{fontSize:'0.85rem'}}><strong>Alive neighbors: 2</strong></span>
                                    <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>(Top-left and Right)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Surviving & Dying</h3>
                            <p>In Conway's classic rules, an alive cell needs <strong>2 or 3</strong> neighbors to survive. Too few (isolation), it dies. Too many (overpopulation), it also dies.</p>
                            <div className="step-diagram">
                                <div>
                                    <MiniGrid matrix={[[1,0,0],[0,1,0],[0,0,0]]} />
                                    <div className="step-caption">1 neighbor (Dies)</div>
                                </div>
                                <div>
                                    <MiniGrid matrix={[[1,0,0],[0,1,1],[0,0,0]]} />
                                    <div className="step-caption">2 neighbors (Lives)</div>
                                </div>
                                <div>
                                    <MiniGrid matrix={[[1,1,1],[0,1,1],[0,0,0]]} />
                                    <div className="step-caption">5 neighbors (Dies)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Birth</h3>
                            <p>If an empty (dead) space is surrounded by exactly <strong>3</strong> alive neighbors, a new cell is born there in the next generation. This simulates reproduction.</p>
                            <div className="step-diagram">
                                <div>
                                    <MiniGrid matrix={[[1,1,0],[1,0,0],[0,0,0]]} />
                                </div>
                                <div className="step-arrow">→</div>
                                <div>
                                    <MiniGrid matrix={[[1,1,0],[1,1,0],[0,0,0]]} />
                                </div>
                            </div>
                            <p style={{marginTop: '0.5rem', fontSize: '0.85rem', fontStyle: 'italic'}}>The center cell is born because it had 3 neighbors.</p>
                        </div>
                    </div>
                </section>

                <h2 className="learn-heading">Rule Variations</h2>
                <div className="learn-rules-grid">
                    {RULE_DATA.map((rd) => {
                        const info = AutomataEngine.RULES[rd.key] || {};
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
                        )
                    })}
                </div>
            </div>
        </div>
    );
};
