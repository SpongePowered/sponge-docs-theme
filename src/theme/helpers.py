from . import __version__
from . import languages


def setup_helpers(app, pagename, templatename, ctx, event_arg):

    def get_page_link(version=None, language=None):
        return "/%s/%s/%s" % (version or ctx['current_version'],
                              languages.get_language_code(language or ctx['language']),
                              app.builder.get_target_uri(ctx['pagename']))

    ctx['page_link'] = get_page_link

    # Pages without source suffix are special pages like the search page
    if 'page_source_suffix' in ctx and ctx['display_github']:
        def get_github_page_link(operation='blob'):
            return "https://%s/%s/%s/%s/%s%s%s%s" % \
                   (ctx.get('github_host') or 'github.com', ctx['github_user'], ctx['github_repo'], operation,
                    ctx['github_version'], ctx['conf_py_path'], ctx['pagename'], ctx['page_source_suffix'])

        ctx['github_page_link'] = get_github_page_link


def setup(app):
    app.connect('html-page-context', setup_helpers)
    return {
        'version': __version__,
        'parallel_read_safe': True,
        'parallel_write_safe': True
    }
