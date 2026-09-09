export async function approveUnsavedTransition({ dirty, requestDecision, save }) {
  if (!dirty) return true;
  if (typeof requestDecision !== "function" || typeof save !== "function") throw new TypeError("Unsaved transition requires decision and save callbacks.");
  const decision = await requestDecision();
  if (decision === "discard") return true;
  if (decision === "save") return await save() === true;
  return false;
}
