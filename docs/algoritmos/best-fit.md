# Mejor Ajuste (Best Fit)

El algoritmo de **Mejor Ajuste** asigna cada proceso al **bloque libre más pequeño** que sea
suficientemente grande para contenerlo. El objetivo es desperdiciar el mínimo espacio posible
en cada asignación.

## ¿Cómo funciona?

Cuando llega un proceso de tamaño `N`:

1. Se escanean todos los bloques libres en memoria
2. Se filtran los que tienen tamaño `>= N`
3. Se selecciona el **menor** de esos bloques (el que "mejor" se ajusta)
4. El proceso ocupa los primeros `N` unidades de ese bloque
5. El sobrante queda libre — generalmente un fragmento pequeño

!!! note "Idea clave"
    Al elegir el bloque que "mejor ajusta" al proceso, se minimizan los espacios
    desperdiciados por asignación. La desventaja es que los fragmentos sobrantes
    tienden a ser demasiado pequeños para reutilizarse.

## Implementación en el simulador

=== "JavaScript"

    ```javascript
    bestFit(processName, size) {
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

        // Seleccionar el bloque MÁS PEQUEÑO que sea suficiente
        const best = validBlocks.reduce((min, block) =>
            block[1] < min[1] ? block : min
        );

        const [start, blockSize] = best;
        this.allocateMemory(start, processName, size);
        return start;
    }
    ```

=== "Pseudocódigo"

    ```
    función best_fit(proceso, tamaño):
        bloques_libres = obtener_bloques_libres()
        válidos = filtrar(bloques_libres, tamaño_bloque >= tamaño)

        si válidos está vacío:
            retornar ERROR

        bloque_elegido = mínimo(válidos, clave=tamaño_bloque)
        asignar(proceso, bloque_elegido.inicio, tamaño)
        retornar bloque_elegido.inicio
    ```

## Ejemplo paso a paso

Memoria con tres bloques libres: 6, 14 y 9 unidades.

```
[ libre:6 | P1:5 | libre:14 | P2:3 | libre:9 ]
```

Llega P3 (tamaño 5). Bloques válidos: 6, 14, 9.
Best Fit elige el **bloque de 6** (el más pequeño suficiente):

```
[ P3:5 | libre:1 | P1:5 | libre:14 | P2:3 | libre:9 ]
```

El fragmento de 1 unidad que sobra es prácticamente inutilizable.

## Comparativa de fragmentación

| Métrica | Best Fit | Worst Fit |
|---------|:--------:|:---------:|
| Fragmentos sobrantes | Muy pequeños | Medianos/grandes |
| Riesgo de fragmentación interna | Alto | Bajo |
| Uso eficiente con tamaños similares | ✅ Bueno | ❌ Regular |
| Uso eficiente con tamaños variados | ❌ Regular | ✅ Bueno |
| Complejidad de búsqueda | O(n) | O(n) |

!!! warning "Fragmentación externa"
    Con el tiempo, Best Fit genera muchos fragmentos libres de 1-2 unidades que
    no pueden ser utilizados por ningún proceso. Esto provoca que la memoria
    parezca disponible pero sea inutilizable — fragmentación externa severa.

## ¿Cuándo usar cada algoritmo?

```
Procesos de tamaño uniforme  →  Best Fit  (aprovecha cada hueco)
Procesos de tamaño variable  →  Worst Fit (restos más reusables)
Memoria muy limitada         →  Best Fit  (desperdicia menos por asignación)
Carga de trabajo dinámica    →  Worst Fit (mejor en el largo plazo)
```

Regresa a la comparativa en el [Inicio](../index.md) o revisa
[Peor Ajuste (Worst Fit)](worst-fit.md) para el otro algoritmo.
