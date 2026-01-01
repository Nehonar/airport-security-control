Ticket 2.A.1 – Modelo de cola con slots espaciales
Objetivo

Definir una cola como una secuencia de slots físicos predefinidos en el mapa.

Requisitos

Cada cola tiene:

una lista ordenada de QueueSlot

posiciones fijas en el mundo

Un slot solo puede estar ocupado por un pasajero

Un pasajero solo puede ocupar un slot

Entregable

Estructura de cola con slots visibles (debug o visual simple)

🎫 Ticket 2.A.2 – Asignación de slot a pasajero
Objetivo

Asignar automáticamente un slot libre al pasajero al entrar en la cola.

Requisitos

El primer pasajero ocupa el primer slot libre

Si no hay slots:

el pasajero no entra en la cola

El slot se libera al salir el pasajero

Entregable

Pasajeros correctamente posicionados en cola

🎫 Ticket 2.A.3 – Movimiento hacia slot (sin solapamientos)
Objetivo

Mover pasajeros hacia su slot asignado de forma suave y determinista.

Requisitos

El pasajero:

se mueve hacia la posición del slot

se detiene al llegar (epsilon configurable)

No puede:

atravesar a otros pasajeros

ocupar slots ajenos

Entregable

Movimiento estable sin pisarse

🎫 Ticket 2.A.4 – Avance de la cola
Objetivo

Hacer avanzar la cola cuando el primer slot se libera.

Requisitos

Al liberar un slot:

los pasajeros avanzan al siguiente slot

El avance:

respeta orden

no teleporta

usa movimiento normal

Entregable

Cola avanza visualmente de forma natural

🎫 Ticket 2.A.5 – Interacción jugador ↔ pasajeros
Objetivo

Definir reglas claras de prioridad espacial entre jugador y pasajeros.

Requisitos

El jugador tiene prioridad:

nunca queda bloqueado

Los pasajeros:

se detienen si el jugador invade su trayectoria

o aplican un offset mínimo para rodear

No se permite empujar al jugador

Entregable

Movimiento seguro sin glitches

🎫 Ticket 2.A.6 – Render y depuración de colas
Objetivo

Hacer visible la estructura de la cola para testeo.

Requisitos

Render simple:

slots

líneas de dirección

Fácil de activar/desactivar

Entregable

Herramienta visual de debug


###########

MODELO DEFINITIVO – SISTEMA DE BANDEJAS (FASE 2.B)
📌 Principios congelados

Las bandejas son un recurso FINITO

Todas las bandejas existen desde el inicio

No se crean ni destruyen durante la partida

La dificultad se controla por cantidad de bandejas

Nada es automático: el jugador es el cuello de botella

Hay límites duros en todos los puntos del sistema

Esto es diseño de sistema de verdad.

📦 Cantidades base (tutorial – configurables)

Total de bandejas del sistema: 100

Máximo delante (ZONA 2): 50

Montones delante: 5

Bandejas por montón: 10

Capacidad de carga del jugador: 8

Interacción manual:

Recoger → tecla E

Depositar → tecla F

📌 Todo esto debe ser configuración, no hardcode.

🔁 Flujo completo (definitivo)
[ ZONA 2 ]
Montones (máx 50)
  ↓ pasajeros toman bandejas
  ↓
Cinta principal
  ↓
[ ZONA 3 ]
Pasajeros vacían
Bandejas abandonadas
  ↓ jugador recoge (E)
Jugador carga (máx 8)
  ↓
Cinta retorno (F)
  ↓
Cinta acumula (máx 50)
  ↓
Jugador recoge (E)
  ↓
Reparte en montones ZONA 2 (F)


Si cualquier punto se llena → bloqueo aguas arriba.

🟨 FASE 2.B – Bandejas y cintas (REESCRITA Y CONGELADA)
🎫 Ticket 2.B.1 – Pool global de bandejas (recurso finito)
🎯 Objetivo

Crear todas las bandejas al iniciar la partida como recurso global limitado.

Requisitos

Se generan N bandejas al inicio

N es configurable (ej. 100)

Las bandejas:

nunca se destruyen

nunca se crean nuevas

Cada bandeja tiene id único

Entregable

Pool global estable de bandejas

🎫 Ticket 2.B.2 – Montones iniciales en ZONA 2
🎯 Objetivo

Distribuir las bandejas delanteras en montones físicos.

Requisitos

En ZONA 2 existen:

maxFrontTrays (ej. 50)

repartidas en pileCount montones (ej. 5)

Cada montón:

capacidad fija (ej. 10)

posición fija en el mapa

Las bandejas se representan físicamente

Entregable

Montones visibles y ocupables

🎫 Ticket 2.B.3 – Pasajeros toman bandejas de montones
🎯 Objetivo

Permitir que los pasajeros consuman bandejas disponibles.

Requisitos

Al prepararse:

el pasajero toma 1–3 bandejas

Las bandejas:

se retiran físicamente del montón

Si no hay suficientes bandejas:

el pasajero espera

no avanza

Entregable

Consumo real de bandejas

🎫 Ticket 2.B.4 – Cinta principal ZONA 2 → ZONA 3
🎯 Objetivo

Mover bandejas usadas hacia ZONA 3.

Requisitos

Cinta con capacidad finita

Las bandejas:

entran en cola si la cinta está llena

Movimiento continuo

No afecta al pasajero

Entregable

Acumulación y retrasos visibles

🎫 Ticket 2.B.5 – Bandejas abandonadas en ZONA 3
🎯 Objetivo

Gestionar el abandono tras uso.

Requisitos

Tras vaciar:

las bandejas se dejan en mesas o suelo

Estado: ABANDONED

No vuelven solas

Entregable

Zona trasera saturable

Ticket 2.B.6 – Recogida manual por el jugador (E)
Añadir reglas obligatorias

Restricciones nuevas

El jugador:

NO puede cambiar de zona si lleva bandejas

Si intenta cruzar:

la acción se bloquea

(feedback mínimo: sonido / mensaje)

🔧 Actualización Ticket 2.B.7 – Cinta de retorno ZONA 3 → ZONA 2 (F)
Aclaración crítica

Único punto válido en ZONA 3 para soltar bandejas

Al pulsar F:

todas las bandejas cargadas se depositan

pasan a la cinta de retorno

Si la cinta está llena:

no se permite soltar

el jugador sigue cargando

🔧 Actualización Ticket 2.B.9 – Reparto manual en montones (F)
Aclaración crítica

Único punto válido en ZONA 2 para soltar bandejas

El área de reparto:

está cerca de pasajeros

representa el “hueco bajo la cinta”

Al pulsar F:

las bandejas se reparten automáticamente en montones con espacio

Si todos los montones están llenos:

no se permite soltar

🆕 Ticket NUEVO 2.B.10 – Restricción de cruce de zonas con bandejas

(este merece ticket propio)

🎯 Objetivo

Impedir que el jugador transporte bandejas entre zonas.

Requisitos

Si player.carriedTrays > 0:

el jugador NO puede activar transición de zona

La transición:

se bloquea limpiamente

sin soltar bandejas automáticamente

Entregable

Regla dura funcionando

Sin glitches de cámara ni estado

#############


🎫 Ticket 2.C.1 – Entidad Arco (estado y contrato)
🎯 Objetivo

Definir el arco como entidad independiente con estado interno.

Modelo
Gate {
  state: IDLE | BUSY
  processingTime
  currentPassenger?: Passenger
}

Requisitos

El arco:

solo acepta pasajeros cuando está IDLE

pasa a BUSY al iniciar procesamiento

Mientras está BUSY:

no acepta nuevos pasajeros

El arco no referencia bandejas ni pasajeros fuera del actual

Entregable

Arco con estado visible (debug)

🎫 Ticket 2.C.2 – Cola previa al arco (slots espaciales)
🎯 Objetivo

Implementar una cola física previa al arco sin solapamientos.

Requisitos

La cola:

se define con QueueSlot[] (como en 2.A)

tiene capacidad configurable

Solo el primer slot puede acceder al arco

Los pasajeros:

se mueven a su slot

no empujan

no se solapan

Entregable

Entrada ordenada al arco

🎫 Ticket 2.C.3 – Inicio de procesamiento en el arco
🎯 Objetivo

Transferir correctamente un pasajero del slot frontal al arco.

Requisitos

Cuando:

arco está IDLE

y el slot frontal está ocupado

Entonces:

el pasajero se mueve al punto del arco

se asigna como currentPassenger

el arco pasa a BUSY

Restricciones

No se permite:

teleport

doble asignación

pérdida de referencia

Entregable

Inicio de procesamiento estable

🎫 Ticket 2.C.4 – Procesamiento con latencia (paso por arco)
🎯 Objetivo

Simular el tiempo de paso por el arco.

Requisitos

Cada pasajero tiene gateProcessingTime

Durante el procesamiento:

el pasajero no se mueve

el arco permanece BUSY

Al terminar:

el pasajero sale del arco

el arco vuelve a IDLE

currentPassenger se libera

Entregable

Paso no instantáneo, sin bloqueos

🎫 Ticket 2.C.5 – Área de espera post-arco (desacoplamiento)
🎯 Objetivo

Evitar que el arco se bloquee esperando bandejas.

Requisitos

Tras salir del arco:

el pasajero se mueve automáticamente

a un área de espera secundaria

El área:

tiene slots espaciales

capacidad suficiente (configurable)

El pasajero:

espera allí hasta que lleguen TODAS sus bandejas

Restricciones

El pasajero nunca se queda en la salida del arco

El arco queda libre inmediatamente

Entregable

Flujo continuo sin deadlock

🎫 Ticket 2.C.6 – Sincronización pasajero ↔ bandejas
🎯 Objetivo

Reunir correctamente al pasajero con sus bandejas en ZONA 3.

Requisitos

El pasajero:

monitorea sus bandejas (ownerPassengerId)

Cuando TODAS llegan a ZONA 3:

el pasajero abandona el área de espera

se mueve a recogerlas

No hay timeout

No hay fallo

Entregable

Reencuentro correcto y determinista

🎫 Ticket 2.C.7 – Salida final del pasajero (fin de ciclo físico)
🎯 Objetivo

Cerrar el ciclo de vida físico del pasajero.

Requisitos

Tras vaciar bandejas:

el pasajero se mueve a una salida

desaparece del sistema

No se evalúa outcome

No se registra scoring

Entregable

Pasajeros saliendo limpiamente

🎫 Ticket 2.C.8 – Invariantes y protecciones (anti-bugs)
🎯 Objetivo

Evitar estados imposibles y bugs silenciosos.

Invariantes obligatorios

Un pasajero:

solo puede estar en un sistema a la vez

El arco:

solo puede tener un currentPassenger

Un pasajero:

no puede entrar al arco si no está en el primer slot

El arco:

nunca referencia bandejas

Entregable

Asserts o logs de validación activos en debug

🚫 Qué NO se hace en FASE 2.C (bloqueado)

❌ Cacheos
❌ Alarmas
❌ Fallos
❌ Penalizaciones
❌ Uso de isValid, decision, outcome
❌ Múltiples arcos