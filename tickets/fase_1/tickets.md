Ticket 1.1 – Modelo de vuelos global

Objetivo

Crear estructura Flight

Lista global de vuelos

Estados simulados (pueden cambiar con el tiempo)

Entregable

Lista visible en consola o UI dummy

🎫 Ticket 1.2 – UI de vuelos

Objetivo

Panel overlay con lista de vuelos

Mostrar hora y estado

Entregable

Panel visible y actualizado

🎫 Ticket 1.3 – Pasajero + documentos

Objetivo

Asociar a cada pasajero:

Boarding pass

Pasaporte

Datos coherentes o erróneos (dummy)

Entregable

Datos accesibles desde InspectionSystem

🎫 Ticket 1.4 – Área física de inspección

Objetivo

Definir InteractionArea en la ZONA 1

Detectar si el jugador está en el puesto

Entregable

Log o indicador de “puede inspeccionar”

👉 Este ticket es NUEVO
No estaba explícito antes y es importante hacerlo bien.

🎫 Ticket 1.5 – Activación del InspectionMode

Objetivo

Interactuar con la barrera

Bloquear movimiento del jugador

Activar UI overlay

Entregable

Entrada y salida limpia del modo inspección

🎫 Ticket 1.6 – Decisión aceptar / rechazar

Objetivo

Input para aceptar o rechazar

Validación de reglas

Retirar pasajero de la cola

Entregable

Flujo completo con resultado visible

Ticket 1.7 – SupervisorSystem (solo avisos)

Este puede hacerse al final de FASE 1 o inicio de FASE 2, pero ya lo dejamos definido.

Objetivo

Emitir mensajes contextuales al jugador.

Requisitos

Sistema independiente

Basado en métricas simples (dummy al inicio)

Mensajes en texto overlay

Entregable

Al menos 2 avisos funcionando

Ticket 1.8 – Marcado de validez del pasajero (dominio)
🎯 Objetivo

Registrar de forma explícita si un pasajero es válido o no válido durante el
proceso de inspección, sin alterar su comportamiento en el juego.

Este ticket NO introduce penalizaciones ni consecuencias.
Solo añade información de dominio que será utilizada en fases posteriores.

🧠 Contexto

Durante la inspección de documentos (FASE 1), el jugador puede aceptar
pasajeros que no deberían entrar por error o decisión.

Es necesario:

No corregir automáticamente el error

No castigar aún

Pero registrar el estado real del pasajero

📦 Modelo de datos (contrato)
Passenger (extensión)
Passenger {
id
name
flightId

// NUEVO
isValid: boolean
invalidReason?: InvalidReason
}

InvalidReason (enum)
InvalidReason {
FLIGHT_NOT_FOUND,
FLIGHT_CLOSED,
FLIGHT_CANCELLED,
NAME_MISMATCH
}

🧾 Reglas de marcado (obligatorias)

Durante la decisión en InspectionSystem:

Pasajero VÁLIDO

Se marca como válido si:

El vuelo existe

El nombre del boarding pass coincide con el pasaporte

El vuelo NO está CLOSED ni CANCELLED

passenger.isValid = true
passenger.invalidReason = undefined

Pasajero NO VÁLIDO

Se marca como no válido si falla cualquiera de las condiciones anteriores.

passenger.isValid = false
passenger.invalidReason = <motivo>

⚠️ Importante:

El pasajero sigue entrando al sistema

El flujo físico NO cambia

No hay mensajes extra

No hay penalizaciones

🚫 Lo que NO hace este ticket

Este ticket NO debe:

Detener al pasajero más adelante

Cambiar su velocidad

Afectar a colas

Afectar a bandejas

Afectar al arco

Mostrar UI adicional

Emitir avisos del supervisor

Afectar a scoring

Cualquier uso de isValid fuera de la inspección está prohibido en FASE 1.

🔌 Arquitectura y responsabilidades

InspectionSystem:

Decide validez

Marca el pasajero

Sistemas posteriores (FASE 2):

Solo transportan el pasajero

No reaccionan a isValid

📦 Entregable

Pasajeros aceptados tienen siempre:

isValid correctamente asignado

invalidReason coherente si aplica

Código limpio, sin lógica condicional futura

Tests manuales o logs que demuestren el marcado correcto

Este ticket prepara el sistema para mecánicas futuras.
No intentes “usar” esta información todavía.

Ticket 1.9 – Registro de decisión del jugador en inspección
🎯 Objetivo

Registrar explícitamente la decisión del jugador durante la inspección
(aceptar o rechazar), independientemente de la validez real del pasajero.

Este ticket NO introduce consecuencias, solo guarda información de dominio
para uso futuro.

🧠 Contexto

Un pasajero puede ser:

válido pero rechazado por error

inválido pero aceptado por error

Ambos casos deben poder distinguirse de decisiones correctas.

📦 Modelo de datos (contrato)
Passenger (extensión)
Passenger {
id
name
flightId

// realidad
isValid: boolean
invalidReason?: InvalidReason

// NUEVO
decision?: InspectionDecision
}

InspectionDecision (enum)
InspectionDecision {
ACCEPTED,
REJECTED
}

🧾 Reglas obligatorias

Durante la inspección:

Al aceptar pasajero
passenger.decision = InspectionDecision.ACCEPTED

Al rechazar pasajero
passenger.decision = InspectionDecision.REJECTED

⚠️ Importante:

La decisión se asigna una sola vez

No se modifica después

No se usa fuera del sistema de inspección

🚫 Lo que NO hace este ticket

Este ticket NO debe:

Validar si la decisión es correcta

Cambiar el comportamiento del pasajero

Afectar colas o flujos

Emitir avisos

Afectar scoring

Interactuar con SupervisorSystem

🔌 Responsabilidades

InspectionSystem:

Marca decision

Marca isValid (Ticket 1.8)

Sistemas posteriores:

Ignoran ambas propiedades por ahora

📦 Entregable

Todos los pasajeros inspeccionados tienen:

isValid

decision

Los cuatro casos posibles están representables

Código limpio, sin lógica condicional futura

🧊 Estado tras este ticket

📌 FASE 1 queda completamente cerrada a nivel de dominio
📌 No habrá que volver a tocar inspección por scoring o penalizaciones
📌 FASE 2 puede centrarse solo en flujo físico

Ticket 1.10 – Definición de resultado final del pasajero (sin lógica)
🎯 Objetivo

Definir el modelo de dominio necesario para registrar el resultado final
de cada pasajero al finalizar su ciclo de vida, sin implementar aún la lógica
que lo asigna.

📦 Modelo de datos
Passenger {
...
outcome?: PassengerOutcome
}

PassengerOutcome {
REJECTED_CORRECT,
REJECTED_INCORRECT,
COMPLETED_CORRECT,
COMPLETED_INCORRECT,
INCOMPLETE
}

🚫 Reglas estrictas

outcome NO se asigna en FASE 1

outcome NO se usa en FASE 2

No hay lógica condicional nueva

No hay scoring

No hay UI

📦 Entregable

Modelo preparado

Código compilando

Ningún comportamiento modificado

10️⃣ Decisión final congelada

📌 El resultado final del pasajero existe como concepto
📌 Se calcula más adelante
📌 Ahora solo preparamos el dominio

Esto es diseño limpio, sin deuda técnica.