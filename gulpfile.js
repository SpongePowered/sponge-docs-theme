const
    gulp = require('gulp'),
    del = require('del'),
    rename = require('gulp-rename'),

    // HTML
    nunjucksRender = require('gulp-nunjucks-md'),
    htmlmin = require('gulp-htmlmin'),

    // CSS
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),

    // JavaScript
    buble = require('gulp-buble'),
    uglify = require('gulp-uglify'),

    webserver = require('gulp-webserver');

gulp.task('clean', () => del(['sponge_docs_theme', 'dist']));

// Theme
gulp.task('theme:files', () =>
    gulp.src('src/theme/{*.*,{static,templates}/**}')
        .pipe(gulp.dest('sponge_docs_theme'))
);

gulp.task('theme:scripts', () =>
    gulp.src('src/theme/scripts/**')
        .pipe(gulp.dest('dist/scripts'))
);

gulp.task('theme:scss', () =>
    gulp.src('src/theme/scss/spongedocs.scss')
        .pipe(sass())
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCSS())
        .pipe(gulp.dest('sponge_docs_theme/static/css'))
);

gulp.task('theme:js', () =>
    gulp.src('src/theme/js/*.js')
        .pipe(buble())
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('sponge_docs_theme/static/js'))
);

gulp.task('theme:build', ['theme:scripts', 'theme:files', 'theme:scss', 'theme:js']);

gulp.task('theme:watch', ['theme:build'], () => {
    gulp.watch('src/theme/**', ['theme:files']);
    gulp.watch('src/theme/scripts/**', ['theme:scripts']);
    gulp.watch('src/theme/scss/**', ['theme:scss']);
    gulp.watch('src/theme/js/**', ['theme:js']);
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
        .pipe(nunjucksRender({
            path: 'src/homepage/html',
            data: renderData
        }))
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
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/homepage/css'))
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
