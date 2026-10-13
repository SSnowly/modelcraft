# ModelCraft for Linux

**Available from 0.4.** The `.deb` and AppImage are in [Releases](https://github.com/getcadcraft/modelcraft/releases).

Both are the [browser edition](../web/), unchanged, in a WebKitGTK window, built by [getcadcraft/desktop-shell](https://github.com/getcadcraft/desktop-shell).

## Flathub

[`flathub/`](flathub/) is the Flathub manifest (`com.getcadcraft.modelcraft.yml`) with its desktop entry, AppStream metainfo, MIME types and icons. It builds from public sources only: the shell's tag and the release zip. Values marked `OWNER:` are filled in at submission.

```sh
flatpak-builder --user --install build-dir flathub/com.getcadcraft.modelcraft.yml
```

## File types

- Opens by default: `.modelcraft` (ModelCraft model)
- Listed under "Open with": `.dae` (COLLADA model), `.obj` (OBJ model), `.glb` (glTF model), `.gltf` (glTF model), `.dwg` (DWG drawing), `.dxf` (DXF drawing)
