var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('start', function() {
    nodemon({
        script: 'bin/www',
        ext: 'twig js html',
        ignore: ['ignored.js'],
    })
    .on('restart', function() {
      console.log('restarted')
    })
})

