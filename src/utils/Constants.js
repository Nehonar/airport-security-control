export const GAME_DURATION_MS = 5 * 60 * 1000;
export const TARGET_FPS = 60;
export const CAMERA_LERP_SPEED = 6;
export const BOARDING_WINDOW_MINUTES = 45;
export const LAST_CALL_WINDOW_MINUTES = 15;
export const GAME_START_HOUR = 5;
export const GAME_START_MINUTE = 0;

export const TimeMode = {
  NORMAL: 'NORMAL',
  DOCUMENT_INSPECTION: 'DOCUMENT_INSPECTION',
};

export const CLOCK_MINUTES_PER_SECOND = 1; // base rate at NORMAL
export const CLOCK_MULTIPLIER = {
  [TimeMode.NORMAL]: 1,
  [TimeMode.DOCUMENT_INSPECTION]: 0.35, // slower during inspection
};
