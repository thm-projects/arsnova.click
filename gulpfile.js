var gulp = require('gulp'),
		watch = require ('gulp-watch');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var stylish = require('jshint-stylish');

var paths = './arsnova.click/{client,lib,server,shared}/**/*.js';

gulp.task('default', ['codeCheck']);

gulp.task('watch', function () {
	gulp.start('codeCheck');
	gulp.watch(paths, ['codeCheck'])
});

gulp.task('codeCheck', function () {
	gulp.start('lint');
	gulp.start('jscs');
});

gulp.task('lint', function () {
  return gulp.src(paths)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('jscs', function () {
	return gulp.src(paths)
        .pipe(jscs())
        .pipe(jscs.reporter());
});
