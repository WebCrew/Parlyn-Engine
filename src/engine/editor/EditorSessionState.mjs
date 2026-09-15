export const EDITOR_SESSION_VERSION = 1;

const DEFAULT_CAMERA = Object.freeze({
  target:Object.freeze({ x:0, y:0.7, z:0 }),
  orbit:Object.freeze({ yaw:-0.55, pitch:0.42, distance:11 })
});

function finite(value, fallback, minimum = -1_000_000, maximum = 1_000_000) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(maximum, Math.max(minimum, numeric));
}

export function normalizeEditorViewState(candidate) {
  const source = candidate && typeof candidate === "object" ? candidate : {};
  const camera = source.camera && typeof source.camera === "object" ? source.camera : {};
  const target = camera.target && typeof camera.target === "object" ? camera.target : {};
  const orbit = camera.orbit && typeof camera.orbit === "object" ? camera.orbit : {};
  const selectionIds = Array.isArray(source.selectionIds)
    ? [...new Set(source.selectionIds.filter((id) => typeof id === "string" && id.length > 0 && id.length <= 256))].slice(0, 100)
    : [];
  return {
    mode:source.mode === "3d" ? "3d" : "2.5d",
    camera:{
      target:{
        x:finite(target.x, DEFAULT_CAMERA.target.x),
        y:finite(target.y, DEFAULT_CAMERA.target.y),
        z:finite(target.z, DEFAULT_CAMERA.target.z)
      },
      orbit:{
        yaw:finite(orbit.yaw, DEFAULT_CAMERA.orbit.yaw, -Math.PI * 20, Math.PI * 20),
        pitch:finite(orbit.pitch, DEFAULT_CAMERA.orbit.pitch, -1.25, 1.25),
        distance:finite(orbit.distance, DEFAULT_CAMERA.orbit.distance, 2.5, 40)
      }
    },
    selectionIds
  };
}

export function normalizeEditorSessionState(candidate) {
  if (!candidate || typeof candidate !== "object" || candidate.version !== EDITOR_SESSION_VERSION) return null;
  if (!['project', 'scene'].includes(candidate.kind)) return null;
  const location = candidate.kind === 'project' ? candidate.projectRoot : candidate.filePath;
  if (typeof location !== 'string' || !location.trim() || location.length > 32_768) return null;
  if (candidate.kind === 'project' && (typeof candidate.scenePath !== 'string' || !/^scenes\/.+\.parlyn-scene\.json$/.test(candidate.scenePath))) return null;
  return {
    format:'parlyn-editor-session',
    version:EDITOR_SESSION_VERSION,
    kind:candidate.kind,
    ...(candidate.kind === 'project'
      ? { projectRoot:location, scenePath:candidate.scenePath }
      : { filePath:location }),
    view:normalizeEditorViewState(candidate.view)
  };
}
