const
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    del = require('del'),

    svgmin = require('gulp-svgmin'),

    // HTML
    nunjucks = require('gulp-nunjucks'),
    htmlmin = require('gulp-htmlmin'),

    // CSS
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cleanCSS = require('gulp-clean-css'),

    // JavaScript
    buble = require('gulp-buble'),
    uglify = require('gulp-uglify'),

    spawn = require('child_process').spawn,

    webserver = require('gulp-webserver');

gulp.task('clean', () => del(['sponge_docs_theme', 'dist', 'build']));

// Theme
gulp.task('theme:files', () =>
    gulp.src('src/theme/{*.*,{static,templates}/**}')
        .pipe(gulp.dest('sponge_docs_theme'))
);

gulp.task('theme:svg', () =>
    gulp.src('src/theme/svg/**')
        .pipe(svgmin())
        .pipe(gulp.dest('sponge_docs_theme/static'))
);

gulp.task('theme:scripts', () =>
    gulp.src('src/theme/scripts/**')
        .pipe(gulp.dest('dist/scripts'))
);

gulp.task('theme:scss', () =>
    gulp.src('src/theme/scss/spongedocs.scss')
        .pipe(sass())
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCSS())
        .pipe(gulp.dest('sponge_docs_theme/static'))
);

gulp.task('theme:js', () =>
    gulp.src('src/theme/js/*.js')
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
        .pipe(gulp.dest('sponge_docs_theme/static'))
);

gulp.task('theme:js:worker', () =>
    gulp.src('src/theme/js/offline/worker.js')
        .pipe(buble())
        .pipe(uglify({
            mangle: {
                toplevel: true
            }
        }))
        .pipe(gulp.dest('sponge_docs_theme/extra'))
);

gulp.task('theme:js:lib', () =>
    gulp.src('src/theme/js/lib/*.js')
        .pipe(uglify({
            output: {
                comments: 'some'
            }
        }))
        .pipe(gulp.dest('sponge_docs_theme/static'))
);


gulp.task('theme:js:gettext', ['theme:files'],
    shell('babel', 'python', ['setup.py', 'extract_messages', '-o', 'sponge_docs_theme/theme.pot'])
);

gulp.task('theme:build', ['theme:files', 'theme:svg', 'theme:scripts', 'theme:scss',
    'theme:js', 'theme:js:lib', 'theme:js:worker', 'theme:js:gettext']);

gulp.task('theme:watch', ['theme:build'], () => {
    gulp.watch('src/theme/{*.py,{static,templates}/**}', ['theme:files']);
    gulp.watch('src/theme/svg/**', ['theme:svg']);
    gulp.watch('src/theme/scripts/**', ['theme:scripts']);
    gulp.watch('src/theme/scss/**', ['theme:scss']);
    gulp.watch('src/theme/js/*.js', ['theme:js', 'theme:js:gettext']);
    gulp.watch('src/theme/js/offline/worker.js', ['theme:js:worker']);
});

gulp.task('theme', ['theme:watch']);

// Homepage
let renderData = null;

gulp.task('homepage:load-data', () =>
    !renderData && require('./src/homepage/data/spongedocs').loadData()
        .then(data => renderData = data)
);

gulp.task('homepage:html', ['homepage:load-data'], () =>
    gulp.src('src/homepage/html/*.html')
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
        .pipe(gulp.dest('dist/homepage'))
);

gulp.task('homepage:scss', () =>
    gulp.src('src/homepage/scss/spongedocs.scss')
        .pipe(sass())
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/homepage/_static/css'))
);

gulp.task('homepage:build', ['homepage:html', 'homepage:scss']);

gulp.task('homepage:watch', ['homepage:build'], () => {
    gulp.watch('src/homepage/html/**', ['homepage:html']);
    gulp.watch('src/homepage/scss/**', ['homepage:scss']);
});

gulp.task('homepage:webserver', ['homepage:watch'], () => {
    gulp.src('dist/homepage')
        .pipe(webserver({
            open: true,
            livereload: true
        }))
});

gulp.task('homepage', ['homepage:webserver']);

gulp.task('build', ['theme:build', 'homepage:build']);
gulp.task('default', ['build']);

function shell(plugin, command, args) {
    return (done) =>
        spawn(command, args, {stdio: 'inherit'})
            .on('error', (err) => {
                done(new gutil.PluginError(plugin, err))
            })
            .on('exit', (code) => {
                if (code == 0) {
                    // Process completed successfully
                    done()
                } else {
                    done(new gutil.PluginError(plugin, `Process failed with exit code ${code}`));
                }
            })
}
