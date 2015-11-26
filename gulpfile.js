"use strict";

/*global require*/

var fs = require('fs');
var glob = require('glob-all');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var exorcist = require('exorcist');
var buffer = require('vinyl-buffer');
var transform = require('vinyl-transform');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var resolve = require('resolve');
var child_exec = require('child_process').exec;  // child_process is built in to node
var gettext_export_html = require('gulp-angular-gettext-export-html');

var specJSName = 'TerriaJS-specs.js';
var sourceGlob = ['./lib/**/*.js', '!./lib/ThirdParty/**/*.js'];
var testGlob = ['./test/**/*.js'];

var lang = 'fr';


// Create the build directory, because browserify flips out if the directory that might
// contain an existing source map doesn't exist.
if (!fs.existsSync('wwwroot/build')) {
    fs.mkdirSync('wwwroot/build');
}

gulp.task('gettext-compile-html', function () {
    if (!fs.existsSync('lib/Views/template/translated')) {
	fs.mkdirSync('lib/Views/template/translated');
    }
    return gulp.src('./lib/Views/template/*.html')
                   .pipe(gettext_export_html('po/*.po'))
                   .pipe(gulp.dest('./lib/Views/template/translated'))
                   .on('end', function copy() {
		       var trFiles = glob.sync('./lib/Views/template/translated/' + lang + '/*.html');
		       for(var i in trFiles) {
			   var targetFile = trFiles[i].replace('/template/translated/' + lang, '');
			   fs.writeFileSync(targetFile, fs.readFileSync(trFiles[i]));
		       }
		   });
});

gulp.task('build-specs', ['prepare-cesium'], function() {
    return build(specJSName, glob.sync(testGlob), false);
});

gulp.task('build', ['gettext-compile-html', 'build-specs']);

gulp.task('release-specs', ['prepare-cesium'], function() {
    return build(specJSName, glob.sync(testGlob), true);
});

gulp.task('release', ['release-specs']);

gulp.task('watch-specs', ['prepare-cesium'], function() {
    return watch(specJSName, glob.sync(testGlob), false);
});

gulp.task('watch', ['watch-specs']);

gulp.task('lint', function(){
    var sources = glob.sync(sourceGlob.concat(testGlob));
    return gulp.src(sources)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('docs', function(done) {
    child_exec('node ./node_modules/jsdoc/jsdoc.js ./lib -c ./jsdoc.json', undefined, done);
});

gulp.task('prepare-cesium', ['copy-cesium-assets']);

gulp.task('copy-cesium-assets', function() {
    var cesium = resolve.sync('terriajs-cesium/wwwroot', {
        basedir: __dirname,
        extentions: ['.'],
        isFile: function(file) {
            try { return fs.statSync(file).isDirectory(); }
            catch (e) { return false; }
        }
    });
    return gulp.src([
            cesium + '/**'
        ], { base: cesium })
        .pipe(gulp.dest('wwwroot/build/Cesium'));
});

gulp.task('default', ['lint', 'build']);

function bundle(name, bundler, minify, catchErrors) {
    // Combine main.js and its dependencies into a single file.
    var result = bundler.bundle();

    if (catchErrors) {
        // Display errors to the user, and don't let them propagate.
        result = result.on('error', function(e) {
            gutil.log('Browserify Error', e.message);
        });
    }

    result = result
        .pipe(source(name))
        .pipe(buffer());

    if (minify) {
        // Minify the combined source.
        // sourcemaps.init/write maintains a working source map after minification.
        // "preserveComments: 'some'" preserves JSDoc-style comments tagged with @license or @preserve.
        result = result
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify({preserveComments: 'some', mangle: true, compress: true}))
            .pipe(sourcemaps.write());
    }

    result = result
        // Extract the embedded source map to a separate file.
        .pipe(transform(function () { return exorcist('wwwroot/build/' + name + '.map'); }))

        // Write the finished product.
        .pipe(gulp.dest('wwwroot/build'));

    return result;
}

function build(name, files, minify) {
    // The poorly-named "debug: true" causes Browserify to generate a source map.
    return bundle(name, browserify({
        entries: files,
        debug: true
    }), minify, false);
}

function watch(name, files, minify) {
    var bundler = watchify(browserify({
        entries: files,
        debug: true,
        cache: {},
        packageCache: {}
    }), { poll: 1000 } );

    function rebundle() {
        var start = new Date();

        var result = bundle(name, bundler, minify, true);

        result.on('end', function() {
            console.log('Rebuilt ' + name + ' in ' + (new Date() - start) + ' milliseconds.');
        });

        return result;
    }

    bundler.on('update', rebundle);

    return rebundle();
}
