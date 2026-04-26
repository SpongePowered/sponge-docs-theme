VERSION = (1, 3, 0)
# Pre-release for the runtime-fetched version+locale selector. SpongeDocs
# pulls this in via requirements.txt on its dev branch for beta testing
# before promoting to stable.
__version__ = '1.3.0a1'


def setup(app):
    from . import theme
    theme.setup(app)
