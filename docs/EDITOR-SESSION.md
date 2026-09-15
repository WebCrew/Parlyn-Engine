# Editor Session Reopening

Beta 23 reopens the last saved working context after a normal Parlyn shutdown.
The local descriptor contains only the active project or standalone scene path,
project-relative scene path, 2.5D/3D mode, bounded camera values and up to 100
node IDs. It is stored below Electron's per-user application-data directory, not
inside the project and not in scene documents.

## Safety contract

- Scene content is always loaded from the normal saved scene file.
- Unsaved content is never placed in the session descriptor.
- Save, Discard and Cancel retain their existing meanings.
- Explicit Close Project and Delete Project clear the remembered context.
- Missing, moved, corrupt or incompatible files clear the stale descriptor and
  fall back to normal startup instead of creating a retry loop.
- Selection IDs are restored only when they still exist in the loaded scene.
- Camera values, payload size and session format are validated and bounded.
- Failure to write optional session metadata must not block Save or application
  shutdown.

Autosave is deliberately separate. Beta 23 cannot recover work after a crash or
power loss and does not claim to do so.

## Reference review

- [Godot EditorSettings](https://docs.godotengine.org/en/stable/classes/class_editorsettings.html)
  provides explicit restoration settings for scene tabs, scripts and windows.
- [Unity workspace customization](https://docs.unity3d.com/6000.0/Documentation/Manual/CustomizingYourWorkspace.html)
  provides saved/restored editor layouts.
- [Unreal layout customization](https://dev.epicgames.com/documentation/en-us/unreal-engine/layout-customization)
  persists editor tabs and layout between sessions.

Parlyn adopts the familiar continuity goal but keeps this first implementation
smaller and easier to reason about: one last saved scene context, strict fallback
and no coupling between session convenience and project data. A future multi-tab
workspace can extend the versioned descriptor without changing scene files.
