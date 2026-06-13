# Referencia Técnica

Documentación detallada de las clases y métodos que componen el simulador.

## Estructura de archivos

```
simulador-memoria/
├── index.html       # Estructura HTML de la interfaz
├── style.css        # Estilos visuales (gradientes, animaciones, responsive)
├── script.js        # Lógica del simulador (clases JS)
└── docs/            # Esta documentación (MkDocs)
```

## Clase `MemoryManager`

Núcleo del simulador. Gestiona el estado de la memoria y ejecuta los algoritmos.

### Constructor

```javascript
constructor(totalMemory = 100)
```

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `totalMemory` | `number` | `100` | Tamaño total de memoria en unidades |

Propiedades internas:

```javascript
this.totalMemory  // número total de celdas
this.memory       // Array de tamaño totalMemory, null = libre, string = nombre del proceso
this.history      // Array de strings con el log de operaciones
this.currentAlgorithm  // 'worst' | 'best'
```

### Métodos principales

#### `allocateProcess(processName, size)`

Punto de entrada para asignar un proceso. Delega al algoritmo activo.

```javascript
const pos = manager.allocateProcess('P1', 5);
// Retorna: índice de inicio, o -1 si falla
```

#### `deallocateMemory(processName)`

Libera todas las celdas ocupadas por un proceso.

```javascript
manager.deallocateMemory('P1');
// Retorna: true si encontró el proceso, false si no existía
```

#### `stats()`

Retorna un objeto con métricas del estado actual.

=== "Uso"

    ```javascript
    const s = manager.stats();
    console.log(s.used);          // unidades ocupadas
    console.log(s.free);          // unidades libres
    console.log(s.fragmentation); // cantidad de bloques libres
    console.log(s.largest);       // mayor bloque libre disponible
    ```

=== "Implementación"

    ```javascript
    stats() {
        const used = this.memory.filter(cell => cell !== null).length;
        const free = this.totalMemory - used;
        const blocks = this._freeBlocks();
        const fragmentation = blocks.length;
        const largest = blocks.length > 0
            ? Math.max(...blocks.map(([_, size]) => size))
            : 0;

        return { used, free, fragmentation, largest };
    }
    ```

#### `_freeBlocks()` (privado)

Retorna lista de bloques libres contiguos como `[inicio, longitud]`.

```javascript
// Memoria: [P1, P1, null, null, P2, null, null, null]
// Resultado: [[2, 2], [5, 3]]
```

!!! note "Centinela interno"
    El método agrega un elemento no-null al final del array para simplificar
    el cierre del último bloque libre sin condición especial.

---

## Clase `MemorySimulatorApp`

Controla la interfaz de usuario y conecta los eventos del DOM con `MemoryManager`.

### Propiedades de configuración

```javascript
this.DEMO_DELAY = 1000;  // ms entre pasos de la demo
```

Puedes modificar este valor en el código para acelerar o ralentizar las demos.

### Flujo de una demo

```
startDemoSequence(sizes, name)
        ↓
    clearAll()         ← reinicia memoria
        ↓
    stepDemo(0)        ← primer proceso
        ↓
  allocateProcess()    ← llama al MemoryManager
        ↓
  updateDisplay()      ← actualiza el DOM
        ↓
  setTimeout → stepDemo(idx+1)   ← siguiente paso
        ↓
    endDemo()          ← cuando idx >= sizes.length
```

### Colores de procesos

Los procesos se colorean ciclicamente con este arreglo:

```javascript
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];
// El color se asigna por: colors[numProceso % colors.length]
```

---

## Tecnologías y compatibilidad

| Tecnología | Uso | Versión mínima del navegador |
|------------|-----|------------------------------|
| CSS Grid | Layout de paneles de texto | Chrome 57+, Firefox 52+ |
| CSS Flexbox | Controles y visualización | Chrome 29+, Firefox 28+ |
| ES6 Classes | `MemoryManager`, `MemorySimulatorApp` | Chrome 49+, Firefox 45+ |
| `Array.reduce` | Búsqueda del bloque óptimo | Todos los modernos |
| CSS Custom Scrollbar | Estilo del historial | Chrome/Safari (webkit) |

!!! tip "Sin dependencias externas"
    El simulador no usa ninguna librería de terceros. Todo está implementado
    con HTML, CSS y JavaScript puro. Solo se necesita un navegador moderno.

---

Vuelve al [Inicio](index.md) o consulta la [Guía de Uso](guia-uso.md).
