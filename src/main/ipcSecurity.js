const DEFAULT_MAX_PAYLOAD_BYTES = 32 * 1024 * 1024;

function assertTrustedIpcEvent(event, editorUrl) {
  const sourceUrl = event?.senderFrame?.url;
  if (typeof sourceUrl !== 'string' || sourceUrl !== editorUrl) {
    throw new Error('Rejected an IPC request from an untrusted editor document.');
  }
}

function assertIpcPayload(payload, label = 'IPC payload', maxBytes = DEFAULT_MAX_PAYLOAD_BYTES) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError(`${label} must be an object.`);
  }
  let source;
  try {
    source = JSON.stringify(payload);
  } catch (error) {
    throw new TypeError(`${label} must contain serializable data.`, { cause:error });
  }
  if (Buffer.byteLength(source, 'utf8') > maxBytes) {
    throw new RangeError(`${label} exceeds the ${Math.floor(maxBytes / 1024 / 1024)} MiB IPC limit.`);
  }
  return payload;
}

module.exports = { DEFAULT_MAX_PAYLOAD_BYTES, assertTrustedIpcEvent, assertIpcPayload };
