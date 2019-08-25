# sponge-docs-theme
This repository is the home of the SpongeDocs homepage and theme. The SpongeDocs theme is a customized version of the
[Read the Docs Sphinx Theme](https://github.com/snide/sphinx_rtd_theme) with custom modifications to adapt it to our
brand.

We also extend it with a few additional features:

  - Language and version selection
  - "Offline Mode": [Service Worker](https://developer.mozilla.org/en/docs/Web/API/Service_Worker_API) that downloads
    the entire documentation to make it available offline.
  - Light/dark theme selection

## Contributing
The SpongeDocs theme is built using [Node.js](https://nodejs.org) and [gulp](http://gulpjs.com).

  1. [Install Python 3](https://www.python.org)
  2. [Install Node.js](https://nodejs.org)

In terminal or the command line, within the directory containing this README, run the following commands:

```bash
npm install -g gulp
npm install
pip install -r requirements.txt
```

### Project structure
The `src` folder contains all sources. All other folders (e.g. `sponge_docs_theme`) contain generated files and should
not be edited. The sources for the theme are in `src/theme`, the homepage sources are in `src/homepage`.

#### Theme
The theme can be built using `gulp theme:build`. To rebuild the theme when changes to the local source files are made,
run `gulp theme:watch`.

To test the changes, setup a [SpongeDocs](https://github.com/SpongePowered/SpongeDocs) workspace and install your local
`sponge-docs-theme` project as PIP package: `pip install -e path/to/your/sponge-docs-theme`.

#### Homepage
The homepage can be built using `gulp homepage:build`. Run `gulp homepage` to listen for local changes and to start a
webserver at http://localhost:8000.

## Release Procedure
1. Update `VERSION` in `src/theme/__init__.py`
2. Create a tag for the new version
3.
    ```
    gulp clean
    gulp theme:build
    python setup.py sdist bdist_wheel
    twine upload dist/*.* --sign
    ```
