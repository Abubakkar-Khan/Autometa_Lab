export class AutomataEngine {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.size = width * height;
        
        this.buffers = [
            new Uint8Array(this.size),
            new Uint8Array(this.size)
        ];
        this.readIndex = 0;
        this.writeIndex = 1;

        this.generation = 0;
        this.population = 0;
        this.setRule("CONWAY");
        this.randomize();
    }

    static RULES = {
        "CONWAY":      { born: [3],          survive: [2, 3],             label: "B3/S23",      desc: "The classic. Balanced chaos and order." },
        "HIGHLIFE":    { born: [3, 6],       survive: [2, 3],             label: "B36/S23",     desc: "Spawns self-replicating patterns." },
        "SEEDS":       { born: [2],          survive: [],                 label: "B2/S",        desc: "Nothing survives. Pure explosive growth." },
        "DAY & NIGHT": { born: [3,6,7,8],    survive: [3,4,6,7,8],       label: "B3678/S34678", desc: "Symmetric blobs that melt and shift." },
        "MAZE":        { born: [3],          survive: [1,2,3,4,5],       label: "B3/S12345",   desc: "Grows organic maze-like structures." },
        "ANNEAL":      { born: [4,6,7,8],    survive: [3,5,6,7,8],       label: "B4678/S35678", desc: "Smooths noise into stable regions." },
        "CORAL":       { born: [3],          survive: [4,5,6,7,8],       label: "B3/S45678",   desc: "Slow, branching coral-like growth." },
        "DIAMOEBA":    { born: [3,5,6,7,8],  survive: [5,6,7,8],         label: "B35678/S5678", desc: "Large amoeba-like diamond shapes." },
        "REPLICATOR":  { born: [1,3,5,7],    survive: [1,3,5,7],         label: "B1357/S1357",  desc: "Every pattern eventually copies itself." },
        "2x2":         { born: [3,6],        survive: [1,2,5],           label: "B36/S125",    desc: "Forms blocky 2×2 stable structures." },
        "MOVE":        { born: [3,6,8],      survive: [2,4,5],           label: "B368/S245",   desc: "Many small oscillators and spaceships." },
        "FLOCK":       { born: [3],          survive: [1,2],             label: "B3/S12",      desc: "Chaotic flocking, dies quickly." },
    };

    setRule(ruleName) {
        this.ruleName = ruleName;
        const rule = AutomataEngine.RULES[ruleName] || AutomataEngine.RULES["CONWAY"];
        this.born = rule.born;
        this.survive = rule.survive;
    }

    randomize(density = 0.15) {
        const buf = this.buffers[this.readIndex];
        for (let i = 0; i < this.size; i++) {
            buf[i] = Math.random() < density ? 1 : 0;
        }
        this.generation = 0;
        this._countPopulation();
    }

    clear() {
        this.buffers[0].fill(0);
        this.buffers[1].fill(0);
        this.generation = 0;
        this.population = 0;
    }

    getIndex(x, y) {
        x = (x + this.width) % this.width;
        y = (y + this.height) % this.height;
        return y * this.width + x;
    }

    setCell(x, y, value = 1) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.buffers[this.readIndex][y * this.width + x] = value;
        }
    }

    applySpray(x, y, radius = 3, density = 0.3, value = 1) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx * dx + dy * dy <= radius * radius && Math.random() < density) {
                    this.setCell(x + dx, y + dy, value);
                }
            }
        }
    }

    seedPattern(cx, cy, patternString) {
        const lines = patternString.trim().split('\n');
        const height = lines.length;
        const width = Math.max(...lines.map(l => l.length));
        const startX = cx - Math.floor(width / 2);
        const startY = cy - Math.floor(height / 2);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < lines[y].length; x++) {
                if (lines[y][x] === 'O') {
                    this.setCell(startX + x, startY + y, 1);
                }
            }
        }
    }

    getGrid() {
        return this.buffers[this.readIndex];
    }

    _countPopulation() {
        let count = 0;
        const buf = this.buffers[this.readIndex];
        for (let i = 0; i < this.size; i++) {
            count += buf[i];
        }
        this.population = count;
    }

    step() {
        const readBuf = this.buffers[this.readIndex];
        const writeBuf = this.buffers[this.writeIndex];
        const w = this.width;
        const h = this.height;

        // Use a Set for O(1) lookups instead of .includes()
        const bornSet = new Set(this.born);
        const surviveSet = new Set(this.survive);

        let pop = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let sum = 0;
                sum += readBuf[this.getIndex(x - 1, y - 1)];
                sum += readBuf[this.getIndex(x,     y - 1)];
                sum += readBuf[this.getIndex(x + 1, y - 1)];
                sum += readBuf[this.getIndex(x - 1, y)];
                sum += readBuf[this.getIndex(x + 1, y)];
                sum += readBuf[this.getIndex(x - 1, y + 1)];
                sum += readBuf[this.getIndex(x,     y + 1)];
                sum += readBuf[this.getIndex(x + 1, y + 1)];

                const idx = y * w + x;
                const alive = readBuf[idx] === 1;
                const next = alive ? surviveSet.has(sum) : bornSet.has(sum);
                writeBuf[idx] = next ? 1 : 0;
                pop += writeBuf[idx];
            }
        }

        this.readIndex = 1 - this.readIndex;
        this.writeIndex = 1 - this.writeIndex;
        this.generation++;
        this.population = pop;
    }
}
