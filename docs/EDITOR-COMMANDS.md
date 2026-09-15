# Editor Commands and Keyboard Behavior

Parlyn routes buttons and keyboard shortcuts to the same editor command
functions. The current bindings are intentionally small and fixed; custom
profiles and rebinding are not part of the Phase 2 foundation.

| Command | Shortcut |
| --- | --- |
| Select | Q / Esc |
| Move | W |
| Rotate | E |
| Scale | R |
| Frame Selected | F |
| Place on Ground | End |
| Delete Selection | Delete |
| Duplicate Node | Ctrl+D |
| Save Scene | Ctrl+S |
| Open Scene | Ctrl+O |
| Open Project | Ctrl+Shift+O |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y / Ctrl+Shift+Z |

## Context rules

- Modal dialogs suspend editor shortcuts so commands cannot affect the scene
  behind a dialog. Dialog controls retain their native keyboard behavior.
- Text fields retain typing, Delete and native field Undo/Redo. Ctrl+S commits
  the active field and saves the scene.
- Key repeat, input-method composition and Alt/AltGr combinations do not invoke
  editor commands.
- Unsupported modifier combinations do nothing; Parlyn does not silently map
  them to a different command.

## Reference review

Godot, Unity and Unreal all establish discoverable, editor-wide shortcuts and
context-sensitive commands. Unity's official Shortcuts Manager documentation
explicitly separates global and contextual commands; Unreal exposes a keyboard
shortcut editor. Their mature profile/rebinding systems are useful future
references, but adding one during this audit would exceed the Phase 2 scope.

Parlyn's current improvement is a smaller, predictable contract suited to the
present editor: a single tested resolver, visible bindings inside the editor and
explicit protection for text input and modal work. This is not a claim of broader
capability than those engines.

- Unity: <https://docs.unity3d.com/6000.0/Documentation/Manual/ShortcutsManager.html>
- Unreal Engine: <https://dev.epicgames.com/documentation/en-us/unreal-engine/customizing-keyboard-shortcuts-in-unreal-engine>
- Godot editor documentation: <https://docs.godotengine.org/en/stable/tutorials/editor/index.html>
