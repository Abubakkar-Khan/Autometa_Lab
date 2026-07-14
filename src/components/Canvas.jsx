import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import rough from 'roughjs/bundled/rough.esm.js';
import { AutomataEngine } from '../engine/AutomataEngine';

export const Canvas = forwardRef(({ isPlaying, onStats, speedMultiplier = 1, isCuteMode = false }, ref) => {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const reqRef = useRef(null);
    const isPlayingRef = useRef(isPlaying);
    const speedRef = useRef(speedMultiplier);
    const isCuteModeRef = useRef(isCuteMode);
    
    const brushType = useRef("PENCIL");
    const CELL_SIZE = 20;
    const gridCols = useRef(0);
    const gridRows = useRef(0);

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
                const cx = Math.floor((-panX.current + canvas.width / 2) / CELL_SIZE);
                const cy = Math.floor((-panY.current + canvas.height / 2) / CELL_SIZE);
                engineRef.current.seedPattern(cx, cy, patternString);
            }
        },
        centerCamera: () => { panX.current = 0; panY.current = 0; },
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

        gridCols.current = Math.ceil(canvas.width / CELL_SIZE) + 10;
        gridRows.current = Math.ceil(canvas.height / CELL_SIZE) + 10;
        
        engineRef.current = new AutomataEngine(gridCols.current, gridRows.current);
        const rc = rough.canvas(canvas);

        const resizeObserver = new ResizeObserver(setSize);
        resizeObserver.observe(parent);

        let lastTime = performance.now();
        let accumulator = 0;
        const BASE_SIMULATION_STEP = 150;

        const drawGrid = () => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Subtle dot grid
            ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
            const startX = ((panX.current % CELL_SIZE) + CELL_SIZE) % CELL_SIZE;
            const startY = ((panY.current % CELL_SIZE) + CELL_SIZE) % CELL_SIZE;
            for (let x = startX; x < canvas.width; x += CELL_SIZE) {
                for (let y = startY; y < canvas.height; y += CELL_SIZE) {
                    ctx.fillRect(x, y, 1.5, 1.5);
                }
            }
            
            const grid = engineRef.current.getGrid();
            const w = engineRef.current.width;
            const h = engineRef.current.height;
            const colors = ['#e31837', '#ffb800', '#00b050', '#0070c0', '#9900cc', '#ff66cc'];
            
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (grid[y * w + x] === 1) {
                        const px = (x * CELL_SIZE) + panX.current;
                        const py = (y * CELL_SIZE) + panY.current;
                        
                        if (px > -CELL_SIZE && px < canvas.width && py > -CELL_SIZE && py < canvas.height) {
                            if (isCuteModeRef.current) {
                                const cIndex = (x * 13 + y * 7) % colors.length;
                                rc.rectangle(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2, {
                                    fill: colors[cIndex],
                                    fillStyle: 'hachure',
                                    roughness: 2,
                                    strokeWidth: 1,
                                    seed: x * 1000 + y
                                });
                                ctx.fillStyle = 'white';
                                ctx.beginPath();
                                ctx.arc(px + CELL_SIZE * 0.3, py + CELL_SIZE * 0.35, 2.5, 0, Math.PI * 2);
                                ctx.arc(px + CELL_SIZE * 0.7, py + CELL_SIZE * 0.35, 2.5, 0, Math.PI * 2);
                                ctx.fill();
                                ctx.fillStyle = 'black';
                                ctx.beginPath();
                                ctx.arc(px + CELL_SIZE * 0.3, py + CELL_SIZE * 0.35, 1, 0, Math.PI * 2);
                                ctx.arc(px + CELL_SIZE * 0.7, py + CELL_SIZE * 0.35, 1, 0, Math.PI * 2);
                                ctx.fill();
                                ctx.strokeStyle = 'black';
                                ctx.lineWidth = 1;
                                ctx.beginPath();
                                ctx.moveTo(px - 1, py + CELL_SIZE * 0.6);
                                ctx.lineTo(px + 3, py + CELL_SIZE * 0.7);
                                ctx.moveTo(px + CELL_SIZE + 1, py + CELL_SIZE * 0.6);
                                ctx.lineTo(px + CELL_SIZE - 3, py + CELL_SIZE * 0.7);
                                ctx.stroke();
                            } else {
                                rc.rectangle(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2, {
                                    fill: 'black',
                                    fillStyle: 'hachure',
                                    roughness: 1.5,
                                    strokeWidth: 1,
                                    hachureAngle: 60,
                                    hachureGap: 3.5,
                                    seed: x * 1000 + y
                                });
                            }
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
            engineRef.current = null;
        };
    }, []);

    const drawAtPoint = (e) => {
        if (!engineRef.current) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const gx = Math.floor((cx - panX.current) / CELL_SIZE);
        const gy = Math.floor((cy - panY.current) / CELL_SIZE);
        
        if (brushType.current === "PENCIL") {
            engineRef.current.setCell(gx, gy, 1);
        } else if (brushType.current === "ERASER") {
            engineRef.current.setCell(gx, gy, 0);
        } else if (brushType.current === "SPRAY") {
            engineRef.current.applySpray(gx, gy, 3, 0.35, 1);
        }
    };

    const handlePointerDown = (e) => {
        if (!engineRef.current) return;
        if (e.button === 1 || e.button === 2) {
            isPanning.current = true;
            lastPanPos.current = [e.clientX, e.clientY];
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
        } else if (e.buttons === 1) {
            drawAtPoint(e);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32'%3E%3Cpath d='M22 4 L28 10 L14 24 L6 26 L8 18 Z' fill='white' stroke='black' stroke-width='2' stroke-linejoin='round'/%3E%3Cpath d='M18 8 L24 14' fill='none' stroke='black' stroke-width='2'/%3E%3Cpath d='M6 26 L10 22 M8 18 L12 22 M7 25 L9 21' fill='none' stroke='black' stroke-width='1.5'/%3E%3C/svg%3E") 6 26, crosshair` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => { isPanning.current = false; }}
            onPointerOut={() => { isPanning.current = false; }}
            onContextMenu={(e) => e.preventDefault()}
        />
    );
});
