var gulp = require('gulp');
var jshint = require('gulp-jshint')
var jscs = require('gulp-jscs');
var stylish = require('jshint-stylish');

gulp.task('default', function () {
	gulp.start('lint');
	gulp.start('jscs');
});

gulp.task('lint', function () {
  return gulp.src('./arsnova.click/{client,lib,server,shared}/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('jscs', function () {
	return gulp.src('./arsnova.click/{client,lib,server,shared}/**/*.js')
        .pipe(jscs())
        .pipe(jscs.reporter());
});
