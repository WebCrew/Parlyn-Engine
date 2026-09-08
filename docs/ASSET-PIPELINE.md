# Asset Pipeline

Parlyn will import external content into Parlyn-owned metadata instead of making third-party project formats part of the engine core.

Preferred direction:

- glTF / GLB for modern 3D interchange
- PNG / JPEG / WebP for images
- WAV / OGG for audio
- extensible importers for additional formats

Marketplace compatibility is a technical goal only. The user remains responsible for ensuring that a third-party asset license permits use in Parlyn.

The Phase 2 editor can safely rename and move imported files inside a project's `assets/` directory. It creates validated subfolders, refuses overwrites and path escapes, ignores symbolic links during listing, and preserves the original file extension. Stable asset IDs, importer metadata, reimport and automatic reference migration remain Phase 4 work.
