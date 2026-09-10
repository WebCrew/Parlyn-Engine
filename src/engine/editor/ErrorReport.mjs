const FALLBACK_MESSAGE = "Parlyn could not complete the requested operation.";

const AREA_RULES = [
  [/project/i, { area:"Project", guidance:"Check that the project folder is available and writable, then try again." }],
  [/asset/i, { area:"Assets", guidance:"Check the selected asset name and project location, then try again." }],
  [/scene|node|history/i, { area:"Scene", guidance:"Keep the current editor open, review the scene selection or file, and try again." }],
  [/world/i, { area:"World", guidance:"Check the active project's world data and try again." }],
  [/module/i, { area:"Modules", guidance:"Review the selected module state and try again." }],
  [/application|editor|workspace/i, { area:"Editor", guidance:"Retry the operation. If it fails again, copy the technical details for a bug report." }]
];

export function readableErrorMessage(error) {
  return String(error?.message ?? error ?? FALLBACK_MESSAGE)
    .replace(/^Error invoking remote method '[^']+': Error:\s*/, "")
    .trim() || FALLBACK_MESSAGE;
}

export function redactLocalPaths(message) {
  return String(message)
    .replace(/file:\/\/\/[A-Za-z]:\/[^")\r\n]*/gi, "[local path]")
    .replace(/[A-Za-z]:[\\/][^\r\n)]*/g, "[local path]");
}

function classify(title) {
  return AREA_RULES.find(([pattern]) => pattern.test(title))?.[1] ?? {
    area:"Editor",
    guidance:"Retry the operation. If it fails again, copy the technical details for a bug report."
  };
}

function causeMessages(error) {
  const messages = [];
  let cause = error?.cause;
  const visited = new Set();
  while (cause && messages.length < 5 && !visited.has(cause)) {
    visited.add(cause);
    messages.push(readableErrorMessage(cause));
    cause = cause?.cause;
  }
  return messages;
}

export function createErrorReport(title, error, { timestamp = new Date().toISOString() } = {}) {
  const operation = String(title || "Operation failed").trim();
  const message = readableErrorMessage(error);
  const classification = classify(operation);
  const causes = causeMessages(error);
  const lines = ["Parlyn error report", `Time: ${timestamp}`, `Area: ${classification.area}`, `Operation: ${operation}`, `Message: ${message}`];
  causes.forEach((cause, index) => lines.push(`Cause ${index + 1}: ${cause}`));
  if (error?.stack) lines.push("", "Stack:", String(error.stack));
  return {
    area:classification.area,
    operation,
    message:redactLocalPaths(message),
    guidance:classification.guidance,
    technicalDetails:lines.join("\n")
  };
}
