class MemoryManager {
    constructor(totalMemory = 100) {
        this.totalMemory = totalMemory;
        this.memory = Array(totalMemory).fill(null);
        this.history = [];
        this.currentAlgorithm = 'worst'; // 'worst' o 'best'
    }

    setAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;
        const algorithmName = algorithm === 'worst' ? 'Peor Ajuste' : 'Mejor Ajuste';
        this.history.push(`=== Algoritmo cambiado a ${algorithmName} ===`);
    }

    _freeBlocks() {
        const blocks = [];
        let start = null;
        
        // Agregar un sentinela al final para cerrar el último bloque
        const memoryWithSentinel = [...this.memory, 1];
        
        for (let i = 0; i < memoryWithSentinel.length; i++) {
            const cell = memoryWithSentinel[i];
            if (cell === null) {
                if (start === null) {
                    start = i;
                }
            } else {
                if (start !== null) {
                    blocks.push([start, i - start]);
                    start = null;
                }
            }
        }
        return blocks;
    }

    worstFit(processName, size) {
        const blocks = this._freeBlocks();
        // Buscar el bloque libre más grande que quepa
        const validBlocks = blocks.filter(([start, length]) => length >= size);
        
        if (validBlocks.length === 0) {
            this.history.push(`FALLÓ asignar ${processName} (tamaño ${size}) - Sin espacio`);
            return -1;
        }
        
        const best = validBlocks.reduce((max, block) => 
            block[1] > max[1] ? block : max
        );
        
        const [start, blockSize] = best;
        this.allocateMemory(start, processName, size);
        this.history.push(`Asignado ${processName} (tamaño ${size}) en ${start} - Peor Ajuste (bloque ${blockSize})`);
        return start;
    }

    bestFit(processName, size) {
        const blocks = this._freeBlocks();
        // Buscar el bloque libre más pequeño que quepa (pero suficiente)
        const validBlocks = blocks.filter(([start, length]) => length >= size);
        
        if (validBlocks.length === 0) {
            this.history.push(`FALLÓ asignar ${processName} (tamaño ${size}) - Sin espacio`);
            return -1;
        }
        
        // Encontrar el bloque con el tamaño más pequeño que aún sea suficiente
        const best = validBlocks.reduce((min, block) => 
            block[1] < min[1] ? block : min
        );
        
        const [start, blockSize] = best;
        this.allocateMemory(start, processName, size);
        this.history.push(`Asignado ${processName} (tamaño ${size}) en ${start} - Mejor Ajuste (bloque ${blockSize})`);
        return start;
    }

    allocateProcess(processName, size) {
        if (this.currentAlgorithm === 'worst') {
            return this.worstFit(processName, size);
        } else {
            return this.bestFit(processName, size);
        }
    }

    allocateMemory(start, processName, size) {
        for (let i = start; i < start + size; i++) {
            this.memory[i] = processName;
        }
    }

    deallocateMemory(processName) {
        let changed = false;
        for (let i = 0; i < this.memory.length; i++) {
            if (this.memory[i] === processName) {
                this.memory[i] = null;
                changed = true;
            }
        }
        if (changed) {
            this.history.push(`Liberado proceso ${processName}`);
        }
        return changed;
    }

    stats() {
        const used = this.memory.filter(cell => cell !== null).length;
        const free = this.totalMemory - used;
        const blocks = this._freeBlocks();
        const fragmentation = blocks.length;
        const largest = blocks.length > 0 ? Math.max(...blocks.map(([_, size]) => size)) : 0;
        
        return { used, free, fragmentation, largest };
    }

    getAlgorithmName() {
        return this.currentAlgorithm === 'worst' ? 'Peor Ajuste' : 'Mejor Ajuste';
    }
}

class MemorySimulatorApp {
    constructor() {
        this.DEMO_DELAY = 1000;
        this.memoryManager = new MemoryManager(50);
        this.processCounter = 0;
        this.demoRunning = false;
        this.demoPaused = false;
        this.currentDemoInfo = "";
        this.currentDemoSequence = [];
        this.demoTimeout = null;

        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        this.elements = {
            algorithm: document.getElementById('algorithm'),
            processSize: document.getElementById('processSize'),
            memorySize: document.getElementById('memorySize'),
            addProcess: document.getElementById('addProcess'),
            freeRandom: document.getElementById('freeRandom'),
            clearAll: document.getElementById('clearAll'),
            applySize: document.getElementById('applySize'),
            pauseDemo: document.getElementById('pauseDemo'),
            demoStatus: document.getElementById('demoStatus'),
            infoLabel: document.getElementById('infoLabel'),
            statsLabel: document.getElementById('statsLabel'),
            memoryCanvas: document.getElementById('memoryCanvas'),
            processesText: document.getElementById('processesText'),
            historyText: document.getElementById('historyText'),
            demoButtons: document.querySelectorAll('.demo-btn')
        };
    }

    attachEventListeners() {
        this.elements.addProcess.addEventListener('click', () => this.addProcess());
        this.elements.freeRandom.addEventListener('click', () => this.freeRandom());
        this.elements.clearAll.addEventListener('click', () => this.clearAll());
        this.elements.applySize.addEventListener('click', () => this.setMemorySize());
        this.elements.pauseDemo.addEventListener('click', () => this.togglePause());
        
        // Event listener para cambio de algoritmo
        this.elements.algorithm.addEventListener('change', (e) => {
            const newAlgorithm = e.target.value;
            this.memoryManager.setAlgorithm(newAlgorithm);
            this.updateDisplay();
            this.showDemoInfo(`Algoritmo cambiado a ${this.memoryManager.getAlgorithmName()}`);
        });

        this.elements.demoButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const sizes = JSON.parse(e.target.dataset.sizes);
                const name = e.target.textContent;
                this.startDemoSequence(sizes, name);
            });
        });

        // Enter key para agregar procesos
        this.elements.processSize.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addProcess();
        });
    }

    showDemoInfo(text) {
        this.currentDemoInfo = text;
        this.elements.infoLabel.textContent = text;
    }

    startDemoSequence(sizes, demoName) {
        if (this.demoRunning) return;
        
        this.clearAll();
        this.showDemoInfo(`DEMO: ${demoName} con ${this.memoryManager.getAlgorithmName()}`);
        this.demoRunning = true;
        this.demoPaused = false;
        this.currentDemoSequence = [...sizes];
        
        this.elements.pauseDemo.disabled = false;
        this.elements.pauseDemo.textContent = "Pausar Demo";
        
        this.memoryManager.history.push(`=== INICIO DEMO: ${demoName} (${this.memoryManager.getAlgorithmName()}) ===`);
        this.stepDemo(0);
    }

    stepDemo(idx) {
        if (!this.demoRunning || idx >= this.currentDemoSequence.length) {
            return this.endDemo();
        }
        
        if (this.demoPaused) {
            this.demoTimeout = setTimeout(() => this.stepDemo(idx), 300);
            return;
        }
        
        const size = this.currentDemoSequence[idx];
        this.processCounter++;
        const name = `P${this.processCounter}`;
        this.memoryManager.allocateProcess(name, size);
        this.updateDisplay();
        
        this.demoTimeout = setTimeout(() => this.stepDemo(idx + 1), this.DEMO_DELAY);
    }

    togglePause() {
        if (!this.demoRunning) return;
        
        this.demoPaused = !this.demoPaused;
        this.elements.pauseDemo.textContent = this.demoPaused ? "Reanudar Demo" : "Pausar Demo";
        
        const status = this.demoPaused ? "PAUSADA" : "EJECUTANDO";
        const base = this.currentDemoInfo || this.elements.infoLabel.textContent;
        this.elements.infoLabel.textContent = `Demo ${status} - ${base}`;
    }

    endDemo() {
        if (this.demoTimeout) {
            clearTimeout(this.demoTimeout);
            this.demoTimeout = null;
        }
        
        this.demoRunning = false;
        this.demoPaused = false;
        this.elements.pauseDemo.disabled = true;
        this.elements.pauseDemo.textContent = "Pausar Demo";
        this.showDemoInfo("Demo finalizada. Puedes probar otra demo o agregar procesos.");
    }

    addProcess() {
        if (this.demoRunning) {
            alert("Demo en curso: Termina la demostración antes de agregar procesos.");
            return;
        }
        
        const size = parseInt(this.elements.processSize.value);
        if (isNaN(size) || size <= 0) {
            alert("Error: Tamaño inválido");
            return;
        }
        
        this.processCounter++;
        const name = `P${this.processCounter}`;
        
        if (this.memoryManager.allocateProcess(name, size) === -1) {
            alert("Sin memoria: No hay espacio suficiente");
            this.processCounter--;
        }
        
        this.updateDisplay();
    }

    freeRandom() {
        if (this.demoRunning) {
            alert("Demo en curso: Termina la demostración antes de liberar procesos.");
            return;
        }
        
        const processes = [...new Set(this.memoryManager.memory)].filter(p => p !== null);
        if (processes.length === 0) {
            alert("Info: No hay procesos activos");
            return;
        }
        
        const randomProcess = processes[Math.floor(Math.random() * processes.length)];
        this.memoryManager.deallocateMemory(randomProcess);
        this.updateDisplay();
    }

    clearAll() {
        if (this.demoRunning) {
            this.endDemo();
        }
        
        const size = parseInt(this.elements.memorySize.value) || 50;
        const currentAlgorithm = this.elements.algorithm.value;
        this.memoryManager = new MemoryManager(size);
        this.memoryManager.setAlgorithm(currentAlgorithm);
        this.processCounter = 0;
        this.updateDisplay();
        this.showDemoInfo("Sistema reiniciado.");
    }

    setMemorySize() {
        if (this.demoRunning) {
            alert("Demo en curso: Termina la demostración antes de cambiar el tamaño.");
            return;
        }
        
        const size = parseInt(this.elements.memorySize.value);
        if (isNaN(size) || size <= 0) {
            alert("Error: Tamaño inválido");
            return;
        }
        
        const currentAlgorithm = this.elements.algorithm.value;
        this.memoryManager = new MemoryManager(size);
        this.memoryManager.setAlgorithm(currentAlgorithm);
        this.processCounter = 0;
        this.updateDisplay();
        this.showDemoInfo(`Tamaño de memoria actualizado a ${size}.`);
    }

    updateDisplay() {
        this.updateMemoryVisualization();
        this.updateStats();
        this.updateProcessesList();
        this.updateHistory();
    }

    updateMemoryVisualization() {
        const canvas = this.elements.memoryCanvas;
        canvas.innerHTML = '';
        
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        
        const totalMemory = this.memoryManager.totalMemory;
        
        // Calcular tamaño de celda basado en el ancho disponible
        const containerWidth = canvas.clientWidth;
        const minCellWidth = 12;
        const cellWidth = Math.max(minCellWidth, containerWidth / totalMemory);
        
        for (let i = 0; i < totalMemory; i++) {
            const process = this.memoryManager.memory[i];
            const cell = document.createElement('div');
            cell.className = 'memory-cell';
            cell.style.width = `${cellWidth}px`;
            cell.setAttribute('data-tooltip', `Posición: ${i}`);
            
            if (process === null) {
                cell.classList.add('free');
                if (cellWidth > 20) {
                    cell.textContent = '□';
                }
            } else {
                cell.classList.add('occupied');
                // Determinar color basado en el número del proceso
                const processNum = parseInt(process.substring(1)) || 0;
                const colorIndex = processNum % colors.length;
                cell.style.backgroundColor = colors[colorIndex];
                
                // Mostrar texto solo si hay espacio suficiente
                if (cellWidth > 20) {
                    cell.textContent = process;
                } else if (cellWidth > 12) {
                    cell.textContent = process.substring(1);
                }
            }
            
            canvas.appendChild(cell);
        }
    }

    updateStats() {
        const stats = this.memoryManager.stats();
        const total = this.memoryManager.totalMemory;
        const percentage = (stats.used / total * 100).toFixed(1);
        const algorithmName = this.memoryManager.getAlgorithmName();
        
        this.elements.statsLabel.textContent = 
            `${algorithmName} | Usado: ${stats.used}/${total} (${percentage}%) | Fragmentación: ${stats.fragmentation} | Mayor bloque: ${stats.largest}`;
    }

    updateProcessesList() {
        const counts = {};
        for (const cell of this.memoryManager.memory) {
            if (cell) {
                counts[cell] = (counts[cell] || 0) + 1;
            }
        }
        
        let html = '';
        for (const [process, count] of Object.entries(counts)) {
            html += `${process}: ${count} unidades<br>`;
        }
        
        this.elements.processesText.innerHTML = html || 'No hay procesos activos';
    }

    updateHistory() {
        const history = this.memoryManager.history.slice(-15);
        this.elements.historyText.innerHTML = history.join('<br>') || 'Sin historial';
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new MemorySimulatorApp();
});