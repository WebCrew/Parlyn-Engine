# Publishing Parlyn v0.5.0 on GitHub

This repository is prepared for the Parlyn Engine v0.5.0 GitHub Preview update.

## Before the first push

On the Windows development machine:

```powershell
npm install
npm run check
npm run dev
```

`npm install` will create/update `package-lock.json`. Commit that generated lock file with the repository so dependency installs become reproducible.

## Suggested repository description

> Open-source 2.5D-first game engine focused on depth, hybrid 2.5D/3D scenes and an approachable desktop workflow.

## Suggested topics

- game-engine
- 2-5d
- 3d
- gamedev
- threejs
- electron
- javascript
- open-source
- mit-license

## Suggested first release title

`Parlyn Engine v0.5.0 — GitHub Preview`

## Suggested release summary

Parlyn Engine v0.5.0 adds direct viewport transform gizmos and the first Parlyn module lifecycle foundation to the existing independent 2.5D-first editor. Move, Rotate and Scale now work directly in the viewport with live Inspector updates and Undo/Redo integration. A first module registry, module browser and developer example establish the extension model without locking Parlyn into mandatory workflows.

This is an early foundation release. Project and scene formats may still change while the engine architecture stabilizes.
