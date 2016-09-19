var gulp = require('gulp'),
    inlineNg2Template = require('gulp-inline-ng2-template');

gulp.task('inline-templates', function () {
    return gulp.src('./**/*.ts')
        .pipe(inlineNg2Template({UseRelativePaths: true, indent: 0, removeLineBreaks: true}))
        .pipe(gulp.dest('inlined'));
});