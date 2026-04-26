# Changelog

## 1.3.0a1 (pre-release)

- Replace the build-time-baked version + locale matrix with a runtime
  selector. Both the homepage (`src/homepage/`) and the per-page widget in
  the Sphinx theme (`templates/versions.html`) now fetch `/manifest.json` on
  page load via a shared vanilla-JS module (`src/shared/version-selector.js`).
  The homepage uses a version `<select>` driving a flag-grid of locales for
  the chosen version (re-rendered on change). The per-page widget uses two
  `<select>` dropdowns. This unblocks the SpongeDocs k8s restructure where
  each docs version ships as its own Deployment glued by Traefik routing —
  adding a new version no longer requires rebuilding the homepage or any
  prior version's pages.
- Manifest shape consumed by the JS:

  ```json
  {
    "default": "release-12",
    "versions": [
      {
        "slug": "release-12",
        "label": "Stable (API 12)",
        "branch": "release-12",
        "locales": [
          { "code": "en",    "name": "English" },
          { "code": "de_DE", "name": "German" }
        ]
      }
    ]
  }
  ```

  Bare-string locales (`"locales": ["en", "de_DE"]`) are also accepted by
  the JS for forward/back compat — the code is used as the display name in
  that case. The `default` field is used to pre-select a version on the
  homepage; the JS does not assume Traefik rewrites `/stable/` (it just
  navigates to `/{slug}/{code}/`).
- `gulp homepage:build` still emits `dist/homepage/manifest.json` from the
  existing GitHub + Crowdin data sources (with the same offline
  `test-versions.json` / `test-languages.json` fallback when env tokens are
  unset), so a developer can serve `dist/homepage/` locally without a live
  k8s ConfigMap. Hand-editing that manifest and reloading the page is now
  enough to add or remove versions from the dropdown.
- Drop the `stable === '7.4.0'` hardcoded mapping in `crowdin.js`. The
  per-version manifest entry's `branch` field is now the source of truth
  for locating the matching Crowdin branch.
- Per-page selector: the previous `<dl>` of locale flags + version links is
  replaced by two `<select>` dropdowns. The current version, locale, and
  page path are stamped on the container as `data-current-version`,
  `data-current-locale`, and `data-page-path` so the runtime JS can
  pre-select the matching options and build cross-version URLs. The Crowdin
  in-context `translate` link is revealed by the JS only when the current
  version's manifest entry lists the `translate` pseudo-locale (preserves
  the prior conditional behavior).
- Python package API is unchanged (`sponge_docs_theme` setup.py entry
  points, `helpers.page_link`, `context.setup_html_context`). The
  `LOCALES_*` / `VERSIONS` env vars are no longer consumed by the template
  but are still read by `context.py` for backwards compatibility.

## 1.2.4

- Fix `KeyError` during per-locale builds on Sphinx 9. Sphinx 9 normalizes the
  `language` config to the hyphenated BCP-47 form (e.g. `de-DE`) before passing
  it to the Jinja template context, but the theme's `languages` dict is keyed
  in the underscored form that Crowdin's locale strings are rewritten to at
  load time. `get_language_code` / `get_language_display_name` now accept
  either form and fall back to the underscored variant, so the `versions.html`
  template renders cleanly under Sphinx 7, 8, and 9.

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
