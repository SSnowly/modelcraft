---
title: Paint with colors
summary: Give faces, groups and components a solid color to tell objects apart, and keep the colors when you export.
section: tasks
order: 45
keywords: paint, color, colour, material, paint bucket, fill, sample, eyedropper, default, glb, obj, mtl, collada
---

Colors help you tell parts of a model apart. ModelCraft paints with **solid colors**; textures are not built yet.

## Pick a color

The {{ui:Colors}} section on the right shows a row of solid colors, {{ui:Default}} (the one crossed by a line: no color) and a {{ui:+}} swatch for any other color. Click one to make it the current color. The Paint tool starts with it.

## Paint

1. Press {{key:B}} ({{ui:Paint}}), or click a color.
2. Click a face to paint it.
3. Click a group or a component to paint that copy: its faces that have no color of their own take this color. Faces you painted inside it keep theirs.

To paint several things at once, select them first and then click a color, or click any of them with {{ui:Paint}}. It is one undo step.

| Hold | And click a face | What gets painted |
|---|---|---|
| — | | That face |
| {{key:Ctrl}} | | Every face connected to it that has the same color |
| {{key:Shift}} | | Every face of that color in the group you are working in |
| {{key:Alt}} | | Nothing: you pick up that color instead |

To take a face back to no color, choose {{ui:Default}} and click it.

## Components and colors

A color painted on a face **inside** a component shows on every copy, because the copies share one definition. A color painted on a **copy** from outside (with the component closed) belongs to that copy only, so two copies of one component can have different colors. {{ui:Entity info}} shows the color of a selected face, group or component.

## Colors in files

- The ModelCraft file keeps every color.
- **glTF (.glb)** and **Collada (.dae)**: each color becomes a material. A component shown in different colors is written once per color.
- **OBJ**: exporting downloads two files, the `.obj` and a `.mtl` materials file with the colors. Keep them in the same folder.
- **DWG** keeps the exact colors; **DXF** uses the nearest of the 255 standard CAD colors.
- **STL** has no colors.

:::tip
To model a screen, paint the frame charcoal and the glass blue after you [offset](topic:draw-faces) the front face.
:::
