# Changelog

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
