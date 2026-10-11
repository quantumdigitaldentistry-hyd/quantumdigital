/**
 * Whether this device should get WebGL scenes. Skip 3D where it would hurt: no WebGL2,
 * data saver on, or a low-memory device. Those visitors get the static version, which
 * tells the same story at a fraction of the cost.
 */
export function canRender3D() {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}
