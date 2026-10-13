# ModelCraft for Windows

**Available from 0.4.** Download `ModelCraft-0.4-setup.exe` from [Releases](https://github.com/getcadcraft/modelcraft/releases).

The installer is the [browser edition](../web/), unchanged, in a WebView2 window (part of Windows 10 and 11), built by [getcadcraft/desktop-shell](https://github.com/getcadcraft/desktop-shell) (`node build.mjs modelcraft --edition <zip>`). Nothing here to compile.

**Not code-signed yet:** Windows SmartScreen shows "Windows protected your PC"; choose **More info › Run anyway**, and check the file against SHA256SUMS first. The Microsoft Store package follows once it is signed.

## File types

- Opens by default: `.modelcraft` (ModelCraft model)
- Listed under "Open with": `.dae` (COLLADA model), `.obj` (OBJ model), `.glb` (glTF model), `.gltf` (glTF model), `.dwg` (DWG drawing), `.dxf` (DXF drawing)
