FASE 2 – Flujo físico, colas y backpressure
🎯 Objetivo de la fase

Implementar el flujo físico completo de pasajeros y bandejas a través del sistema de seguridad del aeropuerto, con:

colas con capacidad finita

recursos compartidos (bandejas)

tiempos de espera reales

backpressure que se propaga entre zonas

👉 Sin scoring, sin penalizaciones, sin fallos.
Solo comportamiento sistémico observable.

📌 Principios rectores (congelados)

Nada es instantáneo

Nada es infinito

Nada se teleporta

Los errores se pagan con tiempo y congestión, no con castigos

Los sistemas están desacoplados:

inspección ≠ arco ≠ bandejas ≠ cinta

FASE 2 no usa:

isValid

decision

outcome

🧠 Modelo mental global (FASE 2)
ZONA 1
  Spawn
  Cola entrada
  Inspección
     ↓
ZONA 2
  Cola pre-bandejas
  Preparación (dejar objetos)
  Cinta → ZONA 3
  Arco
  Área espera post-arco
     ↓
ZONA 3
  Llegada bandejas
  Pasajero espera bandejas
  Mesas
  Abandono bandejas
  Salida pasajero
     ↓
Bandejas quedan → jugador las recoge → cinta retorno

🧩 División de FASE 2
FASE 2.A – Colas y flujo de pasajeros

(sin bandejas aún)

FASE 2.B – Cinta y bandejas

(recurso físico, propiedad y retorno)

FASE 2.C – Arco y áreas de espera

(latencia y desacoplamiento)

Cada subfase no rompe la anterior.