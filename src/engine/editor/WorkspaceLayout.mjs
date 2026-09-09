export const WORKSPACE_LAYOUT_VERSION = 1;

export const DEFAULT_WORKSPACE_LAYOUT = Object.freeze({
  version:WORKSPACE_LAYOUT_VERSION,
  panels:Object.freeze({ hierarchy:true, inspector:true, assets:true }),
  sizes:Object.freeze({ hierarchy:238, inspector:305, assets:190 })
});

const SIZE_LIMITS = Object.freeze({ hierarchy:[180, 480], inspector:[240, 520], assets:[120, 420] });

function clampSize(value, [minimum, maximum], fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.round(Math.min(maximum, Math.max(minimum, numeric)));
}

export function normalizeWorkspaceLayout(candidate) {
  const source = candidate && typeof candidate === "object" && candidate.version === WORKSPACE_LAYOUT_VERSION ? candidate : {};
  const sourcePanels = source.panels && typeof source.panels === "object" ? source.panels : {};
  const sourceSizes = source.sizes && typeof source.sizes === "object" ? source.sizes : {};
  return {
    version:WORKSPACE_LAYOUT_VERSION,
    panels:{
      hierarchy:typeof sourcePanels.hierarchy === "boolean" ? sourcePanels.hierarchy : DEFAULT_WORKSPACE_LAYOUT.panels.hierarchy,
      inspector:typeof sourcePanels.inspector === "boolean" ? sourcePanels.inspector : DEFAULT_WORKSPACE_LAYOUT.panels.inspector,
      assets:typeof sourcePanels.assets === "boolean" ? sourcePanels.assets : DEFAULT_WORKSPACE_LAYOUT.panels.assets
    },
    sizes:{
      hierarchy:clampSize(sourceSizes.hierarchy, SIZE_LIMITS.hierarchy, DEFAULT_WORKSPACE_LAYOUT.sizes.hierarchy),
      inspector:clampSize(sourceSizes.inspector, SIZE_LIMITS.inspector, DEFAULT_WORKSPACE_LAYOUT.sizes.inspector),
      assets:clampSize(sourceSizes.assets, SIZE_LIMITS.assets, DEFAULT_WORKSPACE_LAYOUT.sizes.assets)
    }
  };
}
