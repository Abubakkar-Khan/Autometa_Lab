export class AutomataEngine {
    static RULES = {
        // Keep only the 2 most interesting binary rules
        "CONWAY":       { label: "B3/S23",     born: [3],          survive: [2, 3],          desc: "Conway's Game of Life: The classic simulation.", mode: "BINARY" },
        "MAZE":         { label: "B3/S12345",  born: [3],          survive: [1, 2, 3, 4, 5], desc: "Maze: Creates sprawling crystalline structures.", mode: "BINARY" },
        // Advanced Evolution Rules
        "BRIANS_BRAIN": { label: "3-STATE",     desc: "Brian's Brain: Directional worms and neural wires.", mode: "MULTI_STATE", maxState: 3 },
        "CYCLIC":       { label: "16-STATE",    desc: "Cyclic: Psychedelic spirals and hypnotic waves.", mode: "MULTI_STATE", maxState: 16 },
        "SMOOTH_LIFE":  { label: "CONTINUOUS",  desc: "Smooth Organic: Fluid amoebas in a primordial soup.", mode: "CONTINUOUS" },
        "HEX_LIFE":     { label: "HEX-B2/S34", born: [2], survive: [3, 4], desc: "Hex Life: Organic snowflake crystals on a honeycomb grid.", mode: "HEXAGONAL" },
        "MOLD":         { label: "STOCHASTIC",  desc: "Mold: Fuzzy, probabilistic, spreading growths.", mode: "STOCHASTIC" },
    };

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.size = width * height;
        this.buffers = [new Float32Array(this.size), new Float32Array(this.size)];
        this.readIndex = 0;
        this.writeIndex = 1;
        this.generation = 0;
        this.population = 0;
        this.history = [];
        // Pre-built boolean lookup tables for born/survive (index 0-8)
        this.bornLUT = new Uint8Array(9);
        this.surviveLUT = new Uint8Array(9);
        // Pre-built hex offsets (avoid allocating arrays every step)
        this._hexEven = [[1,0],[1,1],[0,1],[-1,0],[0,-1],[1,-1]];
        this._hexOdd  = [[1,0],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1]];
        this.setRule("CONWAY");
        this.randomize();
    }

    setRule(ruleName) {
        if (!AutomataEngine.RULES[ruleName]) return;
        this.currentRule = ruleName;
        const rule = AutomataEngine.RULES[ruleName];
        // Build fast boolean lookup tables
        this.bornLUT.fill(0);
        this.surviveLUT.fill(0);
        if (rule.born)    for (const n of rule.born)    this.bornLUT[n] = 1;
        if (rule.survive) for (const n of rule.survive) this.surviveLUT[n] = 1;
    }

    getRuleInfo() {
        return AutomataEngine.RULES[this.currentRule] || AutomataEngine.RULES["CONWAY"];
    }

    randomize(density = 0.15) {
        const buf = this.buffers[this.readIndex];
        const info = this.getRuleInfo();
        for (let i = 0; i < this.size; i++) {
            if (Math.random() < density) {
                if (info.mode === "CONTINUOUS") buf[i] = Math.random();
                else if (info.mode === "MULTI_STATE") buf[i] = Math.floor(Math.random() * (info.maxState || 3));
                else buf[i] = 1;
            } else {
                buf[i] = 0;
            }
        }
        this.generation = 0;
        this.history = [];
        this._countPop();
    }

    clear() {
        this.buffers[0].fill(0);
        this.buffers[1].fill(0);
        this.generation = 0;
        this.population = 0;
        this.history = [];
    }

    setCell(x, y, val) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            if (val === 1 && this.currentRule === "CYCLIC") val = Math.floor(Math.random() * 15) + 1;
            this.buffers[this.readIndex][y * this.width + x] = val;
        }
    }

    applySpray(gx, gy, radius, density, val) {
        const r = Math.floor(radius);
        const r2 = r * r;
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                if (dx * dx + dy * dy <= r2 && Math.random() < density) {
                    this.setCell(gx + dx, gy + dy, val);
                }
            }
        }
    }

    seedPattern(x, y, patternString) {
        const rows = patternString.split('\n');
        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            for (let c = 0; c < row.length; c++) {
                if (row[c] !== '.') this.setCell(x + c, y + r, 1);
            }
        }
    }

    getGrid() { return this.buffers[this.readIndex]; }

    _countPop() {
        let pop = 0;
        const buf = this.buffers[this.readIndex];
        const len = this.size;
        for (let i = 0; i < len; i++) if (buf[i] > 0.05) pop++;
        this.population = pop;
    }

    step() {
        const r = this.readIndex;
        const wr = this.writeIndex;
        const readBuf = this.buffers[r];
        const writeBuf = this.buffers[wr];
        const w = this.width;
        const h = this.height;

        // History - only save every 3rd generation to reduce memory pressure
        if (!this.history) this.history = [];
        if (this.generation % 3 === 0) {
            this.history.push({ grid: new Float32Array(readBuf), gen: this.generation, pop: this.population });
            if (this.history.length > 30) this.history.shift();
        }

        const mode = (this.getRuleInfo().mode) || "BINARY";
        switch (mode) {
            case "BINARY":      this._stepBinary(readBuf, writeBuf, w, h); break;
            case "MULTI_STATE": this._stepMultiState(readBuf, writeBuf, w, h); break;
            case "CONTINUOUS":  this._stepContinuous(readBuf, writeBuf, w, h); break;
            case "HEXAGONAL":   this._stepHexagonal(readBuf, writeBuf, w, h); break;
            case "STOCHASTIC":  this._stepStochastic(readBuf, writeBuf, w, h); break;
        }

        this.writeIndex = r;
        this.readIndex = wr;
        this.generation++;
        this._countPop();
    }

    // ─── Optimized Binary ───
    // Inlined neighbor counting, boolean LUT instead of Set.has()
    _stepBinary(rd, wr, w, h) {
        const bLUT = this.bornLUT;
        const sLUT = this.surviveLUT;
        const wm1 = w - 1;
        const hm1 = h - 1;
        for (let y = 0; y < h; y++) {
            const yOff = y * w;
            const yAbove = (y > 0) ? (y - 1) * w : -1;
            const yBelow = (y < hm1) ? (y + 1) * w : -1;
            for (let x = 0; x < w; x++) {
                let n = 0;
                const xl = x > 0, xr = x < wm1;
                if (yAbove >= 0) {
                    if (xl && rd[yAbove + x - 1] >= 1) n++;
                    if (rd[yAbove + x] >= 1) n++;
                    if (xr && rd[yAbove + x + 1] >= 1) n++;
                }
                if (xl && rd[yOff + x - 1] >= 1) n++;
                if (xr && rd[yOff + x + 1] >= 1) n++;
                if (yBelow >= 0) {
                    if (xl && rd[yBelow + x - 1] >= 1) n++;
                    if (rd[yBelow + x] >= 1) n++;
                    if (xr && rd[yBelow + x + 1] >= 1) n++;
                }
                const i = yOff + x;
                wr[i] = rd[i] >= 1 ? sLUT[n] : bLUT[n];
            }
        }
    }

    // ─── Optimized Multi-State ───
    _stepMultiState(rd, wr, w, h) {
        const isBrain = this.currentRule === "BRIANS_BRAIN";
        const maxState = this.getRuleInfo().maxState || 3;
        const wm1 = w - 1, hm1 = h - 1;

        for (let y = 0; y < h; y++) {
            const yOff = y * w;
            const yAbove = (y > 0) ? (y - 1) * w : -1;
            const yBelow = (y < hm1) ? (y + 1) * w : -1;
            for (let x = 0; x < w; x++) {
                const i = yOff + x;
                const state = rd[i];
                const xl = x > 0, xr = x < wm1;

                if (isBrain) {
                    if (state === 1) { wr[i] = 2; continue; }
                    if (state === 2) { wr[i] = 0; continue; }
                    let n = 0;
                    if (yAbove >= 0) {
                        if (xl && rd[yAbove + x - 1] === 1) n++;
                        if (rd[yAbove + x] === 1) n++;
                        if (xr && rd[yAbove + x + 1] === 1) n++;
                    }
                    if (xl && rd[yOff + x - 1] === 1) n++;
                    if (xr && rd[yOff + x + 1] === 1) n++;
                    if (yBelow >= 0) {
                        if (xl && rd[yBelow + x - 1] === 1) n++;
                        if (rd[yBelow + x] === 1) n++;
                        if (xr && rd[yBelow + x + 1] === 1) n++;
                    }
                    wr[i] = n === 2 ? 1 : 0;
                } else {
                    // Cyclic - check if any neighbor is nextState
                    const nextState = (state + 1) % maxState;
                    let found = false;
                    if (yAbove >= 0) {
                        if (xl && rd[yAbove + x - 1] === nextState) { found = true; }
                        else if (rd[yAbove + x] === nextState) { found = true; }
                        else if (xr && rd[yAbove + x + 1] === nextState) { found = true; }
                    }
                    if (!found) {
                        if (xl && rd[yOff + x - 1] === nextState) { found = true; }
                        else if (xr && rd[yOff + x + 1] === nextState) { found = true; }
                    }
                    if (!found && yBelow >= 0) {
                        if (xl && rd[yBelow + x - 1] === nextState) { found = true; }
                        else if (rd[yBelow + x] === nextState) { found = true; }
                        else if (xr && rd[yBelow + x + 1] === nextState) { found = true; }
                    }
                    wr[i] = found ? nextState : state;
                }
            }
        }
    }

    // ─── Optimized Continuous ───
    // Uses clamped boundary access instead of per-pixel bounds checks
    _stepContinuous(rd, wr, w, h) {
        const wm1 = w - 1, hm1 = h - 1;
        for (let y = 0; y < h; y++) {
            const y0 = Math.max(0, y - 2), y1 = Math.min(hm1, y + 2);
            for (let x = 0; x < w; x++) {
                const x0 = Math.max(0, x - 2), x1 = Math.min(wm1, x + 2);
                let sum = 0;
                let count = 0;
                for (let ny = y0; ny <= y1; ny++) {
                    const rowOff = ny * w;
                    for (let nx = x0; nx <= x1; nx++) {
                        if (ny === y && nx === x) continue;
                        sum += rd[rowOff + nx];
                        count++;
                    }
                }
                const avg = sum / count;
                const val = rd[y * w + x];
                let growth;
                if (avg >= 0.22 && avg <= 0.35) growth = 0.15;
                else if (avg > 0.35 && avg <= 0.45 && val > 0) growth = -0.05;
                else growth = -0.15;

                let nv = val + growth;
                if (nv < 0) nv = 0; else if (nv > 1) nv = 1;
                wr[y * w + x] = nv;
            }
        }
    }

    // ─── Optimized Hexagonal ───
    _stepHexagonal(rd, wr, w, h) {
        const bLUT = this.bornLUT;
        const sLUT = this.surviveLUT;
        const even = this._hexEven;
        const odd = this._hexOdd;
        for (let y = 0; y < h; y++) {
            const offsets = (y & 1) ? odd : even;
            const yOff = y * w;
            for (let x = 0; x < w; x++) {
                let n = 0;
                for (let k = 0; k < 6; k++) {
                    const nx = x + offsets[k][0];
                    const ny = y + offsets[k][1];
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h && rd[ny * w + nx] >= 1) n++;
                }
                const i = yOff + x;
                wr[i] = rd[i] >= 1 ? sLUT[n] : bLUT[n];
            }
        }
    }

    // ─── Optimized Stochastic ───
    _stepStochastic(rd, wr, w, h) {
        const wm1 = w - 1, hm1 = h - 1;
        for (let y = 0; y < h; y++) {
            const yOff = y * w;
            const yAbove = (y > 0) ? (y - 1) * w : -1;
            const yBelow = (y < hm1) ? (y + 1) * w : -1;
            for (let x = 0; x < w; x++) {
                const i = yOff + x;
                const xl = x > 0, xr = x < wm1;
                let n = 0;
                if (yAbove >= 0) {
                    if (xl && rd[yAbove + x - 1] >= 1) n++;
                    if (rd[yAbove + x] >= 1) n++;
                    if (xr && rd[yAbove + x + 1] >= 1) n++;
                }
                if (xl && rd[yOff + x - 1] >= 1) n++;
                if (xr && rd[yOff + x + 1] >= 1) n++;
                if (yBelow >= 0) {
                    if (xl && rd[yBelow + x - 1] >= 1) n++;
                    if (rd[yBelow + x] >= 1) n++;
                    if (xr && rd[yBelow + x + 1] >= 1) n++;
                }
                if (rd[i] >= 1) {
                    wr[i] = Math.random() < 0.05 ? 0 : 1;
                } else {
                    wr[i] = Math.random() < (n * 0.15) ? 1 : 0;
                }
            }
        }
    }

    rewind() {
        if (!this.history || this.history.length === 0) return;
        const last = this.history.pop();
        this.buffers[this.readIndex].set(last.grid);
        this.generation = last.gen;
        this.population = last.pop;
    }
}
