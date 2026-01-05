# 🎯 SISTEMA DE NAVEGACIÓN CON JERARQUÍA DE PRIORIDADES

**Sistema de navegación para NPCs basado en checkpoints con jerarquía dinámica inspirada en bancos de peces**

Versión: 2.0 - Sistema de Prioridades Jerárquicas  
Autor: Basado en desarrollo iterativo y testing  
Fecha: 2026

---

## 📋 TABLA DE CONTENIDOS

1. [Introducción](#introducción)
2. [Estructura de Datos Base](#estructura-de-datos-base)
3. [Configuración del Sistema](#configuración-del-sistema)
4. [Sistema de Detección de Clusters](#sistema-de-detección-de-clusters)
5. [Sistema de Jerarquía de Prioridades](#sistema-de-jerarquía-de-prioridades)
6. [Lógica de Movimiento](#lógica-de-movimiento)
7. [Zonas Especiales](#zonas-especiales)
8. [Visualización](#visualización)
9. [Prompt de Implementación](#prompt-de-implementación)
10. [Solución de Problemas](#solución-de-problemas)

---

## 🎮 INTRODUCCIÓN

### ¿Qué es este sistema?

Un sistema de navegación para NPCs que:
- ✅ **Nunca se bloquea permanentemente**
- ✅ **Flujo natural y orgánico** tipo banco de peces
- ✅ **Jerarquía automática** para resolver conflictos
- ✅ **Flexible** para cualquier tipo de juego
- ✅ **Zonas especiales** con reglas personalizadas

### Conceptos clave

**Checkpoint**: Punto de destino en el recorrido  
**Cluster**: Grupo de NPCs cercanos que interactúan entre sí  
**Prioridad**: Rango jerárquico dentro de un cluster (1 = máxima)  
**Traspaso**: Capacidad de ignorar colisiones con NPCs de menor prioridad  

---

## 📦 ESTRUCTURA DE DATOS BASE

### 1. Array de Checkpoints

```javascript
const checkpoints = [
    {x: 100, y: 100, name: 'A'},
    {x: 500, y: 500, name: 'B'},
    {x: 700, y: 300, name: 'C'},
    // ... más checkpoints según tu juego
];
```

**Nota**: Los NPCs navegarán estos checkpoints en orden: A→B→C→...

### 2. Propiedades de cada NPC

```javascript
class NPC {
    constructor(id) {
        // IDENTIFICACIÓN
        this.id = id;                          // ID único del NPC
        
        // POSICIÓN Y MOVIMIENTO
        this.x = startX;                       // Posición X actual
        this.y = startY;                       // Posición Y actual
        this.speed = 0.5 + Math.random() * 1.5; // Velocidad (aleatorizada)
        this.currentTarget = 0;                // Índice del checkpoint objetivo
        
        // SISTEMA DE CLUSTERS
        this.clusterId = null;                 // ID del cluster al que pertenece
        this.prioridad = null;                 // Rango de prioridad (1, 2, 3, 4...)
        this.npcsDetectados = [];              // Array temporal de NPCs cercanos
        
        // PARÁMETROS DE DETECCIÓN
        this.detectionRadius = 50;             // Radio de detección de otros NPCs
        this.avoidanceStrength = 0.3;          // Fuerza de evasión (0.0-1.0)
        
        // SISTEMA DE COLAS (para zonas especiales)
        this.queuePosition = null;             // Posición en cola especial
        this.queuePositionZigzag = null;       // Otra cola (si tienes múltiples zonas)
    }
}
```

---

## ⚙️ CONFIGURACIÓN DEL SISTEMA

### Constantes Globales

```javascript
const CONFIG_LIDER = {
    radioDeteccion: 70,      // Distancia para formar clusters (píxeles)
    radioDisolucion: 90,     // Distancia para disolver clusters (píxeles)
    minClusters: 2,          // Mínimo NPCs para formar un cluster
    maxClusters: 10,         // Máximo NPCs en un cluster
    distanciaEspera: 30      // Distancia a la que seguidores esperan
};
```

### Ajuste según tu juego

| Parámetro | Valor Bajo | Valor Alto | Efecto |
|-----------|------------|------------|--------|
| `radioDeteccion` | 40-50 | 80-100 | Más bajo = clusters pequeños y frecuentes |
| `minClusters` | 2 | 4 | Más alto = menos clusters pero más grandes |
| `maxClusters` | 5 | 15 | Limita el tamaño máximo de grupos |
| `distanciaEspera` | 30 | 70 | Más alto = más espacio entre NPCs |

---

## 🔍 SISTEMA DE DETECCIÓN DE CLUSTERS

### Paso 1: Detectar NPCs cercanos

```javascript
detectarNPCsCercanos(todosLosNPCs) {
    this.npcsDetectados = [];
    
    for (let otro of todosLosNPCs) {
        if (otro.id === this.id) continue; // Ignorarse a sí mismo
        
        // Calcular distancia
        const dx = otro.x - this.x;
        const dy = otro.y - this.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        
        // Si está dentro del radio, agregarlo
        if (distancia < CONFIG_LIDER.radioDeteccion) {
            this.npcsDetectados.push({
                npc: otro, 
                distancia: distancia
            });
        }
    }
    
    // Ordenar por distancia (más cercanos primero)
    this.npcsDetectados.sort((a, b) => a.distancia - b.distancia);
    
    return this.npcsDetectados.length;
}
```

### Paso 2: Gestionar Clusters (llamar cada frame)

```javascript
function gestionarClusters(todosLosNPCs) {
    // FASE 1: Limpiar estado previo
    for (let npc of todosLosNPCs) {
        npc.clusterId = null;
        npc.prioridad = null;
    }
    
    const clustersFormados = [];
    const npcsProcesados = new Set();
    let clusterIdCounter = 0;
    
    // Procesar en orden consistente
    const npcsOrdenados = [...todosLosNPCs].sort((a, b) => a.id - b.id);
    
    // FASE 2: Formar clusters
    for (let npc of npcsOrdenados) {
        if (npcsProcesados.has(npc.id)) continue;
        
        const cantidadCercanos = npc.detectarNPCsCercanos(todosLosNPCs);
        
        // ¿Suficientes NPCs para formar cluster?
        if (cantidadCercanos >= CONFIG_LIDER.minClusters - 1) {
            const miembrosCluster = [npc];
            npcsProcesados.add(npc.id);
            
            // Agregar NPCs detectados al cluster
            for (let cercano of npc.npcsDetectados) {
                if (miembrosCluster.length >= CONFIG_LIDER.maxClusters) break;
                if (!npcsProcesados.has(cercano.npc.id)) {
                    miembrosCluster.push(cercano.npc);
                    npcsProcesados.add(cercano.npc.id);
                }
            }
            
            // FASE 3: Asignar prioridades (ver siguiente sección)
            if (miembrosCluster.length >= CONFIG_LIDER.minClusters) {
                asignarPrioridades(miembrosCluster, clusterIdCounter);
                clusterIdCounter++;
                
                clustersFormados.push({
                    id: clusterIdCounter - 1,
                    miembros: miembrosCluster
                });
            }
        }
    }
    
    return clustersFormados;
}
```

---

## 🏆 SISTEMA DE JERARQUÍA DE PRIORIDADES

### Concepto Central

**En vez de "líder vs seguidor", ahora hay una jerarquía numérica:**

- **Prioridad 1** (Oro): Puede traspasar a todos (2, 3, 4, 5...)
- **Prioridad 2** (Plata): Puede traspasar a 3, 4, 5... (pero NO a 1)
- **Prioridad 3** (Bronce): Puede traspasar a 4, 5, 6... (pero NO a 1 ni 2)
- **Prioridad N**: Solo puede traspasar a N+1, N+2...

### Asignación de Prioridades

```javascript
function asignarPrioridades(miembrosCluster, clusterId) {
    // Detectar si están en zona especial
    const todosEnZonaEspecial = miembrosCluster.every(m => m.enZonaEspecial());
    
    if (todosEnZonaEspecial) {
        // ZONA ESPECIAL: Ordenar por regla específica
        miembrosCluster.sort((a, b) => {
            // Ejemplo: Respetar orden de llegada
            if (a.queuePosition !== null && b.queuePosition !== null) {
                if (a.queuePosition !== b.queuePosition) {
                    return a.queuePosition - b.queuePosition;
                }
            }
            return a.id - b.id;
        });
    } else {
        // ZONA NORMAL: Ordenar por VELOCIDAD (el más rápido primero)
        miembrosCluster.sort((a, b) => {
            // Criterio 1: Velocidad (descendente)
            if (Math.abs(a.speed - b.speed) > 0.1) {
                return b.speed - a.speed; // Mayor velocidad = prioridad 1
            }
            
            // Criterio 2 (desempate): Distancia al objetivo
            const targetA = checkpoints[a.currentTarget];
            const targetB = checkpoints[b.currentTarget];
            
            const distA = Math.sqrt((targetA.x - a.x)**2 + (targetA.y - a.y)**2);
            const distB = Math.sqrt((targetB.x - b.x)**2 + (targetB.y - b.y)**2);
            
            if (Math.abs(distA - distB) > 5) {
                return distA - distB; // Más cerca = mayor prioridad
            }
            
            // Criterio 3 (desempate final): ID menor
            return a.id - b.id;
        });
    }
    
    // ASIGNAR NÚMEROS DE PRIORIDAD
    for (let i = 0; i < miembrosCluster.length; i++) {
        miembrosCluster[i].clusterId = clusterId;
        miembrosCluster[i].prioridad = i + 1; // 1, 2, 3, 4...
    }
}
```

### Función de Traspaso

```javascript
puedeTraspasar(otroNPC) {
    // Sin prioridades asignadas = no traspaso
    if (this.prioridad === null || otroNPC.prioridad === null) {
        return false;
    }
    
    // Diferentes clusters = no traspaso
    if (this.clusterId !== otroNPC.clusterId) {
        return false;
    }
    
    // Mismo cluster: puedo traspasar si mi prioridad es MENOR (más importante)
    return this.prioridad < otroNPC.prioridad;
}
```

---

## 🚶 LÓGICA DE MOVIMIENTO

### Función Principal de Movimiento

```javascript
function moverNPC(npc, todosLosNPCs, checkpoints) {
    const objetivo = checkpoints[npc.currentTarget];
    
    // PASO 1: Calcular dirección hacia el objetivo
    let dx = objetivo.x - npc.x;
    let dy = objetivo.y - npc.y;
    const distancia = Math.sqrt(dx * dx + dy * dy);
    
    // PASO 2: ¿Llegó al checkpoint?
    const radioLlegada = 15; // Ajustar según necesidad
    if (distancia < radioLlegada) {
        npc.currentTarget = (npc.currentTarget + 1) % checkpoints.length;
        return; // Siguiente frame irá al nuevo objetivo
    }
    
    // PASO 3: Normalizar dirección
    dx /= distancia;
    dy /= distancia;
    
    // PASO 4: Sistema de espera por prioridad
    if (npc.prioridad !== null && npc.prioridad > 1) {
        // Buscar NPCs de MAYOR prioridad (número menor) en mi cluster
        for (let otro of todosLosNPCs) {
            if (otro.clusterId !== npc.clusterId) continue;
            if (otro.prioridad === null) continue;
            if (otro.prioridad >= npc.prioridad) continue; // Solo esperar a mayores
            
            const otroDx = otro.x - npc.x;
            const otroDy = otro.y - npc.y;
            const otroDist = Math.sqrt(otroDx * otroDx + otroDy * otroDy);
            
            // ¿Está adelante en mi dirección?
            const dotProduct = (otroDx * dx + otroDy * dy);
            
            if (otroDist < CONFIG_LIDER.distanciaEspera && dotProduct > 0) {
                // ESPERAR: Apartarse lateralmente
                const perpX = -dy * npc.speed * 0.3;
                const perpY = dx * npc.speed * 0.3;
                
                npc.x += perpX;
                npc.y += perpY;
                actualizarPosicionVisual(npc);
                return; // No avanzar este frame
            }
        }
    }
    
    // PASO 5: Sistema de evitación (solo con NPCs que NO puedo traspasar)
    let evitarX = 0;
    let evitarY = 0;
    
    for (let otro of todosLosNPCs) {
        if (otro.id === npc.id) continue;
        if (npc.puedeTraspasar(otro)) continue; // IGNORAR si puedo traspasarlo
        
        const dx2 = otro.x - npc.x;
        const dy2 = otro.y - npc.y;
        const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        
        if (dist < npc.detectionRadius && dist > 0) {
            const fuerza = (npc.detectionRadius - dist) / npc.detectionRadius;
            evitarX -= (dx2 / dist) * fuerza * 2;
            evitarY -= (dy2 / dist) * fuerza * 2;
        }
    }
    
    // Aplicar evitación a la dirección
    dx += evitarX * npc.avoidanceStrength;
    dy += evitarY * npc.avoidanceStrength;
    
    // Re-normalizar
    const distFinal = Math.sqrt(dx * dx + dy * dy);
    if (distFinal > 0) {
        dx /= distFinal;
        dy /= distFinal;
    }
    
    // PASO 6: Calcular nueva posición
    const nuevaX = npc.x + dx * npc.speed;
    const nuevaY = npc.y + dy * npc.speed;
    
    // PASO 7: Colisiones sólidas (solo con NPCs que NO puedo traspasar)
    let puedeMoverse = true;
    const distanciaMinima = 20 * 0.7; // Ajustar según tamaño de NPC
    
    for (let otro of todosLosNPCs) {
        if (otro.id === npc.id) continue;
        if (npc.puedeTraspasar(otro)) continue; // IGNORAR si puedo traspasarlo
        
        const futDistX = otro.x - nuevaX;
        const futDistY = otro.y - nuevaY;
        const futDist = Math.sqrt(futDistX * futDistX + futDistY * futDistY);
        
        if (futDist < distanciaMinima) {
            puedeMoverse = false;
            
            // Intentar movimiento lateral (perpendicular)
            const perpX = -dy * npc.speed * 0.5;
            const perpY = dx * npc.speed * 0.5;
            
            const alt1X = npc.x + perpX;
            const alt1Y = npc.y + perpY;
            const alt2X = npc.x - perpX;
            const alt2Y = npc.y - perpY;
            
            const dist1 = Math.sqrt((otro.x - alt1X)**2 + (otro.y - alt1Y)**2);
            const dist2 = Math.sqrt((otro.x - alt2X)**2 + (otro.y - alt2Y)**2);
            
            // Elegir el lado con más espacio
            if (dist1 > distanciaMinima && dist1 > dist2) {
                npc.x = alt1X;
                npc.y = alt1Y;
            } else if (dist2 > distanciaMinima) {
                npc.x = alt2X;
                npc.y = alt2Y;
            }
            break;
        }
    }
    
    // PASO 8: Aplicar movimiento si es posible
    if (puedeMoverse) {
        npc.x = nuevaX;
        npc.y = nuevaY;
        
        // Mantener dentro de límites del mapa
        npc.x = Math.max(0, Math.min(anchoMapa, npc.x));
        npc.y = Math.max(0, Math.min(altoMapa, npc.y));
    }
    
    // PASO 9: Actualizar visualización
    actualizarPosicionVisual(npc);
}
```

---

## 🎯 ZONAS ESPECIALES

### Definir una Zona Especial

```javascript
// Ejemplo: Zona donde deben respetar orden de llegada
function enZonaEspecial() {
    // Definir por checkpoints
    return this.currentTarget === indiceDeLaZona;
    
    // O definir por coordenadas
    // return this.x >= zonaX1 && this.x <= zonaX2 && 
    //        this.y >= zonaY1 && this.y <= zonaY2;
}
```

### Sistema de Cola Ordenada

```javascript
// AL ENTRAR a la zona especial
if (npc.currentTarget === indiceEntradaZona) {
    if (npc.queuePosition === null) {
        // Asignar número de cola
        let maxCola = 0;
        for (let otro of todosLosNPCs) {
            if (otro.queuePosition !== null && otro.queuePosition > maxCola) {
                maxCola = otro.queuePosition;
            }
        }
        npc.queuePosition = maxCola + 1;
    }
}

// DURANTE la zona especial: NO ADELANTAR
if (npc.enZonaEspecial()) {
    for (let otro of todosLosNPCs) {
        if (!otro.enZonaEspecial()) continue;
        if (otro.id === npc.id) continue;
        
        // Si otro llegó ANTES (menor queuePosition)
        if (otro.queuePosition < npc.queuePosition) {
            const dx2 = otro.x - npc.x;
            const dy2 = otro.y - npc.y;
            const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            
            // ¿Está adelante?
            const dotProduct = (dx2 * dx + dy2 * dy);
            
            if (dist < 80 && dotProduct > 0) {
                return; // DETENER, no adelantar
            }
        }
    }
}

// AL SALIR de la zona especial
if (npc.currentTarget === indiceSalidaZona) {
    npc.queuePosition = null; // Limpiar
}
```

### Ejemplo: Zigzag tipo Aeropuerto

```javascript
// Definir checkpoints intermedios del zigzag
const checkpointsZigzag = [
    {x: 500, y: 600, name: 'Z1'},  // Entrada
    {x: 450, y: 600, name: 'Z2'},  // Ir izquierda
    {x: 450, y: 580, name: 'Z3'},  // Bajar
    {x: 500, y: 580, name: 'Z4'},  // Ir derecha
    {x: 500, y: 560, name: 'Z5'},  // Bajar
    {x: 450, y: 560, name: 'Z6'},  // Ir izquierda
    // ... más zigzags
];

// Insertar estos checkpoints entre B y C en tu array principal
const checkpoints = [
    ...checkpointsAntesDeB,
    checkpointB,
    ...checkpointsZigzag,
    checkpointC,
    ...checkpointsDespuesDeC
];

// Dibujar paredes visuales (opcional)
function dibujarParedesZigzag() {
    // Paredes horizontales
    dibujarPared(440, 610, 70, 3);  // Superior carril 1
    dibujarPared(440, 590, 70, 3);  // Inferior carril 1
    // ... más paredes
    
    // Paredes verticales
    dibujarPared(440, 560, 3, 50);  // Izquierda
    dibujarPared(510, 560, 3, 50);  // Derecha
}
```

---

## 🎨 VISUALIZACIÓN

### CSS para Prioridades

```css
/* NPC base */
.npc {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 3px;
    transition: all 0.2s ease;
    box-shadow: 0 0 10px rgba(255,255,255,0.3);
}

/* Prioridad 1 - Oro brillante */
.npc.prioridad-1 {
    box-shadow: 0 0 30px #ffd700, 0 0 50px #ffd700;
    transform: scale(1.3);
    border: 3px solid #ffd700;
    z-index: 100;
}

/* Prioridad 2 - Plata */
.npc.prioridad-2 {
    box-shadow: 0 0 20px #c0c0c0, 0 0 35px #c0c0c0;
    transform: scale(1.2);
    border: 2px solid #c0c0c0;
    z-index: 90;
}

/* Prioridad 3 - Bronce */
.npc.prioridad-3 {
    box-shadow: 0 0 15px #cd7f32;
    transform: scale(1.1);
    border: 2px solid #cd7f32;
    z-index: 80;
}

/* Prioridad 4+ - Suave */
.npc.prioridad-baja {
    opacity: 0.9;
    z-index: 70;
}
```

### Actualizar Estilos Dinámicamente

```javascript
actualizarEstiloPrioridad() {
    // Limpiar clases previas
    this.element.classList.remove('prioridad-1', 'prioridad-2', 
                                   'prioridad-3', 'prioridad-baja');
    
    // Aplicar clase según prioridad
    if (this.prioridad === 1) {
        this.element.classList.add('prioridad-1');
    } else if (this.prioridad === 2) {
        this.element.classList.add('prioridad-2');
    } else if (this.prioridad === 3) {
        this.element.classList.add('prioridad-3');
    } else if (this.prioridad !== null && this.prioridad > 3) {
        this.element.classList.add('prioridad-baja');
    }
}
```

---

## 🤖 PROMPT DE IMPLEMENTACIÓN

### Prompt Inicial para IA

```
Necesito implementar un sistema de navegación para NPCs con jerarquía de prioridades.

CONTEXTO:
- Tengo NPCs que deben navegar por checkpoints
- Quiero evitar bloqueos permanentes
- Cuando varios NPCs se encuentran, deben formar un "cluster" jerárquico
- Los de mayor prioridad pueden "traspasar" a los de menor prioridad

CARACTERÍSTICAS DEL SISTEMA:
1. Los NPCs detectan otros NPCs en un radio de 70 píxeles
2. Si 2+ NPCs están cerca, forman un "cluster"
3. Dentro del cluster, se asignan prioridades numéricas: 1, 2, 3, 4...
4. La prioridad 1 puede traspasar a todos (2, 3, 4...)
5. La prioridad 2 puede traspasar a 3, 4, 5... pero NO al 1
6. Y así sucesivamente

CRITERIO DE PRIORIDAD POR DEFECTO:
- El NPC más RÁPIDO (mayor speed) = Prioridad 1
- Segundo más rápido = Prioridad 2
- Etc.

EXCEPCIONES (zonas especiales):
- Puedo definir zonas donde el criterio cambie
- Ejemplo: En zona D→A, la prioridad se asigna por orden de llegada

¿Puedes implementar este sistema siguiendo la estructura que te voy a proporcionar?

[Pegar aquí las secciones relevantes del documento según necesites]
```

### Prompt para Agregar Zona Especial

```
Necesito agregar una zona especial a mi sistema de navegación actual.

ZONA: Del checkpoint [NOMBRE_A] al checkpoint [NOMBRE_B]

COMPORTAMIENTO ESPECIAL:
- Los NPCs deben [DESCRIBIR COMPORTAMIENTO]
- Ejemplo: "respetar orden de llegada sin adelantarse"
- Ejemplo: "formar una cola en zigzag"

CRITERIO DE PRIORIDAD EN ESTA ZONA:
- [CRITERIO ESPECÍFICO]
- Ejemplo: "El que llegó primero = Prioridad 1"
- Ejemplo: "El que esté más cerca de la salida = Prioridad 1"

Implementa esta zona manteniendo el sistema de prioridades existente.
```

### Prompt para Debugging

```
Mi sistema de navegación tiene el siguiente problema:
[DESCRIBIR PROBLEMA]

Ejemplo: "Los NPCs se quedan atascados en el punto X"
Ejemplo: "Veo múltiples NPCs con Prioridad 1 en el mismo lugar"

Características del sistema actual:
- radioDeteccion: [VALOR]
- minClusters: [VALOR]
- maxClusters: [VALOR]
- Cantidad de NPCs: [NÚMERO]

¿Qué ajustes recomiendas?
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema 1: NPCs se quedan atascados

**Síntomas:**
- Varios NPCs inmóviles en el mismo punto
- No se forman clusters o no se asignan prioridades

**Soluciones:**
1. Aumentar `radioDeteccion` (de 70 a 80-90)
2. Verificar que `gestionarClusters()` se llama cada frame
3. Verificar que `puedeTraspasar()` funciona correctamente
4. Agregar logs: `console.log(npc.id, npc.prioridad, npc.clusterId)`

### Problema 2: Múltiples NPCs con Prioridad 1

**Síntomas:**
- Varios NPCs dorados brillantes en el mismo lugar
- Clusters se forman pero no se unifican

**Soluciones:**
1. Aumentar `radioDeteccion`
2. Procesar NPCs en orden consistente (sort por ID)
3. Verificar que `npcsProcesados` evita duplicados
4. Agregar: `npcsDetectados.sort((a,b) => a.distancia - b.distancia)`

### Problema 3: NPCs no respetan zona especial

**Síntomas:**
- En zona D→A adelantan cuando no deberían
- No se asigna queuePosition

**Soluciones:**
1. Verificar `enZonaEspecial()` retorna true correctamente
2. Asignar `queuePosition` al ENTRAR a la zona
3. Limpiar `queuePosition` al SALIR de la zona
4. Verificar que `asignarPrioridades()` usa el criterio correcto

### Problema 4: NPCs se mueven muy lento/rápido

**Síntomas:**
- Todo el sistema va muy lento o muy rápido
- NPCs se teleportan

**Soluciones:**
1. Ajustar rango de `speed` (recomendado: 0.5 - 2.0)
2. Multiplicar por deltaTime si usas tiempo real
3. Verificar que `requestAnimationFrame` está activo
4. Reducir `distanciaEspera` si esperan demasiado

### Problema 5: Colisiones no funcionan

**Síntomas:**
- NPCs se superponen completamente
- Traspaso funciona mal

**Soluciones:**
1. Verificar que `puedeTraspasar()` retorna boolean correcto
2. Verificar `if (npc.puedeTraspasar(otro)) continue;` en colisiones