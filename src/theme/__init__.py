VERSION = (0, 3, 9)
__version__ = '.'.join(str(v) for v in VERSION)


def setup(app):
    from . import theme
    theme.setup(app)
