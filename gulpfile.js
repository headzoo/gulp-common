'use strict';

var gulp  = require('gulp');
var tasks = require('./index.js');

gulp.task('less', function() {
    return gulp.src('./src/*.less')
        .pipe(tasks.less())
        .pipe(gulp.dest('./build'));
});

gulp.task('scripts', function() {
    return gulp.src('./src/test.js')
        .pipe(tasks.scripts())
        .pipe(gulp.dest('./build'));
});