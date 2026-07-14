import React, { useState, useRef } from 'react';
import { Canvas } from './components/Canvas';
import { LearnPage } from './components/LearnPage';
import { AutomataEngine } from './engine/AutomataEngine';
import { 
    Play, Pause, Edit2, Eraser, SprayCan, Trash2, 
    Shuffle, BookOpen, Target, SkipForward, ChevronRight,
    Activity, Users, Hash, RotateCcw, Smile
} from 'lucide-react';
import './index.css';

const RULE_NAMES = Object.keys(AutomataEngine.RULES);

function App() {
    const [viewMode, setViewMode] = useState("SIMULATION");
    const [isPlaying, setIsPlaying] = useState(true);
    const [activeRule, setActiveRule] = useState("CONWAY");
    const [activeBrush, setActiveBrush] = useState("PENCIL");
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const [isCuteMode, setIsCuteMode] = useState(false);
    const [stats, setStats] = useState({ gen: 0, pop: 0 });
    const [panelOpen, setPanelOpen] = useState(true);
    const canvasRef = useRef(null);

    const handleRuleChange = (rule) => {
        setActiveRule(rule);
        if (canvasRef.current) canvasRef.current.setRule(rule);
    };

    const handleBrushChange = (brush) => {
        setActiveBrush(brush);
        if (canvasRef.current) canvasRef.current.setBrushType(brush);
    };

    const handleTryPattern = (rule, pattern) => {
        setViewMode("SIMULATION");
        handleRuleChange(rule);
        setIsPlaying(false);
        setTimeout(() => {
            if (canvasRef.current) {
                canvasRef.current.clear();
                canvasRef.current.centerCamera();
                canvasRef.current.seedPattern(pattern);
                setIsPlaying(true);
            }
        }, 100);
    };

    if (viewMode === "LEARN") {
        return <LearnPage onClose={() => setViewMode("SIMULATION")} onTryPattern={handleTryPattern} />;
    }

    const ruleInfo = AutomataEngine.RULES[activeRule];

    return (
        <div className="app-layout">
            {/* ─── Top Bar ─── */}
            <header className="topbar">
                <div className="topbar-left">
                    <h1 className="logo">AUTOMETA</h1>
                    <span className="logo-sub">LAB</span>
                </div>
                <div className="topbar-center">
                    <div className="stat-pill">
                        <Activity size={14} className="stat-icon" />
                        <span className="stat-label">GEN</span>
                        <span className="stat-value">{stats.gen}</span>
                    </div>
                    <div className="stat-pill">
                        <Users size={14} className="stat-icon" />
                        <span className="stat-label">POP</span>
                        <span className="stat-value">{stats.pop}</span>
                    </div>
                    <div className="stat-pill accent">
                        <Hash size={14} className="stat-icon" />
                        <span className="stat-label">RULE</span>
                        <span className="stat-value">{activeRule}</span>
                    </div>
                </div>
                <div className="topbar-right">
                    <button className="topbar-btn" onClick={() => setViewMode("LEARN")} title="Learn">
                        <BookOpen size={18} />
                    </button>
                </div>
            </header>

            {/* ─── Main Area ─── */}
            <main className="main-area">
                {/* Canvas */}
                <div className="playground">
                    <Canvas isPlaying={isPlaying} onStats={setStats} speedMultiplier={speedMultiplier} isCuteMode={isCuteMode} ref={canvasRef} />

                    {/* Floating toolbar at bottom center */}
                    <div className="floating-toolbar">
                        <button className={`ftb ${isPlaying ? 'active' : ''}`} onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button className="ftb" onClick={() => { if(canvasRef.current) canvasRef.current.rewind(); }} title="Rewind">
                            <RotateCcw size={18} />
                        </button>
                        <button className="ftb" onClick={() => { if(canvasRef.current) canvasRef.current.stepOnce(); }} title="Step once">
                            <SkipForward size={18} />
                        </button>
                        <button className="ftb" style={{ fontWeight: 900, fontSize: '0.75rem', width: 'auto', padding: '0 8px' }} onClick={() => setSpeedMultiplier(s => s === 1 ? 2 : s === 2 ? 4 : s === 4 ? 0.5 : 1)} title="Speed">
                            {speedMultiplier}x
                        </button>
                        <div className="ftb-divider" />
                        <button className={`ftb ${isCuteMode ? 'active' : ''}`} onClick={() => setIsCuteMode(!isCuteMode)} title="Cute Mode">
                            <Smile size={18} />
                        </button>
                        <div className="ftb-divider" />
                        <button className={`ftb ${activeBrush === "PENCIL" ? 'active' : ''}`} onClick={() => handleBrushChange("PENCIL")} title="Pencil">
                            <Edit2 size={18} />
                        </button>
                        <button className={`ftb ${activeBrush === "SPRAY" ? 'active' : ''}`} onClick={() => handleBrushChange("SPRAY")} title="Spray">
                            <SprayCan size={18} />
                        </button>
                        <button className={`ftb ${activeBrush === "ERASER" ? 'active' : ''}`} onClick={() => handleBrushChange("ERASER")} title="Eraser">
                            <Eraser size={18} />
                        </button>
                        <div className="ftb-divider" />
                        <button className="ftb" onClick={() => { if(canvasRef.current) { canvasRef.current.clear(); setIsPlaying(false); }}} title="Clear">
                            <Trash2 size={18} />
                        </button>
                        <button className="ftb" onClick={() => { if(canvasRef.current) canvasRef.current.randomize(); setIsPlaying(true); }} title="Randomize">
                            <Shuffle size={18} />
                        </button>
                        <button className="ftb" onClick={() => { if(canvasRef.current) canvasRef.current.centerCamera(); }} title="Center">
                            <Target size={18} />
                        </button>
                    </div>
                </div>

                {/* ─── Right Panel ─── */}
                <aside className={`right-panel ${panelOpen ? 'open' : 'collapsed'}`}>
                    <button className="panel-toggle" onClick={() => setPanelOpen(!panelOpen)}>
                        <ChevronRight size={16} style={{ transform: panelOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {panelOpen && (
                        <div className="panel-content">
                            <div className="panel-section">
                                <h3 className="panel-heading">RULES</h3>
                                <ul className="rule-list">
                                    {RULE_NAMES.map(rule => {
                                        const info = AutomataEngine.RULES[rule];
                                        return (
                                            <li 
                                                key={rule}
                                                className={`rule-item ${activeRule === rule ? 'active' : ''}`}
                                                onClick={() => handleRuleChange(rule)}
                                            >
                                                <span className="rule-name">{rule}</span>
                                                <span className="rule-label">{info.label}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            {ruleInfo && (
                                <div className="panel-section rule-desc">
                                    <p>{ruleInfo.desc}</p>
                                </div>
                            )}
                            <div className="panel-section panel-help">
                                <p><strong>CLICK</strong> to sketch cells</p>
                                <p><strong>RIGHT-CLICK DRAG</strong> to pan</p>
                                <p><strong>MIDDLE-CLICK DRAG</strong> to pan</p>
                            </div>
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
}

export default App;
