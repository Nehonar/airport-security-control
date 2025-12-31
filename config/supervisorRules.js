const supervisorRules = [
  {
    id: 'COLA_LARGA',
    metric: 'entryQueueLength',
    threshold: 10,
    comparison: '>',
    message: 'Hay demasiada gente esperando para entrar',
    cooldownMs: 30000,
    enabled: true,
  },
  {
    id: 'FALTAN_BANDEJAS',
    metric: 'availableTrays',
    threshold: 3,
    comparison: '<',
    message: 'Los pasajeros no tienen bandejas suficientes',
    cooldownMs: 30000,
    enabled: true,
  },
  {
    id: 'SOBRAN_BANDEJAS_DETRAS',
    metric: 'backendTrayCount',
    threshold: 8,
    comparison: '>',
    message: 'Hay demasiadas bandejas detrás, recógelas',
    cooldownMs: 30000,
    enabled: true,
  },
  {
    id: 'DESCUIDO_DOCUMENTOS',
    metric: 'timeAwayFromInspection',
    threshold: 45000,
    comparison: '>',
    message: 'Vuelve al control, la cola se está acumulando',
    cooldownMs: 45000,
    enabled: true,
  },
  {
    id: 'DESCUIDO_OPERATIVO',
    metric: 'timeInInspection',
    threshold: 60000,
    comparison: '>',
    message: 'No descuides el resto del control',
    cooldownMs: 45000,
    enabled: true,
  },
];

export default supervisorRules;
