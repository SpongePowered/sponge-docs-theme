# Changelog

## 1.2.3

- Register `translations.js` via `builder.add_js_file()` instead of appending to
  `builder.script_files`. In Sphinx 7+, `script_files` contains `JavaScript`
  objects rather than strings, so the old duplicate-guard check no longer
  matched and caused the file to be re-appended on every build.

## 1.2.2

- Bump `install_requires` ceiling to `sphinx>=4.5,<10` so the theme installs
  alongside Sphinx 9.x. No template, CSS, or Python API changes — verified by
  running a full SpongeDocs build with `-W` against Sphinx 9.1.0.

## 1.2.0

- Bump `install_requires` to `sphinx-rtd-theme>=2.0,<4` and `sphinx>=4.5,<9` so
  the theme installs alongside modern Sphinx (5.x / 6.x / 7.x).
  `sphinx-rtd-theme 1.0` pinned `docutils<0.18`, which blocked SpongeDocs from
  upgrading past Sphinx 4.5.
- No template or CSS changes. The RTD-theme 2.x/3.x class names this theme
  hooks into (`wy-*`, `rst-versions`, `rst-current-version`, `rst-other-versions`,
  `rst-footer-buttons`, `headerlink`) and the overridden block (`sidebartitle`)
  are unchanged in the target versions.

## 1.1.0 and earlier

See Git history.
