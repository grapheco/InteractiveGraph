var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var webpack = require('webpack');
var uglify = require('uglify-js');
var rimraf = require('rimraf');
var argv = require('yargs').argv;

var ts = require('gulp-typescript');
var tsp = ts.createProject('tsconfig.json');

var ENTRY = './entry.js';
var DIST = __dirname + '/dist';
var OUTPUT_JS = 'igbrowser.js';
var OUTPUT_MAP = 'igbrowser.map';
var OUTPUT_MIN_JS = 'igbrowser.min.js';
var OUTPUT_CSS = 'igbrowser.css';
var OUTPUT_MIN_CSS = 'igbrowser.min.css';
var TS_SOURCE = './src/**/*.ts';
var CSS_SOURCE = './src/**/*.css';

var webpackModule = {
  loaders: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        cacheDirectory: true, // use cache to improve speed
        babelrc: true // use the .baberc file
      }
    }
  ],

  // exclude requires of moment.js language files
  wrappedContextRegExp: /$^/
};

var webpackConfig = {
  entry: ENTRY,
  output: {
    library: 'igraph',
    libraryTarget: 'umd',
    path: DIST,
    filename: OUTPUT_JS,
    sourcePrefix: '  '
  },
  module: webpackModule,
  plugins: [],
  cache: true,
};

var uglifyConfig = {
  outSourceMap: OUTPUT_MAP,
  output: {
    comments: /@license/
  }
};

// create a single instance of the compiler to allow caching
var compiler = webpack(webpackConfig);

function handleCompilerCallback(err, stats) {
  if (err) {
    gutil.log(err.toString());
  }

  if (stats && stats.compilation && stats.compilation.errors) {
    // output soft errors
    stats.compilation.errors.forEach(function (err) {
      gutil.log(err.toString());
    });

    if (err || stats.compilation.errors.length > 0) {
      gutil.beep(); // TODO: this does not work on my system
    }
  }
}

// clean the dist/img directory
gulp.task('clean', function (cb) {
  rimraf(DIST + '/*', cb);
});

gulp.task('build-ts', function (cb) {
  return gulp.src(TS_SOURCE)
    .pipe(tsp({
      error: (error, typescript) => {
        console.info("failed to compile:");
        console.error(error)
      },
      finish: (results) => {
        console.info("successed to compile:");
        console.info(results);
      }
    }))
    .pipe(gulp.dest(DIST));

  cb();
});

gulp.task('bundle-js', ['build-ts'], function (cb) {
  compiler.run(function (err, stats) {
    handleCompilerCallback(err, stats);
    cb();
  });
});

// bundle and minify css
gulp.task('bundle-css', function () {
  return gulp.src(CSS_SOURCE)
    .pipe(concat(OUTPUT_CSS))
    .pipe(gulp.dest(DIST))
    // TODO: nicer to put minifying css in a separate task?
    .pipe(cleanCSS())
    .pipe(rename(OUTPUT_MIN_CSS))
    .pipe(gulp.dest(DIST));
});

gulp.task('copy', ['clean'], function () {
  var network = gulp.src('./src/img/**/*')
    .pipe(gulp.dest(DIST + '/img'));

  return network;
});

gulp.task('minify', ['bundle-js'], function (cb) {
  var result = uglify.minify([DIST + '/' + OUTPUT_JS], uglifyConfig);

  // note: we add a newline '\n' to the end of the minified file to prevent
  //       any issues when concatenating the file downstream (the file ends
  //       with a comment).
  fs.writeFileSync(DIST + '/' + OUTPUT_MIN_JS, result.code + '\n');
  fs.writeFileSync(DIST + '/' + OUTPUT_MAP, result.map.replace(/"\.\/dist\//g, '"'));

  cb();
});

gulp.task('bundle', ['bundle-js', 'bundle-css', 'copy']);

// The default task (called when you run `gulp`)
gulp.task('dev', ['clean', 'build-ts', 'bundle']);

gulp.task('default', ['clean', 'build-ts', 'bundle', 'minify']);