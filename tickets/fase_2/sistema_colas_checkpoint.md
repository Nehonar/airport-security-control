SISTEMA DE FILAS CON CHECKPOINT DUAL
Sistema de filas ordenadas con punto de entrada y punto de servicio para NPCs

📋 CONCEPTO GENERAL
Este sistema permite crear filas ordenadas donde los NPCs:

Llegan a un punto de entrada
Se posicionan en fila ordenada según orden de llegada
Avanzan gradualmente cuando otros terminan
El primero llega al punto de servicio (checkpoint interno)
Es atendido y luego sale

Ventaja clave: Los NPCs hacen fila ANTES de llegar al checkpoint, no se amontonan sobre él.

🏗️ ESTRUCTURA DE CHECKPOINT CON FILA
Propiedades del Checkpoint
javascriptconst checkpoint = {
    // IDENTIFICACIÓN
    name: 'NombreCheckpoint',
    tipo: 'espera',  // Indica que este checkpoint tiene sistema de fila
    
    // TIMING
    tiempoMin: 2000,  // Milisegundos mínimos de espera
    tiempoMax: 5000,  // Milisegundos máximos de espera
    
    // NAVEGACIÓN
    siguiente: 'ProximoCheckpoint',  // O array ['Opcion1', 'Opcion2']
    
    // === SISTEMA DE FILA ===
    
    // 1. PUNTO DE ENTRADA (donde llegan los NPCs)
    entradaFilaX: 300,
    entradaFilaY: 500,
    
    // 2. PUNTO DE SERVICIO (checkpoint interno donde son atendidos)
    puntoServicioX: 300,
    puntoServicioY: 350,
    
    // 3. DIRECCIÓN DE LA FILA
    filaDir: 'vertical',  // o 'horizontal'
    
    // 4. ESPACIADO EN LA FILA
    filaOffset: -35  // Distancia entre cada persona (negativo/positivo según dirección)
};
Explicación de Direcciones
VERTICAL (filaDir: 'vertical')

La fila se forma en el eje Y
filaOffset negativo → fila hacia ARRIBA ↑
filaOffset positivo → fila hacia ABAJO ↓

HORIZONTAL (filaDir: 'horizontal')

La fila se forma en el eje X
filaOffset negativo → fila hacia IZQUIERDA ←
filaOffset positivo → fila hacia DERECHA →


👤 PROPIEDADES DEL NPC
javascriptclass NPC {
    constructor() {
        // Propiedades para sistema de fila
        this.esperando = false;      // ¿Está en la fila esperando?
        this.enServicio = false;     // ¿Está siendo atendido en el punto de servicio?
        this.ordenLlegada = null;    // Número único de orden de llegada
        this.tiempoEsperaRestante = 0;  // Milisegundos restantes de servicio
    }
}

🔄 FLUJO COMPLETO DEL SISTEMA
FASE 1: Llegada al Checkpoint
javascript// El NPC se dirige a la ENTRADA de la fila, NO al punto de servicio
let targetX = checkpoint.entradaFilaX;
let targetY = checkpoint.entradaFilaY;

// Cuando llega a la entrada (distancia < 25):
if (distance < 25) {
    // Asignar orden de llegada ÚNICO
    const maxOrden = Math.max(
        0, 
        ...todosLosNPCs
            .filter(n => n.ordenLlegada !== null)
            .map(n => n.ordenLlegada)
    );
    
    npc.ordenLlegada = maxOrden + 1;  // Incrementar
    npc.esperando = true;
}
IMPORTANTE: ordenLlegada es un número único global que nunca se repite. Garantiza el orden correcto.

FASE 2: Posicionamiento en Fila
javascriptif (npc.esperando && !npc.enServicio) {
    // Contar cuántos están DELANTE (incluyendo quien está en servicio)
    const npcsAdelante = todosLosNPCs.filter(otro => 
        otro.currentTarget === npc.currentTarget && 
        (otro.esperando || otro.enServicio) &&
        otro.ordenLlegada < npc.ordenLlegada  // ← CLAVE: orden de llegada
    ).length;
    
    // Verificar si hay alguien en servicio
    const hayAlguienEnServicio = todosLosNPCs.some(otro => 
        otro.currentTarget === npc.currentTarget && 
        otro.enServicio
    );
    
    // Soy el primero si no hay nadie adelante Y nadie en servicio
    const soyElPrimero = (npcsAdelante === 0 && !hayAlguienEnServicio);
    
    if (soyElPrimero) {
        // IR AL PUNTO DE SERVICIO
        // (Ver siguiente sección)
    } else {
        // QUEDARME EN LA FILA
        // (Ver sección de cálculo de posición)
    }
}

FASE 3: Cálculo de Posición en Fila
javascript// Ajustar posición: si hay alguien en servicio, no cuenta como espacio físico
let posicionFisica = npcsAdelante;
if (hayAlguienEnServicio) {
    posicionFisica = npcsAdelante - 1;
}

// Calcular coordenadas según dirección
let targetX, targetY;

if (checkpoint.filaDir === 'vertical') {
    // Fila vertical (eje Y)
    targetX = checkpoint.entradaFilaX;
    targetY = checkpoint.entradaFilaY + (checkpoint.filaOffset * posicionFisica);
    
} else {
    // Fila horizontal (eje X)
    targetX = checkpoint.entradaFilaX + (checkpoint.filaOffset * posicionFisica);
    targetY = checkpoint.entradaFilaY;
}

// Moverse SUAVEMENTE hacia esa posición
const dx = targetX - npc.x;
const dy = targetY - npc.y;
const dist = Math.sqrt(dx * dx + dy * dy);

if (dist > 2) {
    npc.x += (dx / dist) * Math.min(npc.speed * 0.8, dist);
    npc.y += (dy / dist) * Math.min(npc.speed * 0.8, dist);
} else {
    npc.x = targetX;
    npc.y = targetY;
}
Resultado: El NPC se mueve suavemente a su posición en la fila y avanza cuando otros se van.

FASE 4: Avance al Punto de Servicio
javascript// Solo el PRIMERO de la fila puede avanzar
if (soyElPrimero) {
    // Moverse al punto de servicio
    const dx = checkpoint.puntoServicioX - npc.x;
    const dy = checkpoint.puntoServicioY - npc.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 5) {
        // LLEGÓ al punto de servicio
        npc.x = checkpoint.puntoServicioX;
        npc.y = checkpoint.puntoServicioY;
        npc.enServicio = true;
        
        // Asignar tiempo de espera aleatorio
        npc.tiempoEsperaRestante = checkpoint.tiempoMin + 
            Math.random() * (checkpoint.tiempoMax - checkpoint.tiempoMin);
        
    } else {
        // Moverse hacia el punto de servicio
        npc.x += (dx / dist) * npc.speed * 0.8;
        npc.y += (dy / dist) * npc.speed * 0.8;
    }
}

FASE 5: Servicio (Espera en el Checkpoint)
javascriptif (npc.enServicio) {
    // MANTENER posición fija en el punto de servicio
    npc.x = checkpoint.puntoServicioX;
    npc.y = checkpoint.puntoServicioY;
    
    // Reducir tiempo de espera
    npc.tiempoEsperaRestante -= deltaTime;  // deltaTime en milisegundos
    
    if (npc.tiempoEsperaRestante <= 0) {
        // TERMINAR servicio
        npc.esperando = false;
        npc.enServicio = false;
        npc.ordenLlegada = null;
        
        // Decidir siguiente checkpoint
        npc.currentTarget = checkpoint.siguiente;
    }
}

🎨 VISUALIZACIÓN RECOMENDADA
CSS para Estados
css/* NPC normal */
.npc {
    width: 20px;
    height: 20px;
    transition: all 0.15s ease;
}

/* NPC esperando en fila */
.npc.esperando {
    animation: pulse 1.5s infinite;
    opacity: 0.8;
}

/* NPC siendo atendido */
.npc.en-servicio {
    animation: glow 1s infinite;
    opacity: 1;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(0.85); }
}

@keyframes glow {
    0%, 100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
    50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
}
Guías Visuales Opcionales
html<!-- Mostrar área de fila -->
<div class="fila-guia" style="
    position: absolute;
    left: [entradaFilaX]px; 
    top: [entradaFilaY]px;
    width: [si horizontal]px;
    height: [si vertical]px;
    background: rgba(255, 107, 107, 0.1);
    border: 1px dashed rgba(255, 107, 107, 0.3);
"></div>

📊 CONTADOR DE NPCS EN CHECKPOINT
javascriptfunction contarNPCsEnCheckpoint(nombreCheckpoint, todosLosNPCs) {
    return todosLosNPCs.filter(npc => 
        npc.currentTarget === nombreCheckpoint &&
        (npc.esperando || npc.enServicio)
    ).length;
}

// Mostrar en UI
document.getElementById('count-checkpoint').textContent = 
    contarNPCsEnCheckpoint('MiCheckpoint', npcs);

⚙️ PARÁMETROS AJUSTABLES
ParámetroEfectoRecomendaciónfilaOffsetEspaciado entre NPCs30-40 píxelestiempoMin/MaxDuración del servicio2000-5000ms (C/D), 5000-9000ms (E/F)speed * 0.8Velocidad en fila80% de velocidad normaldist < 5Precisión de llegada5-10 píxelesdist > 2Suavizado de movimiento2-5 píxeles

🔍 DEBUGGING
Logs útiles
javascriptconsole.log(`NPC ${npc.id}: Orden=${npc.ordenLlegada}, Esperando=${npc.esperando}, EnServicio=${npc.enServicio}`);

// Ver quién está adelante
const adelante = npcs.filter(n => 
    n.ordenLlegada !== null && 
    n.ordenLlegada < npc.ordenLlegada
);
console.log(`NPCs adelante:`, adelante.map(n => n.id));
Problemas comunes
NPCs se teletransportan:

Movimiento debe ser gradual con Math.min(speed, dist)
No asignar posición directamente, usar incrementos

Orden incorrecto en fila:

Verificar que ordenLlegada es único y global
Incluir enServicio en el filtro de NPCs adelante

NPCs se amontonan:

Ajustar filaOffset (aumentar espaciado)
Verificar dirección correcta (negativo/positivo)


📝 EJEMPLO DE USO COMPLETO
javascript// 1. DEFINIR CHECKPOINT
const miCheckpoint = {
    name: 'MesaAtencion',
    tipo: 'espera',
    tiempoMin: 3000,
    tiempoMax: 6000,
    siguiente: 'Salida',
    
    // Entrada: Parte superior
    entradaFilaX: 400,
    entradaFilaY: 200,
    
    // Servicio: Parte inferior
    puntoServicioX: 400,
    puntoServicioY: 350,
    
    // Fila vertical hacia arriba
    filaDir: 'vertical',
    filaOffset: -35
};

// 2. EN EL MOVE DEL NPC
if (npc.enServicio) {
    // Fase de servicio
    npc.x = checkpoint.puntoServicioX;
    npc.y = checkpoint.puntoServicioY;
    npc.tiempoEsperaRestante -= deltaTime;
    
    if (npc.tiempoEsperaRestante <= 0) {
        npc.enServicio = false;
        npc.esperando = false;
        npc.ordenLlegada = null;
        npc.currentTarget = checkpoint.siguiente;
    }
    
} else if (npc.esperando) {
    // Fase de fila
    const npcsAdelante = npcs.filter(n => 
        n.currentTarget === npc.currentTarget &&
        (n.esperando || n.enServicio) &&
        n.ordenLlegada < npc.ordenLlegada
    ).length;
    
    const hayEnServicio = npcs.some(n => 
        n.currentTarget === npc.currentTarget && 
        n.enServicio
    );
    
    if (npcsAdelante === 0 && !hayEnServicio) {
        // Avanzar a servicio
        const dx = checkpoint.puntoServicioX - npc.x;
        const dy = checkpoint.puntoServicioY - npc.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 5) {
            npc.enServicio = true;
            npc.tiempoEsperaRestante = checkpoint.tiempoMin + 
                Math.random() * (checkpoint.tiempoMax - checkpoint.tiempoMin);
        } else {
            npc.x += (dx/dist) * npc.speed * 0.8;
            npc.y += (dy/dist) * npc.speed * 0.8;
        }
    } else {
        // Posicionarse en fila
        let pos = hayEnServicio ? npcsAdelante - 1 : npcsAdelante;
        let tx, ty;
        
        if (checkpoint.filaDir === 'vertical') {
            tx = checkpoint.entradaFilaX;
            ty = checkpoint.entradaFilaY + checkpoint.filaOffset * pos;
        } else {
            tx = checkpoint.entradaFilaX + checkpoint.filaOffset * pos;
            ty = checkpoint.entradaFilaY;
        }
        
        const dx = tx - npc.x;
        const dy = ty - npc.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 2) {
            npc.x += (dx/dist) * Math.min(npc.speed * 0.8, dist);
            npc.y += (dy/dist) * Math.min(npc.speed * 0.8, dist);
        }
    }
    
} else {
    // Fase de llegada
    let tx = checkpoint.entradaFilaX;
    let ty = checkpoint.entradaFilaY;
    
    const dx = tx - npc.x;
    const dy = ty - npc.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < 25) {
        // Entrar en la fila
        const maxOrden = Math.max(0, ...npcs
            .filter(n => n.ordenLlegada !== null)
            .map(n => n.ordenLlegada));
        
        npc.ordenLlegada = maxOrden + 1;
        npc.esperando = true;
    }
}

🎯 RESUMEN DE VENTAJAS
✅ No hay teletransporte: Todo movimiento es suave y gradual
✅ Orden garantizado: ordenLlegada único evita conflictos
✅ Escalable: Funciona con 5 o 500 NPCs
✅ Visual claro: Se ve quién espera vs quién está siendo atendido
✅ Flexible: Fácil de adaptar a cualquier dirección o checkpoint
✅ Auto-compactación: La fila avanza automáticamente cuando alguien sale

📐 CHECKLIST DE IMPLEMENTACIÓN

 Definir propiedades del checkpoint (entrada, servicio, dirección, offset)
 Agregar propiedades al NPC (esperando, enServicio, ordenLlegada)
 Implementar asignación de ordenLlegada única
 Calcular posición en fila según NPCs adelante
 Implementar movimiento suave (no teleport)
 Detectar si soy el primero (incluir check de enServicio)
 Implementar avance al punto de servicio
 Implementar countdown de tiempo de servicio
 Limpiar estado al salir (ordenLlegada = null)
 Agregar CSS para visualización (opcional)
 Testing con diferentes cantidades de NPCs


🚀 PRÓXIMOS PASOS
Una vez implementado el sistema básico, puedes:

Combinar con sistema de prioridades (algunos adelantan en la fila)
Añadir múltiples puntos de servicio (varias cajas/ventanillas paralelas)
Implementar VIP/Express (filas especiales más rápidas)
Agregar animaciones (sentarse, hablar, etc. mientras esperan)
Sistemas de deserción (abandonar fila si espera demasiado)