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
var replace = require('gulp-replace-pro');
var ts = require('gulp-typescript');
var tsp = ts.createProject('tsconfig.json');

var ENTRY = './entry.js';
var BUILD = __dirname + '/build';
var DEBUG_DIR = __dirname + '/../grapheco-browser/debug';
var RELEASE_DIR = __dirname + '/../grapheco-browser/release';
var DEMO_PROJECT_DIR = __dirname + '/../bluejoe2008.github.io';
var OUTPUT_JS = 'grapheco-browser.js';
var OUTPUT_MAP = 'grapheco-browser.map';
var OUTPUT_MIN_JS = 'grapheco-browser.min.js';
var OUTPUT_CSS = 'grapheco-browser.css';
var OUTPUT_MIN_CSS = 'grapheco-browser.min.css';
var TS_SOURCE = './src/main/scripts/**/*.ts';
var CSS_SOURCE = './src/main/resources/**/*.css';
var IMG_SOURCE = './src/main/resources/img/**/*';

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
    library: 'grapheco',
    libraryTarget: 'umd',
    path: BUILD,
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
gulp.task('clean-build', function (cb) {
  rimraf(BUILD + '/*', cb);
});

//.ts --> .js
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
    .pipe(gulp.dest(BUILD));

  cb();
});

//pack js files into a single file
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
    .pipe(gulp.dest(BUILD));
});

gulp.task('clean-debug-dist', function (cb) {
  rimraf(DEBUG_DIR + '/dist/', cb);
});

gulp.task('copy-resources-to-debug', ['clean-build', 'clean-debug-dist'], function () {
  var network = gulp.src(IMG_SOURCE)
    .pipe(gulp.dest(DEBUG_DIR + '/dist/img'));

  return network;
});

gulp.task('copy-output-to-debug', ['bundle'], function () {
  var network = gulp.src(BUILD + '/*.*')
    .pipe(gulp.dest(DEBUG_DIR + '/dist'));

  return network;
});

gulp.task('minify-css', ['bundle'], function () {
  return gulp.src(BUILD + "/" + OUTPUT_CSS)
    .pipe(cleanCSS())
    .pipe(rename(OUTPUT_MIN_CSS))
    .pipe(gulp.dest(BUILD));
});

gulp.task('minify-js', ['bundle'], function (cb) {
  var result = uglify.minify([BUILD + '/' + OUTPUT_JS], uglifyConfig);

  // note: we add a newline '\n' to the end of the minified file to prevent
  //       any issues when concatenating the file downstream (the file ends
  //       with a comment).
  fs.writeFileSync(BUILD + '/' + OUTPUT_MIN_JS, result.code + '\n');
  fs.writeFileSync(BUILD + '/' + OUTPUT_MAP, result.map.replace(/"\.\/dist\//g, '"'));

  cb();
});

gulp.task('bundle', ['bundle-js', 'bundle-css']);

gulp.task('debug', ['clean-build', 'build-ts', 'bundle', 'copy-resources-to-debug', 'copy-output-to-debug']);

gulp.task('clean-release', function (cb) {
  rimraf(RELEASE_DIR + '/*', cb);
});

gulp.task('copy-dist-to-release', ['minify-js', 'minify-css', 'clean-release'], function (cb) {
  var network = gulp.src(BUILD + '/*.min.*')
    .pipe(gulp.dest(RELEASE_DIR + '/dist'));

  return network;
});

gulp.task('copy-resources-to-release', ['clean-release'], function () {
  var network = gulp.src('./src/img/**/*')
    .pipe(gulp.dest(RELEASE_DIR + '/dist/img'));

  return network;
});

gulp.task('copy-examples-to-release', ['clean-release'], function (cb) {
  var network = gulp.src(DEBUG_DIR + '/examples/**/*')
    .pipe(gulp.dest(RELEASE_DIR + '/examples'));

  return network;
});

gulp.task('update-release-html', ['copy-examples-to-release'], function () {
  gulp.src(DEBUG_DIR + '/examples/**/*.html')
    .pipe(replace({
      '../dist/grapheco-browser.': '../dist/grapheco-browser.min.'
    }))
    .pipe(gulp.dest(RELEASE_DIR + '/examples'));
});

gulp.task('release', ['debug', 'copy-dist-to-release', 'copy-resources-to-release', 'copy-examples-to-release', 'update-release-html']);

gulp.task('clean-demo', ['release'], function (cb) {
  rimraf(DEMO_PROJECT_DIR + '/gebrowser/*', cb);
});

gulp.task('deploy-demo', ['clean-demo'], function () {
  var network = gulp.src(RELEASE_DIR + '/**/*')
    .pipe(gulp.dest(DEMO_PROJECT_DIR + '/gebrowser'));

  return network;
});

gulp.task('deploy', ['release', 'clean-demo', 'deploy-demo']);