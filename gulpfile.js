var isProd = process.env.NODE_ENV === 'production';

var gulp = require('gulp'),
  less = require('gulp-less'),
  livereload = require('gulp-livereload')
  concat = require('gulp-concat'),
  ecstatic = require('ecstatic'),
  http = require('http'),
  clean = require('gulp-clean'),
  notify = require('gulp-notify'),
  merge = require('merge-stream'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  jshint = require('gulp-jshint'),
  plumber = require('gulp-plumber'),
  devport = 1337;

var dest = __dirname+'/public/';

gulp.task('less', function(){
  return gulp.src([
      'less/reset.less',
      'less/variables.less',
      'less/*.less',
      'less/**/*.less',
      '!less/print.less'
    ])
    .pipe(less())
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(concat('style.css'))
    .pipe(gulp.dest(dest))
});

gulp.task('javascript', function(){
  var browserifyFile = function(file) {
    return browserify('./js/' + file, {
          insertGlobals : true,
          debug : !isProd
        }).bundle()
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(source(file))
        .pipe(gulp.dest(dest))
        .pipe(notify('Javascript updated'))
  };

  return merge(
    browserifyFile('app.js')
  );
});

gulp.task('copy', function() {
  var html = gulp.src('./index.html')
              .pipe(gulp.dest(dest));

  var fontAwesomeFonts = gulp.src('./node_modules/font-awesome/fonts/*')
                      .pipe(gulp.dest(dest+'fonts/'));
  var fontAwesomeCss = gulp.src('./node_modules/font-awesome/css/*.min.css')
                      .pipe(gulp.dest(dest+'fonts/'));
    
  var vendor = gulp.src([
      './vendor/**/*'
    ])
      .pipe(gulp.dest(dest+'vendor'));

  return merge(html, fontAwesomeFonts, fontAwesomeCss, vendor);
});

gulp.task('jshint', function() {
  return gulp.src('./js/**/*.js')
          .pipe(jshint())
          .pipe(jshint.reporter('jshint-stylish'))
          .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
});

// Legg til javascript byggesg

gulp.task('watch', ['deploy'], function() {

  http.createServer(
    ecstatic({
      root: dest,
      autoIndex: true,
      showDir: true
    })
  ).listen(devport);

  gulp.watch(['less/*.less', 'less/**/*.less'], ['less']);
  gulp.watch(['js/**/*'], ['jshint', 'javascript']);
  gulp.watch(['index.html', 'vendor/**/*'], ['copy']);

  livereload.listen();
  gulp.watch(dest+'**/*').on('change', livereload.changed);
});

gulp.task('clean', function() {
  return gulp.src([
      dest+'*.js'
    ])
    .pipe(clean({force:true}))
});

gulp.task('install', ['deploy']);
gulp.task('deploy', ['clean', 'copy', 'less', 'javascript']);
