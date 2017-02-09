import os.path
from .context import setup_html_context

VERSION = (0, 1, 5)
__version__ = '.'.join(str(v) for v in VERSION)


def init(app):
    # Return if we are not doing a HTML build
    if app.builder.name != 'html':
        return

    # Trim whitespace in resulting HTML
    app.builder.templates.environment.trim_blocks = True
    app.builder.templates.environment.lstrip_blocks = True


def setup(app):
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
