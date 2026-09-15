const TEXT_EDITING_TAGS = new Set(['input', 'select', 'textarea']);

export const EDITOR_SHORTCUTS = Object.freeze([
  { command:'select', label:'Select', keys:'Q / Esc' },
  { command:'move', label:'Move', keys:'W' },
  { command:'rotate', label:'Rotate', keys:'E' },
  { command:'scale', label:'Scale', keys:'R' },
  { command:'frame', label:'Frame Selected', keys:'F' },
  { command:'ground', label:'Place on Ground', keys:'End' },
  { command:'delete', label:'Delete Selection', keys:'Delete' },
  { command:'duplicate', label:'Duplicate Node', keys:'Ctrl+D' },
  { command:'save', label:'Save Scene', keys:'Ctrl+S' },
  { command:'open-scene', label:'Open Scene', keys:'Ctrl+O' },
  { command:'open-project', label:'Open Project', keys:'Ctrl+Shift+O' },
  { command:'undo', label:'Undo', keys:'Ctrl+Z' },
  { command:'redo', label:'Redo', keys:'Ctrl+Y / Ctrl+Shift+Z' }
]);

export function isTextEditingTarget(target) {
  const tag = target?.tagName?.toLowerCase?.();
  return TEXT_EDITING_TAGS.has(tag) || target?.isContentEditable === true;
}

export function resolveEditorShortcut(event, { editing = false, modalOpen = false } = {}) {
  if (!event || event.defaultPrevented || event.repeat || event.isComposing || modalOpen || event.altKey) return null;
  const key = String(event.key ?? '').toLowerCase();
  if (!key || key === 'process' || key === 'dead') return null;
  const primary = Boolean(event.ctrlKey || event.metaKey);

  // Saving is the sole global editor command while a text field is active.
  // Native field Undo/Redo/Delete behavior must remain available.
  if (editing) return primary && !event.shiftKey && key === 's' ? 'save' : null;

  if (primary) {
    if (key === 'o') return event.shiftKey ? 'open-project' : 'open-scene';
    if (event.shiftKey && key === 'z') return 'redo';
    if (event.shiftKey) return null;
    if (key === 'd') return 'duplicate';
    if (key === 's') return 'save';
    if (key === 'z') return 'undo';
    if (key === 'y') return 'redo';
    return null;
  }

  if (event.shiftKey) return null;
  return ({
    escape:'select', q:'select', w:'move', e:'rotate', r:'scale',
    end:'ground', f:'frame', delete:'delete'
  })[key] ?? null;
}
