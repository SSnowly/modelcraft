<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * settings.inc — ModelCraft's own panel of the Settings dialog (core/components/app-settings.inc includes it,
 * as the "ModelCraft" tab). modelcraft.js reads and stores the fields (localStorage modelcraft.settings) and
 * resets them on "cc-settings-reset".
 *   keys      SketchUp style (default) / Blender style: shortcut keys and mouse buttons
 *   scroll    auto (default) / mouse (the wheel zooms) / trackpad (two fingers orbit, Shift pans, pinch zooms)
 *   snap      snap to points, edges and axes (default on; also the Snap button in the status bar)
 *   collide   solids stop where they touch instead of passing through (default on; also the status bar button)
 *   corner    corner indicator: view cube (default) / axis icon / none
 * Product names here only describe whose controls these resemble (nominative, plain text).
 */
?>
<fieldset class="shell-set" data-mc-settings>
  <legend><?= Lang::e('set.controls') ?></legend>
  <div class="shell-seg mc-set-seg2" role="radiogroup" aria-label="<?= Lang::e('set.controls') ?>">
    <label><input type="radio" name="mcKeys" value="sketchup"> <i class="bi bi-box" aria-hidden="true"></i> <?= Lang::e('set.controls.sketchup') ?></label>
    <label><input type="radio" name="mcKeys" value="blender"> <i class="bi bi-badge-3d" aria-hidden="true"></i> <?= Lang::e('set.controls.blender') ?></label>
  </div>
  <p class="shell-hint-text" data-mc-keys-hint></p>
</fieldset>
<fieldset class="shell-set">
  <legend><?= Lang::e('set.scroll') ?></legend>
  <div class="shell-seg" role="radiogroup" aria-label="<?= Lang::e('set.scroll') ?>">
    <label><input type="radio" name="mcScroll" value="auto"> <i class="bi bi-magic" aria-hidden="true"></i> <?= Lang::e('set.scroll.auto') ?></label>
    <label><input type="radio" name="mcScroll" value="mouse"> <i class="bi bi-mouse" aria-hidden="true"></i> <?= Lang::e('set.scroll.mouse') ?></label>
    <label><input type="radio" name="mcScroll" value="trackpad"> <i class="bi bi-hand-index" aria-hidden="true"></i> <?= Lang::e('set.scroll.trackpad') ?></label>
  </div>
  <p class="shell-hint-text"><?= Lang::e('set.scroll.hint') ?></p>
</fieldset>
<fieldset class="shell-set">
  <legend><?= Lang::e('set.snap') ?></legend>
  <label class="shell-check"><input type="checkbox" name="mcSnap"> <?= Lang::e('set.snap.snap') ?></label>
  <label class="shell-check"><input type="checkbox" name="mcCollide"> <?= Lang::e('set.snap.collide') ?></label>
  <p class="shell-hint-text"><?= Lang::e('set.snap.hint') ?></p>
</fieldset>
<fieldset class="shell-set">
  <legend><?= Lang::e('set.corner') ?></legend>
  <div class="shell-seg" role="radiogroup" aria-label="<?= Lang::e('set.corner') ?>">
    <label><input type="radio" name="mcCorner" value="cube"> <i class="bi bi-box" aria-hidden="true"></i> <?= Lang::e('set.corner.cube') ?></label>
    <label><input type="radio" name="mcCorner" value="axes"> <i class="bi bi-arrows-move" aria-hidden="true"></i> <?= Lang::e('set.corner.axes') ?></label>
    <label><input type="radio" name="mcCorner" value="none"> <i class="bi bi-slash-circle" aria-hidden="true"></i> <?= Lang::e('set.corner.none') ?></label>
  </div>
  <p class="shell-hint-text"><?= Lang::e('set.corner.hint') ?></p>
</fieldset>
<?php /* AI assistants and scripts (0.4 part 2 X.7, session agents): host.js fills this with Settings › Assistants (off by default) */ ?>
<div data-assistants-settings></div>
