// Runtime version + locale selector.
//
// Reads /manifest.json on page load and populates the controls inside any
// element marked with [data-version-selector]. Used in two places:
//
//   data-version-selector="homepage" — landing page; a <select> drives the
//     version, and the JS renders a flag grid of available locales for that
//     version. Re-renders the grid when the version changes.
//   data-version-selector="page" — per-doc-page widget rendered by the Sphinx
//     theme; reads the current version/locale/page from data-* attributes and
//     navigates immediately on change.
//
// Manifest shape:
//   {
//     "default": "release-12",
//     "versions": [
//       {
//         "slug": "release-12",
//         "label": "Stable (API 12)",
//         "branch": "release-12",
//         "locales": [
//           { "code": "en",    "name": "English" },
//           { "code": "de",    "flag": "de_DE", "name": "German" }
//         ]
//       }
//     ]
//   }
//
// `code` is the on-disk URL form (used to build /{slug}/{code}/). `flag` is
// optional and overrides the SVG basename used for the flag tile — it
// exists because the on-disk locale dirs and the bundled flag SVG names
// don't always agree (e.g. `pt-BR` on disk, `pt_BR.svg` for the flag).
// When `flag` is absent the code is used for both.
//
// Bare-string locales (`"locales": ["en", "de_DE"]`) are also accepted; the
// JS treats the code as the display name in that case.
(function () {
    'use strict';

    var MANIFEST_URL = '/manifest.json';

    function fetchManifest() {
        return fetch(MANIFEST_URL, { cache: 'no-cache', credentials: 'omit' })
            .then(function (resp) {
                if (!resp.ok) {
                    throw new Error('manifest.json HTTP ' + resp.status);
                }
                return resp.json();
            });
    }

    function normalizeLocale(entry) {
        if (typeof entry === 'string') return { code: entry, name: entry };
        return { code: entry.code, name: entry.name || entry.code, flag: entry.flag };
    }

    function localesOf(version) {
        return (version.locales || []).map(normalizeLocale);
    }

    function findVersion(manifest, slug) {
        if (!slug) return null;
        for (var i = 0; i < manifest.versions.length; i++) {
            if (manifest.versions[i].slug === slug) return manifest.versions[i];
        }
        return null;
    }

    function pickVersion(manifest, preferredSlug) {
        return findVersion(manifest, preferredSlug)
            || findVersion(manifest, manifest['default'])
            || manifest.versions[0];
    }

    function findLocaleCode(locales, preferred) {
        for (var i = 0; i < locales.length; i++) {
            if (locales[i].code === preferred) return locales[i].code;
        }
        return null;
    }

    function pickLocale(version, preferredCode) {
        var locales = localesOf(version);
        return findLocaleCode(locales, preferredCode)
            || findLocaleCode(locales, 'en')
            || (locales[0] && locales[0].code)
            || 'en';
    }

    function makeOption(value, label, selected) {
        var opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;
        if (selected) opt.selected = true;
        return opt;
    }

    function fillVersionSelect(select, manifest, selectedSlug) {
        select.innerHTML = '';
        for (var i = 0; i < manifest.versions.length; i++) {
            var v = manifest.versions[i];
            select.appendChild(makeOption(v.slug, v.label || v.slug, v.slug === selectedSlug));
        }
    }

    function fillLocaleSelect(select, version, selectedCode) {
        select.innerHTML = '';
        var locales = localesOf(version);
        for (var i = 0; i < locales.length; i++) {
            var loc = locales[i];
            select.appendChild(makeOption(loc.code, loc.name, loc.code === selectedCode));
        }
    }

    function show(el) { if (el) el.removeAttribute('hidden'); }
    function hide(el) { if (el) el.setAttribute('hidden', ''); }

    // Build a flag tile: <a href="/{slug}/{code}/"><img ...><p>{name}</p></a>
    // Flag SVGs are bundled with the homepage (gulp's homepageFlags task
    // copies them out of the theme into dist/homepage/_static/flags/) so the
    // homepage Deployment is self-contained — it doesn't need a docs version
    // Deployment to be reachable in order to render the locale grid.
    function buildLocaleTile(version, locale, tileClass) {
        var col = document.createElement('div');
        col.className = tileClass;

        var anchor = document.createElement('a');
        anchor.href = '/' + version.slug + '/' + locale.code + '/';

        var img = document.createElement('img');
        img.src = '/_static/flags/' + (locale.flag || locale.code) + '.svg';
        img.alt = locale.name;
        anchor.appendChild(img);

        var caption = document.createElement('p');
        caption.textContent = locale.name;
        anchor.appendChild(caption);

        col.appendChild(anchor);
        return col;
    }

    function fillLocaleGrid(grid, version) {
        grid.innerHTML = '';
        var tileClass = grid.getAttribute('data-tile-class') || 'col-xs-6 col-sm-4 col-md-3';
        var locales = localesOf(version);
        for (var i = 0; i < locales.length; i++) {
            grid.appendChild(buildLocaleTile(version, locales[i], tileClass));
        }
    }

    // Search forwards to /{slug}/en/search.html?q=… — English is canonical
    // (most complete), and the slug tracks the version dropdown so a search
    // hits the docs the user is browsing.
    function updateSearchForm(slug) {
        var form = document.querySelector('[data-version-search-form]');
        if (form) form.action = '/' + slug + '/en/search.html';
    }

    function renderHomepage(container, manifest) {
        var widget = container.querySelector('[data-version-widget]');
        var versionSelect = container.querySelector('[data-version-select]');
        var localeGrid = container.querySelector('[data-locale-grid]');
        if (!widget || !versionSelect || !localeGrid) return;

        var current = pickVersion(manifest, manifest['default']);

        fillVersionSelect(versionSelect, manifest, current.slug);
        fillLocaleGrid(localeGrid, current);
        updateSearchForm(current.slug);

        versionSelect.addEventListener('change', function () {
            var v = findVersion(manifest, versionSelect.value);
            if (!v) return;
            fillLocaleGrid(localeGrid, v);
            updateSearchForm(v.slug);
        });

        show(widget);
    }

    function renderPage(container, manifest) {
        var widget = container.querySelector('[data-version-widget]');
        var versionSelect = container.querySelector('[data-version-select]');
        var localeSelect = container.querySelector('[data-locale-select]');
        if (!widget || !versionSelect || !localeSelect) return;

        var currentSlug = container.getAttribute('data-current-version') || '';
        var currentLocale = container.getAttribute('data-current-locale') || 'en';
        var pagePath = container.getAttribute('data-page-path') || '';

        var current = pickVersion(manifest, currentSlug);

        fillVersionSelect(versionSelect, manifest, current.slug);
        fillLocaleSelect(localeSelect, current, pickLocale(current, currentLocale));

        // The Translate link lives in the sibling Contribute section, not
        // inside the selector container — look it up on the document.
        // Preserve the prior conditional behavior: the Crowdin in-context
        // 'translate' pseudo-locale link is only shown if the current version
        // actually exposes it.
        var translateLink = document.querySelector('[data-translate-link]');
        if (translateLink) {
            var hasTranslate = localesOf(current).some(function (l) { return l.code === 'translate'; });
            if (hasTranslate) {
                var anchor = translateLink.tagName === 'A' ? translateLink : translateLink.querySelector('a');
                if (anchor) anchor.href = '/' + current.slug + '/translate/' + pagePath;
                show(translateLink);
            }
        }

        versionSelect.addEventListener('change', function () {
            var v = findVersion(manifest, versionSelect.value);
            if (!v) return;
            navigate(v.slug, pickLocale(v, currentLocale));
        });
        localeSelect.addEventListener('change', function () {
            navigate(versionSelect.value, localeSelect.value);
        });

        show(widget);

        function navigate(slug, locale) {
            window.location.href = '/' + slug + '/' + locale + '/' + pagePath;
        }
    }

    function failContainer(container) {
        hide(container.querySelector('[data-version-widget]'));
        show(container.querySelector('[data-version-fallback]'));
    }

    function init() {
        var containers = document.querySelectorAll('[data-version-selector]');
        if (!containers.length) return;

        fetchManifest().then(function (manifest) {
            if (!manifest || !Array.isArray(manifest.versions) || manifest.versions.length === 0) {
                throw new Error('manifest.json missing versions');
            }
            for (var i = 0; i < containers.length; i++) {
                var c = containers[i];
                try {
                    if (c.getAttribute('data-version-selector') === 'page') {
                        renderPage(c, manifest);
                    } else {
                        renderHomepage(c, manifest);
                    }
                } catch (err) {
                    if (window.console) console.warn('version-selector render failed', err);
                    failContainer(c);
                }
            }
        }).catch(function (err) {
            if (window.console) console.warn('version-selector fetch failed', err);
            for (var i = 0; i < containers.length; i++) failContainer(containers[i]);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
