---
title: What's new in 0.4
summary: Arcs, curves, offset, follow me, paint, tags, section planes, solid tools, DWG and DXF export, images and PDFs of the view, touch, and a Spanish draft.
section: start
order: 5
keywords: whats new, what's new, release notes, changelog, changes, 0.4, version, new features, arc, curve, offset, follow me, paint, tags, sections, solids, dwg export, dxf export, image, pdf, touch, spanish, language
---

This is what changed in ModelCraft 0.4, compared with 0.3, the version Try ran before.

## New

### Drawing

- **Arcs.** {{ui:Arc}} ({{key:A}}) draws an arc from two ends and a bulge. {{ui:Arc center}} draws one from a center, a radius and an angle. See [Draw an arc](topic:draw-faces#draw-an-arc).
- **Arcs, circles and polygons are curves.** One click selects the whole curve, and {{ui:Entity info}} shows its radius. Type a new radius to resize a flat one. See [Arcs, circles and polygons are curves](topic:draw-faces#arcs-circles-and-polygons-are-curves).
- **Smooth curves.** {{ui:Curve}} draws a smooth curve through the points you click, in 3D. Select it and click {{ui:Edit points}} to reshape it. See [Draw a smooth curve](topic:draw-faces#draw-a-smooth-curve).
- **Offset** ({{key:F}}). Copy a face's outline inside or outside it, or offset a chain of edges. Double-click a face to repeat the last distance. See [Offset](topic:draw-faces#offset-a-border-inside-or-outside-a-face).
- **Follow me.** Sweep a face along a path of lines, arcs or a curve: pipes, cables, handrails, moldings. See [Follow me](topic:follow-me).
- **3D Text** in the Draw group. Lettering as flat faces or solid letters, placed on the face you click. See [3D text](topic:text3d).
- **Terrain.** Make ground from contour lines or as a grid, and raise or lower it with a soft brush. It is in {{ui:Edit}} › {{ui:More}}. See [Terrain](topic:terrain).
- **Protractor.** Place a guide line at a typed or snapped angle. See [A guide at an angle](topic:guides-measure#a-guide-at-an-angle-protractor).
- **New snap: the center of a face.** See [Inference and snapping](topic:inference#drawing-on-a-face-from-a-point).

### Editing

- **Paint** ({{key:B}}) and a {{ui:Colors}} panel. Give faces, groups and components solid colors. Colors are saved in the file and kept in GLB, Collada, OBJ, DWG and DXF exports. See [Paint with colors](topic:paint).
- **Solid tools.** {{ui:Solids}} in the {{ui:Organize}} group has {{ui:Union}}, {{ui:Subtract}} and {{ui:Intersect}} for closed groups and components. When a group is not a solid, {{ui:Entity info}} says why, and {{ui:Show problems}} and {{ui:Fix}} help. See [Solid tools](topic:solids).
- **Intersect faces.** {{ui:Intersect with model}} and {{ui:Intersect with selection}} in {{ui:Edit}} › {{ui:More}} draw the lines where shapes cut through each other. See [Intersect faces](topic:intersect).
- **Flip** along red, green or blue, or make a flipped copy beside the original, from {{ui:Edit}} › {{ui:More}}. See [Flip](topic:rotate-scale#flip).
- **Scale grips.** With something selected, {{ui:Scale}} shows grips on its box. Stretch along one or two directions, or type one factor per axis, such as `2,1,0.5`. See [Rotate and scale](topic:rotate-scale#scale).
- **Soften edges by angle** in {{ui:Entity info}}. Curved shapes then look like one smooth surface, in ModelCraft and in GLB and OBJ exports. See [Soften and smooth edges](topic:soften).
- **Move and turn the drawing axes** with {{ui:Place axes}}, {{ui:Align axes to face}} and {{ui:Reset axes}} in {{ui:Edit}} › {{ui:More}}. See [Move and turn the drawing axes](topic:axes).
- **Dimensions on arcs, circles and angles.** Click an arc for its radius, a circle for its diameter, or two edges that meet for the angle. Type a new radius or diameter to resize the curve. See [Radius, diameter and angle](topic:dimensions#radius-diameter-and-angle).

### Organizing and viewing

- **Tags.** Give groups and components a tag in {{ui:Entity info}}, then hide or show everything with that tag in the {{ui:Tags}} panel. See [Tags](topic:tags).
- **Hide, Isolate and Unhide all** in {{ui:Edit}} › {{ui:More}}. Clicks and snaps go past hidden things. With Blender-style keys: {{key:H}}, {{key:Shift+H}} and {{key:Alt+H}}. See [Hide, isolate and unhide](topic:hide-isolate).
- **Section planes.** Click a face with {{ui:Section}} to cut the model open. Slide, reverse or turn off the cut in {{ui:Entity info}}. Cut solids are filled. See [Section planes](topic:sections).
- **Outliner.** {{ui:Find by name}}, an eye on every row, {{key:F2}} to rename, and drag a group onto another to move it inside. See [The workspace](topic:workspace).
- **Presentation view** ({{ui:Views}} menu, or {{key:Shift+P}}). Only the model shows: no axes, guides, snapping marks or selection. See [Presentation view](topic:styles-shadows#presentation-view).
- **Scenes remember what is hidden:** groups, tags and the section cut. {{ui:Export animation}} saves the scenes as a WebM video. See [Save views as scenes](topic:scenes#export-an-animation).

### Components

- **Starter library.** In the {{ui:Components}} panel, {{ui:Starter library}} has 34 ready-made things: doors and windows, furniture, kitchen and bath, stairs, trees, a person and a car. See [Starter library](topic:starter).
- **Components that stretch.** {{ui:Stretch this copy…}} makes one copy longer, wider or taller while its parts keep their sizes: legs stay put, shelves spread out, railing posts repeat. See [Components that stretch](topic:stretch).

### Files

- **DWG and DXF export.** {{ui:Export}} › {{ui:DWG for CAD (.dwg, 2004)}} or {{ui:DXF for CAD (.dxf, R12)}}. Faces become 3D faces, and groups and components become blocks. See [DWG and DXF export](topic:formats#dwg-and-dxf-export-dwg-dxf).
- **Save the 3D view as an image.** {{ui:Export}} › {{ui:Image of the view (.png)}}, or {{ui:Image at twice the size (.png)}}. See [Save the view as an image](topic:export-model#save-the-view-as-an-image).
- **Print the view, or save it as a PDF.** {{ui:Export}} › {{ui:PDF of the view (.pdf)}} or {{ui:Print the view…}}. See [Print the view](topic:export-model#print-the-view-or-save-it-as-a-pdf).
- **IFC storeys.** {{ui:Export}} › {{ui:IFC storeys…}} puts each group on its floor in the IFC file. See [IFC](topic:formats#ifc-ifc).
- **Recover your work.** If the tab or browser closes before you save, ModelCraft asks "Recover your work?" the next time. See [If the browser closes before you save](topic:files#if-the-browser-closes-before-you-save).
- **Open in ModelCraft from CadCraft.** In the CadCraft drafting app, {{ui:View}} › {{ui:More}} › {{ui:Open in ModelCraft}} hands the drawing over in a new tab. It arrives as a site plan. See [From CadCraft](topic:files#from-cadcraft-open-in-modelcraft).
- **Recent files** on the start card, in browsers that can reopen a file.

### Everywhere

- **Touch screens.** Tap to click, hold still to finish, two fingers to orbit and pinch to zoom, three fingers to pan. Buttons are bigger, and a bar offers {{ui:Done}}, {{ui:Cancel}} and {{ui:Undo}}. See [On a touch screen](topic:orbit-pan-zoom#on-a-touch-screen).
- **Language.** Every word on screen now comes from a language file. {{ui:Settings}} › {{ui:General}} › {{ui:Language}} offers Español (México). It is a machine-made draft that no one has reviewed yet, so some words may be wrong. The help stays in English.
- **Find a tool or setting.** Press {{key:Mod+K}}, or click {{ui:Find}} in the app bar, and type a few letters. See [Find a tool or setting](common:find-tools).

## Improved

- **DWG and DXF site plans bring in more.** Text (as single-stroke lettering), splines, ellipses, dimensions, hatches (as faces with their holes) and 3D faces now come in. See [Model on a site plan](topic:site-plan).
- **Big DWG files are read in the background,** so the page stays responsive.
- **More panel windows.** Panels can go to more than one window, and you can drag them between windows. A floating panel can be resized by touch. See [More than one panels window](common:arrange-panels#more-than-one-panels-window).
- **The view cube follows the app's language.**

## Fixed

- **Circles and rectangles on a face, started from a point.** A circle started on the midpoint of a pushed box's end face used to fall flat on the ground. Now a rectangle, circle or polygon started on a corner, a midpoint or an edge is drawn on the face under the pointer. See [Drawing on a face from a point](topic:inference#drawing-on-a-face-from-a-point).

## Files and compatibility

- **Native files:** a 0.4 `.modelcraft` file keeps curves, colors, hidden things, tags, section planes, axes, storeys and stretch rules. ModelCraft 0.3 can open it but leaves those out. If 0.3 saves it again, they are gone.
- **DWG export** writes the 2004 format. **DXF export** writes R12. Dimensions and guides are not exported.

## Not in this version yet

- Textures and image materials. Paint uses solid colors.
- Trim, Split and Outer shell.
- More than one section cut at a time.
- DWG and DXF layers as tags.
- [What is not built yet](topic:not-built-yet)
