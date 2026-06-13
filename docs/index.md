# Simulador de Algoritmos de Memoria

Bienvenido a la documentación oficial del **Simulador de Algoritmos de Memoria 2026**, una herramienta
interactiva para visualizar y comparar estrategias de asignación de memoria en sistemas operativos.

## ¿Qué es este proyecto?

Este simulador permite explorar cómo el sistema operativo decide **dónde colocar un proceso en memoria RAM**.
Implementa dos algoritmos clásicos de asignación y muestra en tiempo real el impacto de cada decisión.

!!! tip "¿Para quién es este simulador?"
    Ideal para estudiantes de Sistemas Operativos, docentes que quieran demostrar conceptos de gestión
    de memoria, y cualquier persona curiosa sobre cómo funciona la memoria a bajo nivel.

## Algoritmos disponibles

| Algoritmo | Estrategia | Ventaja principal | Desventaja |
|-----------|-----------|-------------------|------------|
| [Peor Ajuste](algoritmos/worst-fit.md) | Bloque libre más grande | Deja fragmentos grandes reusables | Mayor fragmentación externa |
| [Mejor Ajuste](algoritmos/best-fit.md) | Bloque libre más pequeño suficiente | Desperdicia menos espacio | Genera fragmentos muy pequeños |

## Características del simulador

- **Visualización en tiempo real** de celdas de memoria ocupadas y libres
- **Estadísticas en vivo**: uso, fragmentación y mayor bloque disponible
- **Demos predefinidas** con secuencias de procesos (pequeños, grandes, mezclados)
- **Control de demos**: pausa y reanuda la ejecución paso a paso
- **Historial de operaciones** con todas las asignaciones y liberaciones
- **Diseño responsive** que funciona en escritorio y móviles

## Inicio rápido

1. Abre el simulador en tu navegador
2. Selecciona el algoritmo en el menú desplegable
3. Ingresa un tamaño de proceso y haz clic en **Agregar**
4. Observa cómo cambia la visualización de memoria

Consulta la [Guía de Uso](guia-uso.md) para instrucciones detalladas.

## Tecnologías utilizadas

- HTML5, CSS3 (Grid + Flexbox), JavaScript ES6+
- Hospedado en **GitHub Pages**

---

> Proyecto desarrollado como herramienta educativa para el estudio de Sistemas Operativos.
