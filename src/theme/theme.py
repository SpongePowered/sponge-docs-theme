import json
import os.path

from sphinx import locale
from sphinx.builders.html import StandaloneHTMLBuilder
from sphinx.util import logging
from sphinx.util.osutil import copyfile

from . import __version__
from .context import setup_html_context

PACKAGE_DIR = os.path.abspath(os.path.dirname(__file__))


def strip_country(l):
    return l[:l.index('_')]


class FixedHTMLBuilder(StandaloneHTMLBuilder):
    def _get_translations_js(self):
        # Check the regular path
        jsfile = super()._get_translations_js()
        if jsfile or '_' not in self.config.language:
            return jsfile

        # Check again but with the country part stripped
        old_language = self.config.language
        self.config.language = strip_country(old_language)
        jsfile = super()._get_translations_js()

        # Restore old language
        self.config.language = old_language
        return jsfile


def init(app):
    # Return if we are not doing a HTML build
    if app.builder.name != 'html':
        return

    # Trim whitespace in resulting HTML
    app.builder.templates.environment.trim_blocks = True
    app.builder.templates.environment.lstrip_blocks = True

    if not app.config.language or app.config.language == 'en':
        return

    # Workaround for https://github.com/sphinx-doc/sphinx/issues/2345
    if '_' in app.config.language:
        app.config.html_search_language = strip_country(app.config.language)

    # Add translations.js for our JavaScript translations
    if '_static/translations.js' not in app.builder.script_files:
        app.builder.script_files.append('_static/translations.js')

    app.connect('build-finished', copy_js_translations)


def copy_js_translations(app, exception):
    if exception:
        return

    translator, has_translations = locale.init([os.path.join(app.srcdir, x) for x in app.config.locale_dirs],
                                               app.config.language, 'theme')
    # Append our translations to the file
    with open(os.path.join(app.builder.outdir, '_static', 'translations.js'), 'a+t') as f:
        if not has_translations:
            return

        translations = {}
        for (key, translation) in translator._catalog.items():
            if key and key != translation:
                translations[key] = translation

        logging.getLogger(__name__).info('Appending %d JavaScript translations' % len(translations))

        # Append our translations
        f.write('$.extend(Documentation.TRANSLATIONS, ')
        json.dump(translations, f, sort_keys=True)
        f.write(');')


def finish(app, exception):
    if exception or app.builder.name != 'gettext':
        return

    # Copy our JS theme translations
    copyfile(os.path.join(PACKAGE_DIR, 'theme.pot'), os.path.join(app.builder.outdir, 'theme.pot'))


def setup(app):
    # Workaround for https://github.com/sphinx-doc/sphinx/issues/2345
    del app.registry.builders['html']
    app.add_builder(FixedHTMLBuilder)

    # Set templates path
    app.config.templates_path = [os.path.join(PACKAGE_DIR, 'templates')]

    # Set HTML theme to Sphinx ReadTheDocs theme
    app.config.html_theme = 'sphinx_rtd_theme'

    # Setup HTML context
    app.config.html_context = setup_html_context()

    # Set HTML static path and favicon
    app.config.html_static_path = [os.path.join(PACKAGE_DIR, 'static')]
    app.config.html_favicon = os.path.join(PACKAGE_DIR, 'favicon.ico')
    app.config.html_extra_path = [os.path.join(PACKAGE_DIR, 'extra')]

    # Load helper extensions for our theme
    app.setup_extension('sponge_docs_theme.languages')
    app.setup_extension('sponge_docs_theme.helpers')

    # Register listener to set options when builder was initialized
    app.connect('builder-inited', init)
    app.connect('build-finished', finish)

    return {
        'version': __version__,
        'parallel_read_safe': True,
        'parallel_write_safe': True
    }
