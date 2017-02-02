from setuptools import setup

setup(
    name='sponge-docs-theme',
    version='0.1.0',
    description='Theme for Sponge documentation',
    url='https://github.com/SpongePowered/sponge-docs-theme',
    author='SpongePowered',
    license='MIT',

    packages=['sponge_docs_theme'],
    install_requires=['sphinx_rtd_theme'],

    zip_safe=False,
    package_data={'sponge_docs_theme': [
        '*.json',
        'templates/*.html',
        'static/*/*'
    ]},
    scripts=[
        'bin/build-language',
        'bin/language-code',
        'bin/pr-comment',
        'bin/pr-deploy',
        'bin/travis-prepare'
    ],

    classifiers=[
        'Development Status :: 3 - Alpha',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Framework :: Sphinx',
        'Framework :: Sphinx :: Extension',
        'Framework :: Sphinx :: Theme',
    ]
)
