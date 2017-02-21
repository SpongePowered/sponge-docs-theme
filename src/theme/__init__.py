import os.path

from sphinx.builders.html import StandaloneHTMLBuilder

from .context import setup_html_context

VERSION = (0, 1, 8)
__version__ = '.'.join(str(v) for v in VERSION)


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

    # Workaround for https://github.com/sphinx-doc/sphinx/issues/2345
    if app.config.language and '_' in app.config.language:
        app.config.html_search_language = strip_country(app.config.language)

    # Trim whitespace in resulting HTML
    app.builder.templates.environment.trim_blocks = True
    app.builder.templates.environment.lstrip_blocks = True


def setup(app):
    # Workaround for https://github.com/sphinx-doc/sphinx/issues/2345
    del app.builderclasses['html']
    app.add_builder(FixedHTMLBuilder)

    local_dir = os.path.abspath(os.path.dirname(__file__))

    # Set templates path
    app.config.templates_path = [os.path.join(local_dir, 'templates')]

    # Set HTML theme to Sphinx ReadTheDocs theme
    import sphinx_rtd_theme
    app.config.html_theme = 'sphinx_rtd_theme'
    app.config.html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]

    # Setup HTML context
    app.config.html_context = setup_html_context()

    # Set HTML static path and favicon
    app.config.html_static_path = [os.path.join(local_dir, 'static')]
    app.config.html_favicon = os.path.join(local_dir, 'favicon.ico')

    # Load helper extensions for our theme
    app.setup_extension('sponge_docs_theme.languages')
    app.setup_extension('sponge_docs_theme.helpers')

    # Register listener to set options when builder was initialized
    app.connect('builder-inited', init)

    return {'version': __version__}
