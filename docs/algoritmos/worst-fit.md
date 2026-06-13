# Peor Ajuste (Worst Fit)

El algoritmo de **Peor Ajuste** asigna cada proceso al **bloque libre más grande** disponible en memoria.
Su nombre es algo engañoso: no es "el peor" en términos de rendimiento, sino que intencionalmente
elige el bloque *más grande* para dejar restos más aprovechables.

## ¿Cómo funciona?

Cuando llega un proceso de tamaño `N`:

1. Se escanean todos los bloques libres en memoria
2. Se filtran los que tienen tamaño `>= N`
3. Se selecciona el **mayor** de esos bloques
4. El proceso ocupa los primeros `N` unidades de ese bloque
5. El resto queda libre para futuras asignaciones

!!! note "Idea clave"
    Al elegir siempre el bloque más grande, Worst Fit intenta que los fragmentos
    que sobran sean lo suficientemente grandes para alojar otros procesos.

## Implementación en el simulador

=== "JavaScript"

    ```javascript
    worstFit(processName, size) {
        const blocks = this._freeBlocks();
        const validBlocks = blocks.filter(
            ([start, length]) => length >= size
        );

        if (validBlocks.length === 0) {
            this.history.push(
                `FALLÓ asignar ${processName} (tamaño ${size}) - Sin espacio`
            );
            return -1;
        }

        // Seleccionar el bloque MÁS GRANDE disponible
        const best = validBlocks.reduce((max, block) =>
            block[1] > max[1] ? block : max
        );

        const [start, blockSize] = best;
        this.allocateMemory(start, processName, size);
        return start;
    }
    ```

=== "Pseudocódigo"

    ```
    función worst_fit(proceso, tamaño):
        bloques_libres = obtener_bloques_libres()
        válidos = filtrar(bloques_libres, tamaño_bloque >= tamaño)

        si válidos está vacío:
            retornar ERROR

        bloque_elegido = máximo(válidos, clave=tamaño_bloque)
        asignar(proceso, bloque_elegido.inicio, tamaño)
        retornar bloque_elegido.inicio
    ```

## Ejemplo paso a paso

Memoria de 20 unidades, inicialmente libre:

```
[ libre: 20 ]
```

Llega P1 (tamaño 5) → único bloque de 20 → se asigna ahí:

```
[ P1: 5 | libre: 15 ]
```

Llega P2 (tamaño 3) → único bloque libre de 15 → se asigna ahí:

```
[ P1: 5 | P2: 3 | libre: 12 ]
```

Se libera P1. Ahora hay dos bloques libres: 5 y 12.
Llega P3 (tamaño 4) → Worst Fit elige el **bloque de 12**:

```
[ libre: 5 | P2: 3 | P3: 4 | libre: 8 ]
```

El fragmento de 8 queda disponible para procesos futuros.

## Comparativa de fragmentación

| Situación | Worst Fit | Best Fit |
|-----------|:---------:|:--------:|
| Bloques sobrantes promedio | Medianos | Pequeños |
| Aprovechamiento a largo plazo | Mejor | Peor |
| Velocidad de búsqueda | O(n) | O(n) |
| Ideal para procesos | Variables | Similares en tamaño |

!!! warning "Limitación"
    Si los procesos son todos muy grandes y similares en tamaño, Worst Fit puede
    llenar la memoria más rápido que Best Fit, dejando menos espacio útil.

Consulta el algoritmo opuesto: [Mejor Ajuste (Best Fit)](best-fit.md).
