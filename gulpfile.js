const
    gulp = require('gulp'),
    PluginError = require('plugin-error'),
    concat = require('gulp-concat'),
    del = require('del'),

    svgmin = require('gulp-svgmin'),

    // HTML
    nunjucks = require('gulp-nunjucks'),
    htmlmin = require('gulp-htmlmin'),

    // CSS
    sass = require('gulp-sass')(require('sass')),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cleanCSS = require('gulp-clean-css'),

    // JavaScript
    buble = require('gulp-buble'),
    uglify = require('gulp-uglify'),

    spawn = require('child_process').spawn,

    connect = require('gulp-connect');

function clean() {
    return del(['sponge_docs_theme', 'dist', 'build']);
}

// Theme

function themeFiles() {
    return gulp.src('src/theme/{*.*,{static,templates}/**}')
        .pipe(gulp.dest('sponge_docs_theme'));
}

function themeSVG() {
    return gulp.src('src/theme/svg/**')
        .pipe(svgmin())
        .pipe(gulp.dest('sponge_docs_theme/static'));
}

function themeScripts() {
    return gulp.src('src/theme/scripts/**')
        .pipe(gulp.dest('dist/scripts'));
}

function themeScss() {
    return gulp.src('src/theme/scss/spongedocs.scss')
        .pipe(sass())
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCSS())
        .pipe(gulp.dest('sponge_docs_theme/static'));
}

function themeJS() {
    return gulp.src('src/theme/js/*.js')
        .pipe(concat('spongedocs.js'))
        .pipe(buble({
            transforms: {
                dangerousForOf: true
            }
        }))
        .pipe(uglify({
            mangle: {
                toplevel: true,
            },
        }))
        .pipe(gulp.dest('sponge_docs_theme/static'));
}

function themeJSWorker() {
    return gulp.src('src/theme/js/offline/worker.js')
        .pipe(buble())
        .pipe(uglify({
            mangle: {
                toplevel: true
            }
        }))
        .pipe(gulp.dest('sponge_docs_theme/extra'));
}

function themeJSLib() {
    return gulp.src('src/theme/js/lib/*.js')
        .pipe(uglify({
            output: {
                comments: 'some'
            }
        }))
        .pipe(gulp.dest('sponge_docs_theme/static'));
}

function themeJSgetText() {
    return shell('babel', 'python', ['setup.py', 'extract_messages', '-o', 'sponge_docs_theme/theme.pot']);
}

const themeBuild = gulp.series(themeFiles, themeSVG, themeScripts, themeScss, themeJS, themeJSLib, themeJSWorker, themeJSgetText);

const watch = gulp.series(themeBuild, function watch() {
    gulp.watch('src/theme/{*.py,{static,templates}/**}', themeFiles);
    gulp.watch('src/theme/svg/**', themeSVG);
    gulp.watch('src/theme/scripts/**', themeScripts);
    gulp.watch('src/theme/scss/**', themeScss);
    gulp.watch('src/theme/js/*.js', gulp.series(themeJS, themeJSgetText));
    gulp.watch('src/theme/js/offline/worker.js', themeJSWorker);
});

exports.theme = themeBuild;
exports.clean = clean;
exports['theme:build'] = themeBuild;
exports['theme:watch'] = watch;
exports.theme = watch;

// Homepage
let renderData = null;


function homepageLoadData(cb) {
    !renderData && require('./src/homepage/data/spongedocs').loadData()
        .then(data => {
            renderData = data
            cb();
        });
}

const homepageHTML = gulp.series(homepageLoadData, function homepageHtml() {
    return gulp.src('src/homepage/html/*.html')
        .pipe(nunjucks.compile(renderData))
        .pipe(htmlmin({
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            sortAttributes: true,
            sortClassName: true,
            useShortDoctype: true
        }))
        .pipe(gulp.dest('dist/homepage'));
});

function homepageScss() {
    return gulp.src('src/homepage/scss/spongedocs.scss')
        .pipe(sass())
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/homepage/_static/css'));
}

const homepageBuild = gulp.series(homepageHTML, homepageScss);

const homepageWatch = gulp.series(homepageBuild, function homepageWatch() {
    gulp.watch('src/homepage/html/**', homepageHTML);
    gulp.watch('src/homepage/scss/**', homepageScss);
});

exports['homepage:build'] = homepageBuild;
exports['homepage:watch'] = homepageWatch;

const homepageWebserver = gulp.parallel(homepageWatch, function homepageWebserver() {
    connect.server({
        root: 'dist/homepage',
        livereload: true
    });
});

exports['homepage:webserver'] = homepageWebserver;
exports.homepage = homepageWebserver;
exports.build = gulp.series(themeBuild, homepageBuild);
exports.default = this.build;


function shell(plugin, command, args) {
    return new Promise((resolve, reject) => {
        spawn(command, args, {stdio: 'inherit'})
            .on('error', (err) => {
                reject(new PluginError(plugin, err))
            })
            .on('exit', (code) => {
                if (code === 0) {
                    // Process completed successfully
                    resolve()
                } else {
                    reject(new PluginError(plugin, `Process failed with exit code ${code}`));
                }
            })
    });
}
