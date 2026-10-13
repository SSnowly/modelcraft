---
title: File formats in detail
summary: Exactly what each format ModelCraft opens, imports and exports keeps, converts and leaves out.
section: reference
order: 50
keywords: formats, file types, modelcraft, json, collada, dae, obj, gltf, glb, stl, ifc, dwg, dxf, units, axes, y up, z up, millimeters, limits
---

ModelCraft's model is in meters with Z (blue) up. Every format below is converted to or from that.

## ModelCraft (.modelcraft)

| What | Details |
|---|---|
| Open | {{ui:Open}} ({{key:Mod+O}}) or drop on the view. Files ending in `.json` are accepted too |
| Save | {{ui:Save}} ({{key:Mod+S}}), as a download |
| Keeps | Everything: geometry, faces and their colors, soft edges, groups, components, names, guides, scenes, the units, and the last camera and style |
| Leaves out | The undo history |
| Limit | 200 MB |

A file saved by a newer ModelCraft than yours is refused: "This model was saved by a newer ModelCraft (file version …). Update ModelCraft to open it." A file that is not a ModelCraft model says "This file is not a ModelCraft model (it is not JSON)." or "This is not a ModelCraft file we can open: …".

## Collada (.dae)

Import and export. The best format for trading models with other 3D modelers.

- **Export:** Collada 1.4.1, Z up, meters. One geometry per group or component definition; components are written once and placed by reference, so they stay shared. Faces with holes or concave outlines are split into triangles. Colors become materials. Loose edges are written as lines. Names that are not valid in the format are adjusted, and the exact name is kept alongside it.
- **Import:** triangles, polygons (with holes), triangle fans and strips become faces; lines become edges. Node transforms, the file's up axis and its unit are applied. A node placed in several places, or a geometry used by several nodes, comes in as a component; other nodes come in as groups. Material colors (diffuse) become face colors.
- **Not imported:** textures, skins and morphs, cameras, lights, some transform types (look-at and skew), and references to other files. The status bar counts them.
- **Lost on export:** which edges are soft. **On import,** triangulated surfaces stay triangles, with the diagonals softened so flat areas still read as one surface.

## OBJ (.obj)

Import and export.

- **Export:** meters, Y up (the way OBJ readers expect), world coordinates. One object per group placement; components are written out in full at every placement. Faces with holes are split into triangles. Loose edges are written as lines. When the model has colors, a `.mtl` materials file downloads beside the `.obj` (one material per color); keep the two together. Faces joined by [soft edges](topic:soften) get a normal per corner, so they shade smooth in other programs.
- **Import:** read as meters with Y up. OBJ has no unit, so a model made in millimeters or inches arrives at the wrong size: scale it after import (see [Rotate and scale](topic:rotate-scale#fix-an-import-that-came-in-the-wrong-size)). Materials are not read.
- **Limit:** 2 million vertices or faces.

## glTF (.glb, .gltf)

- **Export** (`.glb` only): glTF 2.0 binary, meters, Y up. One mesh per definition, so components stay shared. Colors become materials. Faces joined by [soft edges](topic:soften) carry smooth normals. Loose edges are left out.
- **Import:** `.glb`, or `.gltf` with its data inside the file. A `.gltf` that keeps its data in a separate `.bin` file is refused: "This glTF file keeps its data in a separate file (…). Export it as a single .glb and open that." Base colors become face colors; textures and extensions are not read.
- **Limit:** 2 million vertices.

## STL (.stl)

Export only, for 3D printing. Binary STL, **millimeters** (printer software reads STL as millimeters), Z up. Triangles only: groups, colors and loose edges are left out. Export closed solids for a clean print.

## DWG and DXF export (.dwg, .dxf)

For CAD programs. The model is written in its own unit: inches for feet-and-inches models, otherwise millimeters, centimeters or meters (the status bar names it).

- **Faces** become 3D faces (triangles). Lines inside a face, and soft edges, are written invisible, so the faces look like ModelCraft's.
- **Loose edges** become lines.
- **Groups and components** become blocks: a component is written once and placed as often as it is used, turned and mirrored copies included. A group that was stretched after it was turned (so it is slanted) is written out in place instead.
- **Colors:** DWG keeps each face's color exactly; DXF uses the nearest of the 255 standard CAD colors.
- **Versions:** DWG is written as AutoCAD 2004 (AC1018), which CAD programs from 2004 on open. DXF is R12 (AC1009), the version every CAD program reads; R12 has no unit field, so tell the CAD program which unit to use.
- **Not written:** guides, dimensions, scenes, and the camera.

## IFC (.ifc)

Export only, for BimCraft and other BIM programs. IFC4 with a project, a site, a building and its storeys. Each top-level group or component becomes one building element proxy with its name; closed ones are written as solid shapes (faceted breps), open ones as surface models; holes in faces are kept. Loose geometry at the top level becomes one element called "Loose geometry". No types, properties or materials.

**Storeys:** {{ui:Export}} › {{ui:IFC storeys…}} lists them, each with a name and an elevation ({{ui:Add storey}}, or {{ui:Guess from the model}}, which makes one storey for each height your top-level groups stand on). On export, each group or component goes on the storey at or below its lowest point, and keeps its place. With no storeys, everything goes on one storey, "Level 1", at 0. The storeys are saved in the ModelCraft file.

## DWG (.dwg) and DXF (.dxf)

Import as lines on the ground (hatches and 3D faces as faces); export as described above. See [Model on a site plan](topic:site-plan).

- **Read:** lines, polylines (with arcs), 3D polylines, circles, arcs, and block references including arrays, from model space. Invisible objects (such as the hidden states of a dynamic block) are left out. Curves become 48 straight pieces per full turn.
- **Read since 0.4:** splines and ellipses (as edges), text, multiline text and attribute values (as edges in a single-stroke lettering), hatches (faces with holes), 3D faces and solid fills (faces), and dimensions (drawn from the drawing's own dimension blocks).
- **Not read:** points, tables, multileaders, regions and 3D solids, images, and anything in paper space.
- **Units:** taken from the drawing when it says. If not, ModelCraft asks.
- **DXF** must be ASCII. Binary DXF is refused.
- **DWG** files from AutoCAD R13 up to the current format (AutoCAD 2018 and later; AC1012 to AC1032) are read by ModelCraft's own DWG reader, in the page; it is part of ModelCraft, so it works offline whenever ModelCraft does. Older versions (R12 and before) and badly damaged files cannot be read; save them as DXF.
- **Limits:** coordinates more than 10,000 km from the origin, or more than 2 million line pieces, are refused.
- **Saving DWG or DXF** is not built.

## Not supported

ModelCraft cannot open or save SketchUp (`.skp`), 3DS, FBX, Rhino, STEP or IFC files. To bring in a model from SketchUp, export it from there as Collada (`.dae`) if your version can, or as OBJ.
