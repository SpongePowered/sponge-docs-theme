VERSION = (0, 5, 0)
__version__ = '.'.join(str(v) for v in VERSION)


def setup(app):
    from . import theme
    theme.setup(app)
