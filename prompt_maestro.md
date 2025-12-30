Actúa como un ingeniero senior de videojuegos y software architect.

Estás desarrollando un juego casual de gestión en HTML5
(usando Canvas 2D y JavaScript ES6+, sin frameworks externos).

OBJETIVO GENERAL
Crear un juego de gestión de flujos en un aeropuerto, donde el jugador
controla indirectamente el sistema gestionando pasajeros y bandejas
a través de tres zonas conectadas.

REGLAS CLAVE (NO ROMPER)
- El mundo es único y persistente
- Todas las zonas se simulan siempre (aunque no estén en cámara)
- La cámara es discreta por zonas (no sigue al jugador)
- El jugador se mueve libremente
- El juego funciona por tiempo limitado (ej. 5 minutos)
- Objetivo: procesar X pasajeros antes de que acabe el tiempo

ZONAS DEL JUEGO
1. Control de documentos
2. Zona de arcos y bandejas
3. Zona trasera de recogida de bandejas

ARQUITECTURA OBLIGATORIA
Separar estrictamente:
- Game Loop
- Estado del juego
- Lógica (sistemas)
- Entidades
- Renderizado
- Input
- Cámara
- Gestión de zonas

Nada de lógica mezclada con render.

TECNOLOGÍA
- index.html
- Canvas 2D
- JavaScript modular (ES modules)
- Sin librerías externas
- Código legible y extensible

FORMA DE TRABAJO
El desarrollo se divide en FASES.
Cada fase:
- Tiene objetivo claro
- Tiene entregable funcional
- No incluye lógica futura
- No adelanta contenido

Si algo no está definido:
- NO asumas
- Pide aclaración
