import assert from 'node:assert/strict';
import { EDITOR_SHORTCUTS, isTextEditingTarget, resolveEditorShortcut } from '../src/engine/editor/EditorShortcuts.mjs';

const key = (value, options = {}) => resolveEditorShortcut({ key:value, ...options }, options.context);

for (const [pressed, command] of [['q','select'], ['Escape','select'], ['w','move'], ['e','rotate'], ['r','scale'], ['End','ground'], ['f','frame'], ['Delete','delete']]) {
  assert.equal(key(pressed), command);
}
assert.equal(key('d', { ctrlKey:true }), 'duplicate');
assert.equal(key('s', { ctrlKey:true }), 'save');
assert.equal(key('o', { ctrlKey:true }), 'open-scene');
assert.equal(key('o', { ctrlKey:true, shiftKey:true }), 'open-project');
assert.equal(key('z', { ctrlKey:true }), 'undo');
assert.equal(key('y', { ctrlKey:true }), 'redo');
assert.equal(key('z', { ctrlKey:true, shiftKey:true }), 'redo');
assert.equal(key('s', { metaKey:true }), 'save');

for (const blocked of [
  { key:'Delete', repeat:true },
  { key:'w', isComposing:true },
  { key:'w', altKey:true },
  { key:'f', shiftKey:true },
  { key:'s', ctrlKey:true, shiftKey:true },
  { key:'w', context:{ modalOpen:true } },
  { key:'Escape', context:{ modalOpen:true } },
  { key:'z', ctrlKey:true, context:{ editing:true } },
  { key:'Delete', context:{ editing:true } }
]) assert.equal(key(blocked.key, blocked), null);

assert.equal(key('s', { ctrlKey:true, context:{ editing:true } }), 'save');
assert.equal(isTextEditingTarget({ tagName:'INPUT' }), true);
assert.equal(isTextEditingTarget({ tagName:'DIV', isContentEditable:true }), true);
assert.equal(isTextEditingTarget({ tagName:'BUTTON' }), false);
assert.equal(new Set(EDITOR_SHORTCUTS.map((entry) => entry.command)).size, EDITOR_SHORTCUTS.length);
assert.equal(EDITOR_SHORTCUTS.length, 13);

console.log('Editor shortcut routing check passed.');
