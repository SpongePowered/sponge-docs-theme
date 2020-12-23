import os


def _split_environment_variable(name):
    value = os.environ.get(name)
    return value and value.split()


def build_locale_map():
    locales = {}
    for k, v in os.environ.items():
        if not k.startswith("LOCALES_"):
            continue
        k = k[len("LOCALES_"):].replace('_', '.')
        locales[k.lower()] = v.split()
    print("[sponge-docs-theme] Following versions and translations were found:")
    print(locales)
    return locales


def setup_html_context():
    github_user = os.environ.get('GITHUB_USER')
    github_repo = os.environ.get('GITHUB_REPO')
    github_version = os.environ.get('GITHUB_VERSION')

    return {
        # Path to docs source directory in the repository
        'conf_py_path': '/source/',

        # List of supported languages
        'locales': build_locale_map(),

        # Current version and list of documented versions
        'current_version': os.environ.get('VERSION'),
        'versions': _split_environment_variable('VERSIONS'),

        # HTML ZIP download (for offline usage)
        'html_download': os.environ.get('HTML_DOWNLOAD'),

        # Link to GitHub repository
        'display_github': github_user and github_repo and github_version,
        'github_user': github_user,
        'github_repo': github_repo,
        'github_version': github_version,
    }
