// grab our gulp packages
const gulp 	      = require('gulp');
const gutil       = require('gulp-util');
const connect     = require('gulp-connect');
const sass  	    = require('gulp-sass');
const srcmaps     = require('gulp-sourcemaps');
const nunjucks    = require('gulp-nunjucks-render');
const browserify  = require('browserify');
const source      = require('vinyl-source-stream');
const uglify      = require('gulp-uglify');
const nodemon     = require('gulp-nodemon');
const babel       = require('babelify');
const concat      = require('gulp-concat');

//And now the tasks
gulp.task('sass', function() {
  return gulp.src('source/scss/**/*.scss')
  .pipe(srcmaps.init())  // Process the original sources
    .pipe(sass())
  .pipe(srcmaps.write()) // Add the map to modified source.
  .pipe(gulp.dest('public/assets/stylesheets'));
});

gulp.task('nunjucks', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src('source/pages/**/*.+(html|nunjucks)')
  // Renders template with nunjucks
  .pipe(nunjucks({
    path: ['source/templates']
  }))
  // output files in app folder
  .pipe(gulp.dest('public'));
});

gulp.task('misc', function () {
    return gulp.src('source/misc/**/*.*')
    .pipe(gulp.dest('public'));
});

gulp.task('img', function () {
    return gulp.src('source/img/*')
    .pipe(gulp.dest('public/img'));
});

gulp.task('browserify-dev', function() {
  return browserify('source/js/main.js')
    .transform(babel ,{
      // Use all of the ES2015 spec
      presets: ["es2015"]
    })
    .bundle()
    //Pass desired output filename to vinyl-source-stream
    .pipe(source('bundle.js'))
    // .pipe(buffer())
    // Start piping stream to tasks
    .pipe(gulp.dest('public/assets/scripts'));
});

gulp.task('browserify-build', function() {
  return browserify('source/js/main.js')
    .bundle()
    .pipe(source('bundle.js')) // gives streaming vinyl file object
    .pipe(buffer()) // convert from streaming to buffered vinyl file object
    .pipe(uglify()) // now gulp-uglify works
    .pipe(gulp.dest('public/assets/scripts'));
});

gulp.task('build-dev', ['sass', 'nunjucks', 'misc', 'browserify-dev']);

gulp.task('watch', ['build-dev'], function() {
  return gulp.watch('source/**/*.*', ['sass', 'nunjucks', 'img', 'misc', 'browserify-dev']);
});

gulp.task('serve', ['build-dev'], function () {
  nodemon({
    script: 'app.js',
    ignore: ['source/','public/']
  }).on('restart', function () {
    console.log('restarted!')
  })
});

gulp.task('default', ['build-dev', 'watch', 'serve']);
