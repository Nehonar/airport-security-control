Actúa como un ingeniero senior de videojuegos y software architect.

Estamos desarrollando un juego de gestión en HTML5 (Canvas 2D + JavaScript ES6,
sin frameworks externos), con una arquitectura modular ya existente
(FASE 0 completada).

OBJETIVO DE LA FASE
Implementar el sistema de inspección de documentos en la ZONA 1
(control de acceso), manteniendo el mundo completamente activo.

CONTEXTO CLAVE (NO ROMPER)
- El juego tiene un único mapa lógico
- Todas las zonas se simulan siempre
- La cámara NO sigue al jugador
- La cámara NO cambia durante la inspección
- La ZONA 1 tiene dos áreas físicas:
  1) Fila de pasajeros
  2) Puesto de inspección (barrera)
- La inspección solo se activa si el jugador está físicamente en el puesto
- La fila de pasajeros sigue visible y activa durante la inspección

INTERACTION MODE
- Al interactuar con la barrera:
  - interactionMode = DOCUMENT_INSPECTION
  - Aparece una UI overlay
  - El movimiento del jugador se bloquea
  - El mundo NO se pausa

MODELO DE DATOS MÍNIMO

Flight:
- id
- destination
- departureTime
- status (ON_TIME | DELAYED | CLOSED | CANCELLED)

Passenger:
- id
- name
- flightId

BoardingPass:
- passengerName
- flightId

Passport:
- passengerName

UI DE INSPECCIÓN (OVERLAY)
Debe mostrar simultáneamente:
1) Boarding pass del pasajero actual
2) Pasaporte del pasajero actual
3) Pantalla global de vuelos del día:
   - Lista de vuelos
   - Hora
   - Estado

REGLAS DE DECISIÓN
Un pasajero puede ser ACEPTADO si:
- El vuelo existe
- El nombre del boarding pass coincide con el pasaporte
- El vuelo NO está CLOSED ni CANCELLED

En cualquier otro caso debe ser RECHAZADO.

FLUJO DE INSPECCIÓN
1) El pasajero llega al frente de la cola
2) El jugador interactúa con la barrera
3) Se activa DOCUMENT_INSPECTION
4) Se muestra la UI de inspección
5) El jugador decide ACEPTAR o RECHAZAR
6) La UI se cierra
7) El pasajero sale de la cola
8) Se notifica el resultado al sistema de colas

ARQUITECTURA OBLIGATORIA
- Crear un InspectionSystem independiente
- No mezclar renderizado con lógica
- La UI debe ser desacoplada del estado del juego
- Usar eventos o callbacks claros entre sistemas

NO INCLUIR EN ESTA FASE
- Economía
- Penalizaciones
- Balance final
- Efectos visuales avanzados
- Sonido
- Automatizaciones

ENTREGABLE
- Sistema funcional de inspección de documentos
- UI overlay básica (HTML/CSS o Canvas)
- Flujo completo con pasajeros dummy
- Código limpio y extensible
