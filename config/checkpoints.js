// Definición de checkpoints desacoplados por subzonas.
// Ajusta las coordenadas según tu layout; el sistema de movimiento
// consume estos puntos en orden.

// Zig-zag de control de documentos (Zona 1)
export const zigZagZona1 = [
  { x: 25, y: 1, name: 'ZZ-0' },
  { x: 25, y: 80, name: 'ZZ-1' },
  { x: 900, y: 80, name: 'ZZ-2' },
  { x: 900, y: 120, name: 'ZZ-3' },
  { x: 25, y: 120, name: 'ZZ-4' },
  { x: 25, y: 160, name: 'ZZ-5' },
  { x: 900, y: 160, name: 'ZZ-6' },
  { x: 900, y: 200, name: 'ZZ-7' },
  { x: 25, y: 200, name: 'ZZ-8' },
  { x: 25, y: 240, name: 'ZZ-9' },
  { x: 900, y: 240, name: 'ZZ-10' },
  { x: 900, y: 280, name: 'ZZ-11' },
  { x: 100, y: 280, name: 'ZZ-Final' },
];

// Puedes añadir más bloques de checkpoints para otras zonas aquí.
// Ejemplo:
// export const zona2Carril = [ ... ];

export default {
  zigZagZona1,
};
