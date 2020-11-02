VERSION = (0, 4, 3)
__version__ = '.'.join(str(v) for v in VERSION)


def setup(app):
    from . import theme
    theme.setup(app)
