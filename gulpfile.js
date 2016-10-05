var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var streamqueue = require('streamqueue');
var karma = require('karma').server;
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var conventionalRecommendedBump = require('conventional-recommended-bump');
var titleCase = require('title-case');

var config = {
  pkg : JSON.parse(fs.readFileSync('./package.json')),
  banner:
      '/*!\n' +
      ' * <%= pkg.name %>\n' +
      ' * <%= pkg.homepage %>\n' +
      ' * Version: <%= pkg.version %> - <%= timestamp %>\n' +
      ' * License: <%= pkg.license %>\n' +
      ' */\n\n\n'
};

gulp.task('default', ['build','test']);
gulp.task('build', ['scripts', 'styles']);
gulp.task('test', ['build', 'karma']);

gulp.task('watch', ['build','karma-watch'], function() {
  gulp.watch(['src/**/*.{js,html}'], ['build']);
});

gulp.task('clean', function(cb) {
  del(['dist', 'temp'], cb);
});


gulp.task('scripts', ['clean'], function() {

  var buildTemplates = function () {
    return gulp.src('src/**/*.html')
      .pipe($.minifyHtml({
             empty: true,
             spare: true,
             quotes: true
            }))
      .pipe($.angularTemplatecache({module: 'pie.board'}));
  };

  var buildLib = function(){
    return gulp.src(['src/common.js','src/*.js'])
      .pipe($.plumber({
        errorHandler: handleError
      }))
      .pipe($.concat('pie_board_without_templates.js'))
      .pipe($.header('(function () { \n"use strict";\n'))
      .pipe($.footer('\n}());'))
      .pipe(gulp.dest('temp'))
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.jshint.reporter('fail'));
  };

  return streamqueue({objectMode: true }, buildLib(), buildTemplates())
    .pipe($.plumber({
      errorHandler: handleError
    }))
    .pipe($.concat('angular-pie-board.js'))
    .pipe($.header(config.banner, {
      timestamp: (new Date()).toISOString(), pkg: config.pkg
    }))
    .pipe(gulp.dest('dist'))
    .pipe($.sourcemaps.init())
    .pipe($.uglify({preserveComments: 'some'}))
    .pipe($.concat('angular-pie-board.min.js'))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));

});

gulp.task('styles', ['clean'], function() {

  return gulp.src(['src/common.css'], {base: 'src'})
    .pipe($.sourcemaps.init())
    .pipe($.header(config.banner, {
      timestamp: (new Date()).toISOString(), pkg: config.pkg
    }))
    .pipe($.concat('angular-pie-board.css'))
    .pipe(gulp.dest('dist'))
    .pipe($.minifyCss())
    .pipe($.concat('angular-pie-board.min.css'))
    .pipe($.sourcemaps.write('../dist', {debug: true}))
    .pipe(gulp.dest('dist'));

});

gulp.task('karma', ['build'], function() {
  karma.start({configFile : __dirname +'/karma.conf.js', singleRun: true});
});

gulp.task('karma-watch', ['build'], function() {
  karma.start({configFile :  __dirname +'/karma.conf.js', singleRun: false});
});

gulp.task('pull', function(done) {
  $.git.pull();
  done();
});

gulp.task('add', function() {
  return gulp.src(['./*', '!./node_modules', '!./bower_components'])
    .pipe($.git.add());
});

gulp.task('recommendedBump', function(done) {
  /**
   * Bumping version number and tagging the repository with it.
   * Please read http://semver.org/
   *
   * To bump the version numbers accordingly after you did a patch,
   * introduced a feature or made a backwards-incompatible release.
   */

  conventionalRecommendedBump({preset: 'angular'}, function(err, importance) {
    // Get all the files to bump version in
    gulp.src(['./package.json'])
      .pipe($.bump({type: importance}))
      .pipe(gulp.dest('./'));

    done();
  });
});

gulp.task('bump', function(done) {
  runSequence('recommendedBump', 'add', done);
});

gulp.task('docs', function (cb) {
  runSequence('docs:clean', 'docs:assets', 'docs:index', cb);
});

gulp.task('docs:clean', function (cb) {
  del(['docs-built'], cb)
});

gulp.task('docs:assets', function () {
  gulp.src('./dist/*').pipe(gulp.dest('./docs-built/dist'));
  return gulp.src('docs/assets/*').pipe(gulp.dest('./docs-built/assets'));
});

gulp.task('docs:index', function () {
  return gulp.src('docs/index.html')    
    .pipe(gulp.dest('./docs-built/'));
});

var handleError = function (err) {
  console.log(err.toString());
  this.emit('end');
};
