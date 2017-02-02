from setuptools import setup
import sponge_docs_theme

setup(
    name='sponge-docs-theme',
    version=sponge_docs_theme.__version__,
    description='Theme for Sponge documentation',
    url='https://github.com/SpongePowered/sponge-docs-theme',
    author='SpongePowered',
    license='MIT',

    packages=['sponge_docs_theme'],
    install_requires=['sphinx_rtd_theme'],

    zip_safe=False,
    package_data={'sponge_docs_theme': [
        '*.json',
        'favicon.ico',
        'templates/*.html',
        'static/*/*'
    ]},
    scripts=[
        'sponge_docs_theme/bin/build-language',
        'sponge_docs_theme/bin/language-code',
        'sponge_docs_theme/bin/pr-comment',
        'sponge_docs_theme/bin/pr-deploy',
        'sponge_docs_theme/bin/travis-prepare'
    ],

    classifiers=[
        'Development Status :: 3 - Alpha',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Framework :: Sphinx',
        'Framework :: Sphinx :: Extension',
    ]
)
