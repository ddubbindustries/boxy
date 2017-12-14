'use strict';
const gulp = require('gulp');
const pkg = require('./package.json');
const browserSync = require('browser-sync').create();
const port = 8088;

gulp.task('serve', function() {
  browserSync.init({
    port: port,
    proxy: 'http://localhost:'+port,
    notify: false,
    reloadOnRestart: true,
    logPrefix: `${pkg.name}`,
    logLevel: 'debug',
    https: false,
    files: ['./']
  });
    
    //gulp.watch(['*']).on('change', browserSync.reload);
});

/*
gulp.task('serve', function(){
  nodemon({
    script: 'server/app.js',
    watch: 'server'          // not sure why this isn't working
  })
    .on('start', 'browsersync')
    .on('restart', function() {
      console.log('app.js restarted');
    });
});
*/