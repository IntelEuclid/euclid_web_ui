/*
In oreder to run the app you should install all dependencies:

npm isntall
bower install

When running Ubuntu - install nodejs and add symling to node: sud ln -s /usr/bin/nodejs /usr/bin
*/


var browserify = require('browserify');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');


gulp.task('browserify', function() {
    var b = browserify({
        entries: './js/bootstrapper.js',
        debug: true
    });

    var stream = b.bundle()
        .pipe(source('bundle.js')) // gives streaming vinyl file object
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        //  .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./build'));

    return stream;
});

gulp.task('default', ['browserify'], function() {

    console.log('Gulp and running Intel euclid!');
    startExpress();
    startLivereload();
    gulp.watch(['*.html', 'build/*.js', 'css/*.css', 'tpl/*.html'], notifyLiveReload);
    gulp.watch(['js/**/*.js', 'templates/*'], ['browserify']);
});

// `gulp.task()` defines task that can be run calling `gulp xyz` from the command line
// The `default` task gets called when no task name is provided to Gulp
var EXPRESS_PORT = 5000;
var EXPRESS_ROOT = __dirname;
var LIVERELOAD_PORT = 35729;

function startExpress() {

    var express = require('express');
    var app = express();
    app.use(require('connect-livereload')());
    app.use(express.static(__dirname));
    app.listen(EXPRESS_PORT);

}

var lr;

function startLivereload() {
    lr = require('tiny-lr')();
    lr.listen(LIVERELOAD_PORT);
}


function notifyLiveReload(event) {
    var fileName = require('path').relative(EXPRESS_ROOT, event.path);

    console.log(event);

    lr.changed({
        body: {
            files: [fileName]
        }
    });
}