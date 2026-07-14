import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import rough from 'roughjs/bundled/rough.esm.js';
import { AutomataEngine } from '../engine/AutomataEngine';

export const Canvas = forwardRef(({ isPlaying, onStats, speedMultiplier = 1, isCuteMode = false, activeBrush = "PENCIL" }, ref) => {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const reqRef = useRef(null);
    const isPlayingRef = useRef(isPlaying);
    const speedRef = useRef(speedMultiplier);
    const isCuteModeRef = useRef(isCuteMode);
    const zoomRef = useRef(1);
    
    const brushType = useRef("PENCIL");
    const CELL_SIZE = 20;
    const gridCols = useRef(300);
    const gridRows = useRef(300);

    const panX = useRef(0);
    const panY = useRef(0);
    const isPanning = useRef(false);
    const lastPanPos = useRef([0, 0]);

    useImperativeHandle(ref, () => ({
        clear: () => { if (engineRef.current) engineRef.current.clear(); },
        randomize: () => { if (engineRef.current) engineRef.current.randomize(); },
        setRule: (rule) => { if (engineRef.current) engineRef.current.setRule(rule); },
        setBrushType: (type) => { brushType.current = type; },
        seedPattern: (patternString) => {
            if (engineRef.current) {
                const canvas = canvasRef.current;
                const cx = Math.floor((-panX.current + canvas.width / 2) / (CELL_SIZE * zoomRef.current));
                const cy = Math.floor((-panY.current + canvas.height / 2) / (CELL_SIZE * zoomRef.current));
                engineRef.current.seedPattern(cx, cy, patternString);
            }
        },
        centerCamera: () => {
            const canvas = canvasRef.current;
            if (canvas) {
                panX.current = canvas.width / 2 - (gridCols.current / 2 * CELL_SIZE * zoomRef.current);
                panY.current = canvas.height / 2 - (gridRows.current / 2 * CELL_SIZE * zoomRef.current);
            }
        },
        stepOnce: () => {
            if (engineRef.current) {
                engineRef.current.step();
                if (onStats) onStats({ gen: engineRef.current.generation, pop: engineRef.current.population });
            }
        },
        rewind: () => {
            if (engineRef.current) {
                engineRef.current.rewind();
                if (onStats) onStats({ gen: engineRef.current.generation, pop: engineRef.current.population });
            }
        },
        zoomIn: () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const worldX = (cx - panX.current) / zoomRef.current;
            const worldY = (cy - panY.current) / zoomRef.current;
            
            zoomRef.current = Math.min(zoomRef.current * 1.25, 5);
            panX.current = cx - (worldX * zoomRef.current);
            panY.current = cy - (worldY * zoomRef.current);
        },
        zoomOut: () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const worldX = (cx - panX.current) / zoomRef.current;
            const worldY = (cy - panY.current) / zoomRef.current;
            
            zoomRef.current = Math.max(zoomRef.current / 1.25, 0.1);
            panX.current = cx - (worldX * zoomRef.current);
            panY.current = cy - (worldY * zoomRef.current);
        }
    }));

    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    useEffect(() => { speedRef.current = speedMultiplier; }, [speedMultiplier]);
    useEffect(() => { isCuteModeRef.current = isCuteMode; }, [isCuteMode]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        const setSize = () => {
            const rect = parent.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        setSize();
        
        if (!engineRef.current) {
            engineRef.current = new AutomataEngine(gridCols.current, gridRows.current);
            panX.current = canvas.width / 2 - (gridCols.current / 2 * CELL_SIZE);
            panY.current = canvas.height / 2 - (gridRows.current / 2 * CELL_SIZE);
        }

        const rc = rough.canvas(canvas);
        const resizeObserver = new ResizeObserver(setSize);
        resizeObserver.observe(parent);

        let lastTime = performance.now();
        let accumulator = 0;
        const BASE_SIMULATION_STEP = 150;

        const drawGrid = () => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const currentZoom = zoomRef.current;
            const scaledCell = CELL_SIZE * currentZoom;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
            const startX = ((panX.current % scaledCell) + scaledCell) % scaledCell;
            const startY = ((panY.current % scaledCell) + scaledCell) % scaledCell;
            
            if (scaledCell > 5) {
                for (let x = startX; x < canvas.width; x += scaledCell) {
                    for (let y = startY; y < canvas.height; y += scaledCell) {
                        ctx.fillRect(x, y, 2, 2);
                    }
                }
            }
            
            const grid = engineRef.current.getGrid();
            const w = engineRef.current.width;
            const h = engineRef.current.height;
            const colors = ['#e31837', '#ffb800', '#00b050', '#0070c0', '#9900cc', '#ff66cc'];
            
            const ruleInfo = engineRef.current.getRuleInfo();
            const engineMode = ruleInfo.mode || "BINARY";
            
            for (let y = 0; y < h; y++) {
                let oddRowOffset = 0;
                if (engineMode === "HEXAGONAL" && y % 2 !== 0) {
                    oddRowOffset = scaledCell / 2;
                }
                
                for (let x = 0; x < w; x++) {
                    const state = grid[y * w + x];
                    
                    if (state > 0.05) {
                        const px = (x * scaledCell) + panX.current + oddRowOffset;
                        const py = (y * scaledCell) + panY.current;
                        
                        if (px > -scaledCell && px < canvas.width && py > -scaledCell && py < canvas.height) {
                            let opacity = 1;
                            let sizeScale = 1;
                            if (engineMode === "CONTINUOUS") {
                                opacity = state;
                                sizeScale = 0.5 + (state * 0.5);
                            }
                            
                            let color = 'black';
                            let isDyingBrain = false;
                            
                            if (engineMode === "MULTI_STATE") {
                                if (ruleInfo.maxState === 3) {
                                    if (state === 2) {
                                        color = 'rgba(0, 112, 192, 0.5)';
                                        isDyingBrain = true;
                                    } else {
                                        color = isCuteModeRef.current ? colors[(x * 13 + y * 7) % colors.length] : 'black';
                                    }
                                } else {
                                    color = `hsl(${(state / ruleInfo.maxState) * 360}, 80%, 50%)`;
                                }
                            } else {
                                color = isCuteModeRef.current ? colors[(x * 13 + y * 7) % colors.length] : 'black';
                            }
                            
                            const s = scaledCell * sizeScale;
                            const centerOffset = (scaledCell - s) / 2;
                            const drawPx = px + centerOffset;
                            const drawPy = py + centerOffset;
                            
                            ctx.globalAlpha = opacity;
                            
                            if (s < 6 || engineMode === "CONTINUOUS") {
                                ctx.fillStyle = color;
                                ctx.fillRect(drawPx, drawPy, s, s);
                                ctx.globalAlpha = 1;
                                continue;
                            }

                            if (isCuteModeRef.current && !isDyingBrain) {
                                rc.rectangle(drawPx + 1, drawPy + 1, s - 2, s - 2, {
                                    fill: color,
                                    fillStyle: 'hachure',
                                    roughness: 2,
                                    strokeWidth: 1,
                                    seed: x * 1000 + y
                                });
                                // Eyes
                                ctx.fillStyle = 'white';
                                ctx.beginPath();
                                ctx.arc(drawPx + s * 0.3, drawPy + s * 0.35, s * 0.12, 0, Math.PI * 2);
                                ctx.arc(drawPx + s * 0.7, drawPy + s * 0.35, s * 0.12, 0, Math.PI * 2);
                                ctx.fill();
                                // Pupils
                                ctx.fillStyle = 'black';
                                ctx.beginPath();
                                ctx.arc(drawPx + s * 0.3, drawPy + s * 0.35, s * 0.05, 0, Math.PI * 2);
                                ctx.arc(drawPx + s * 0.7, drawPy + s * 0.35, s * 0.05, 0, Math.PI * 2);
                                ctx.fill();
                                // Blush
                                ctx.fillStyle = 'rgba(255, 105, 180, 0.6)';
                                ctx.beginPath();
                                ctx.arc(drawPx + s * 0.15, drawPy + s * 0.45, s * 0.08, 0, Math.PI * 2);
                                ctx.arc(drawPx + s * 0.85, drawPy + s * 0.45, s * 0.08, 0, Math.PI * 2);
                                ctx.fill();
                                // Smile
                                ctx.strokeStyle = 'black';
                                ctx.lineWidth = s > 15 ? 1.5 : 1;
                                ctx.beginPath();
                                ctx.arc(drawPx + s * 0.5, drawPy + s * 0.45, s * 0.1, 0, Math.PI);
                                ctx.stroke();
                                // Hands
                                ctx.beginPath();
                                ctx.moveTo(drawPx - s * 0.05, drawPy + s * 0.6);
                                ctx.lineTo(drawPx + s * 0.15, drawPy + s * 0.7);
                                ctx.moveTo(drawPx + s * 1.05, drawPy + s * 0.6);
                                ctx.lineTo(drawPx + s * 0.85, drawPy + s * 0.7);
                                ctx.stroke();
                            } else {
                                rc.rectangle(drawPx + 1, drawPy + 1, s - 2, s - 2, {
                                    fill: color,
                                    fillStyle: isDyingBrain ? 'solid' : 'hachure',
                                    roughness: 1.5,
                                    strokeWidth: 1,
                                    hachureAngle: 60,
                                    hachureGap: Math.max(1, s / 6),
                                    seed: x * 1000 + y
                                });
                            }
                            
                            ctx.globalAlpha = 1;
                        }
                    }
                }
            }
        };

        const loop = (time) => {
            if (!engineRef.current) return;
            const dt = time - lastTime;
            lastTime = time;
            
            if (isPlayingRef.current) {
                accumulator += dt;
                const currentStep = BASE_SIMULATION_STEP / speedRef.current;
                while (accumulator >= currentStep) {
                    engineRef.current.step();
                    accumulator -= currentStep;
                    if (onStats) {
                        onStats({ gen: engineRef.current.generation, pop: engineRef.current.population });
                    }
                }
            }
            
            drawGrid();
            reqRef.current = requestAnimationFrame(loop);
        };
        reqRef.current = requestAnimationFrame(loop);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(reqRef.current);
        };
    }, []);

    const drawAtPoint = (e) => {
        if (!engineRef.current) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const currentZoom = zoomRef.current;
        
        const gy = Math.floor((cy - panY.current) / (CELL_SIZE * currentZoom));
        let gx = Math.floor((cx - panX.current) / (CELL_SIZE * currentZoom));
        
        const ruleInfo = engineRef.current.getRuleInfo();
        if (ruleInfo.mode === "HEXAGONAL" && gy % 2 !== 0) {
            gx = Math.floor((cx - panX.current - (CELL_SIZE * currentZoom / 2)) / (CELL_SIZE * currentZoom));
        }
        
        if (brushType.current === "PENCIL") {
            engineRef.current.setCell(gx, gy, 1);
        } else if (brushType.current === "ERASER") {
            engineRef.current.setCell(gx, gy, 0);
        } else if (brushType.current === "SPRAY") {
            // Radius relative to visible area: ~5% of viewport width in cell units
            const visibleCellsX = canvas.width / (CELL_SIZE * currentZoom);
            const sprayRadius = Math.max(2, Math.floor(visibleCellsX * 0.05));
            engineRef.current.applySpray(gx, gy, sprayRadius, 0.4, 1);
        }
    };

    const handlePointerDown = (e) => {
        if (!engineRef.current) return;
        if (e.button === 1 || e.button === 2 || activeBrush === "PAN") {
            isPanning.current = true;
            lastPanPos.current = [e.clientX, e.clientY];
            if (canvasRef.current) canvasRef.current.classList.add('grabbing');
        } else {
            drawAtPoint(e);
        }
    };

    const handlePointerMove = (e) => {
        if (!engineRef.current) return;
        if (isPanning.current) {
            panX.current += e.clientX - lastPanPos.current[0];
            panY.current += e.clientY - lastPanPos.current[1];
            lastPanPos.current = [e.clientX, e.clientY];
        } else if (e.buttons === 1 && activeBrush !== "PAN") {
            drawAtPoint(e);
        }
    };

    const handlePointerUpOrOut = () => {
        isPanning.current = false;
        if (canvasRef.current) canvasRef.current.classList.remove('grabbing');
    };

    const handleWheel = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        const worldX = (mx - panX.current) / zoomRef.current;
        const worldY = (my - panY.current) / zoomRef.current;

        const zoomDelta = e.deltaY > 0 ? 1 / 1.15 : 1.15;
        zoomRef.current = Math.max(0.1, Math.min(5, zoomRef.current * zoomDelta));

        panX.current = mx - (worldX * zoomRef.current);
        panY.current = my - (worldY * zoomRef.current);
    };

    return (
        <canvas
            ref={canvasRef}
            className={`autometa-canvas ${activeBrush === "PAN" ? "brush-pan" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUpOrOut}
            onPointerOut={handlePointerUpOrOut}
            onContextMenu={(e) => e.preventDefault()}
            onWheel={handleWheel}
        />
    );
});
