def init(app):
    # Return if we are not doing a HTML build
    if app.builder.name != 'html':
        return

    # Trim whitespace in resulting HTML
    app.builder.templates.environment.trim_blocks = True
    app.builder.templates.environment.lstrip_blocks = True

def setup_helpers(app, pagename, templatename, ctx, event_arg):

    def get_page_link(version=None, language=None):
        return "/%s/%s/%s" % (version or ctx['current_version'], language or ctx['language'],
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
    app.connect('builder-inited', init)
    app.connect('html-page-context', setup_helpers)
    return {'version': '0.1'}
