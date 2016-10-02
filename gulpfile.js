// Gulp
var gulp = require('gulp');
var gutil = require('gulp-util');

// Gulp plugins
var filter = require('gulp-filter');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var runSeq = require('run-sequence');

// Build dependencies
var del = require('del');

// Stylus includes
var nib = require('nib');
var jeet = require('jeet');
var typographic = require('typographic');

// Error handling
var handleError = function (error) {
  gutil.log(error.message);
  this.emit('end');
};



// Cleans the build directory
gulp.task('clean', function (cb) {
  del([
    './build/'
  ], cb);
});

// Copies theme.conf and html templates
gulp.task('copy', function () {
  return gulp.src(['./src/theme.conf', './src/html/**/*'])
    .pipe(gulp.dest('./build/'));
});

// Copies static files
gulp.task('static', function () {
  return gulp.src('./src/static/**/*')
    .pipe(gulp.dest('./build/static/'));
});

// Compiles and minifies stylus
gulp.task('sass', function () {
  return gulp.src('./src/scss/base.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('sponge.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./build/static/'));
});

// Copies and deploys python files
gulp.task('py', function () {
  return gulp.src('./src/py/**/*.py')
    .pipe(gulp.dest('./build/'));
});

// Distributes into sponge_docs_theme
gulp.task('dist', function () {
  return gulp.src('./build/**/*')
    .pipe(gulp.dest('./sponge_docs_theme'));
});

// Performs build
gulp.task('build', function (cb) {
  runSeq(
    'clean',
    ['copy', 'py', 'static', 'sass'],
    ['dist'],
    cb
  );
});

// Compiles stylus with sourcemaps
gulp.task('sass-dev', function () {
  return gulp.src('./src/scss/base.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', handleError)
    .pipe(sourcemaps.write())
    .pipe(rename('sponge.css'))
    .pipe(gulp.dest('./build/static/'));
});

gulp.task('build-dev', ['copy', 'py', 'static', 'sass-dev']);

// Rebuild when files are changed
gulp.task('dev', ['build-dev'], function (cb) {
  gulp.watch('./src/**/*', ['build-dev']);
});

// Make dev the default task
gulp.task('default', ['dev']);
