// Gulp
var gulp = require('gulp');

// Gulp plugins
var del = require('del');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');

// Stylus includes
var nib = require('nib');
var jeet = require('jeet');
var typographic = require('typographic');

// Stylus build configuration
var styl = stylus({
  use: [
    nib(),
    jeet(),
    typographic()
  ]
});

// Cleans the build directory
gulp.task('clean', function (cb) {
  del([
    './build/'
  ], cb);
});

// Copies theme.conf
gulp.task('conf', function () {
  return gulp.src('./src/theme.conf')
    .pipe(gulp.dest('./build/'));
});

// Copies html templates
gulp.task('html', function () {
  return gulp.src('./src/html/')
    .pipe(gulp.dest('./build'));
});

// Compiles and minifies stylus
gulp.task('styl', function () {
  return gulp.src('./src/styl/index.styl')
    .pipe(styl)
    .pipe(rename('sponge.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./build/static/'));
});

// Performs build
gulp.task('build', ['clean', 'conf', 'styl']);

// Compiles stylus with sourcemaps
gulp.task('styl-dev', function () {
  return gulp.src('./src/styl/index.styl')
    .pipe(sourcemaps.init())
    .pipe(styl)
    .pipe(sourcemaps.write())
    .pipe(rename('sponge.css'))
    .pipe(gulp.dest('./build/static/'));
});

gulp.task('build-dev', ['conf', 'styl-dev']);

// Rebuild when files are changed
gulp.task('dev', ['build-dev'], function (cb) {
  gulp.watch('./src/**/*', ['build-dev']);
});

// Make dev the default task
gulp.task('default', ['dev']);