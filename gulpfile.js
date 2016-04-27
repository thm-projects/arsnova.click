/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

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
