var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var webpack = require('webpack');
var uglify = require('uglify-js');
var rimraf = require('rimraf');

var replace = require('gulp-replace-pro');
var ts = require('gulp-typescript');
var tsp = ts.createProject('tsconfig.json');
const zip = require('gulp-zip');
const sass = require('gulp-sass');
var typedoc = require("gulp-typedoc");
var war = require("gulp-war");

var PRODUCT_NAME = 'interactive-graph';
var VERSIONED_PRODUCT_NAME = PRODUCT_NAME + '-0.1.0';

var ENTRY = __dirname + '/src/exports.js';
var RELEASE_DIR = __dirname + '/dist';
var SOURCE_EXAMPLES_DIR = __dirname + '/src/test/webapp';
var BUILD_PACK_DIR = __dirname + '/build';
var BUILD_OBJ_DIR = BUILD_PACK_DIR + '/obj';

var API_DOC_DIR = RELEASE_DIR + '/api';
var LIB_ZIP_NAME = 'igraph.zip';
var API_DOC_ZIP_NAME = 'api-doc.zip';
var EXAMPLES_ZIP_NAME = 'examples.zip';
var EXAMPLES_WAR_NAME = 'igraph.war'
var RELEASE_LIB_DIR = RELEASE_DIR + '/igraph';
var RELEASE_EXAMPLES_DIR = RELEASE_DIR + '/examples';
var LIB_DIR_IN_RELEASE_EXAMPLES = RELEASE_EXAMPLES_DIR + '/lib/' + VERSIONED_PRODUCT_NAME;

var OUTPUT_JS = PRODUCT_NAME + '.js';
var OUTPUT_MAP = PRODUCT_NAME + '.map';
var OUTPUT_MIN_JS = PRODUCT_NAME + '.min.js';
var OUTPUT_CSS = PRODUCT_NAME + '.css';
var OUTPUT_MIN_CSS = PRODUCT_NAME + '.min.css';
var TYPESCRIPT_SOURCE = './src/main/typescript/**/*.ts';
var CSS_SOURCE = './src/main/resources/**/*.css';
var SASS_SOURCE = './src/main/resources/styles/*.scss';
var SASS_OUTPUT = './src/main/resources/styles/';
var WEBPACK_LIBRARY = 'igraph';

var RELEASE_REPLACE_1 = '../../../build/' + PRODUCT_NAME;
var RELEASE_REPLACE_2 = './lib/' + VERSIONED_PRODUCT_NAME + '/' + PRODUCT_NAME + '.min';

var webpackModule = {
  loaders: [{
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    query: {
      cacheDirectory: true, // use cache to improve speed
      babelrc: true // use the .baberc file
    }
  }],

  // exclude requires of moment.js language files
  wrappedContextRegExp: /$^/
};

var webpackConfig = {
  entry: ENTRY,
  output: {
    library: WEBPACK_LIBRARY,
    libraryTarget: 'umd',
    path: BUILD_PACK_DIR,
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

gulp.task('clean-build', function (cb) {
  rimraf(BUILD_PACK_DIR + '/*', cb);
});

//.ts --> .js
gulp.task('build-ts', ['clean-build'], function (cb) {
  return gulp.src(TYPESCRIPT_SOURCE)
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
    .pipe(gulp.dest(BUILD_OBJ_DIR));

  cb();
});

//pack js files into a single file
gulp.task('bundle-js', ['build-ts'], function (cb) {
  compiler.run(function (err, stats) {
    handleCompilerCallback(err, stats);
    cb();
  });
});

// sass
gulp.task('bundle-scss', function () {
    gulp.src(SASS_SOURCE)
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(gulp.dest(SASS_OUTPUT));
});

// bundle and minify css
gulp.task('bundle-css', ['clean-build'], function () {
  return gulp.src(CSS_SOURCE)
    .pipe(concat(OUTPUT_CSS))
    .pipe(gulp.dest(BUILD_PACK_DIR));
});

gulp.task('clean-dist', function (cb) {
  rimraf(RELEASE_DIR, cb);
});

gulp.task('bundle', ['bundle-js','bundle-scss', 'bundle-css']);

/////////gulp build///////////
gulp.task('build', ['clean-build', 'build-ts', 'bundle']);

gulp.task('minify-css', ['bundle'], function () {
  return gulp.src(BUILD_PACK_DIR + "/" + OUTPUT_CSS)
    .pipe(cleanCSS())
    .pipe(rename(OUTPUT_MIN_CSS))
    .pipe(gulp.dest(BUILD_PACK_DIR));
});

gulp.task('minify-js', ['bundle'], function (cb) {
  var result = uglify.minify([BUILD_PACK_DIR + '/' + OUTPUT_JS], uglifyConfig);

  fs.writeFileSync(BUILD_PACK_DIR + '/' + OUTPUT_MIN_JS, result.code + '\n');
  fs.writeFileSync(BUILD_PACK_DIR + '/' + OUTPUT_MAP, result.map.replace(/"\.\/dist\//g, '"'));

  cb();
});

gulp.task('copy-build-to-lib', ['minify-js', 'minify-css', 'clean-dist'], function (cb) {
  var stream = gulp.src(BUILD_PACK_DIR + '/*.min.*')
    .pipe(gulp.dest(RELEASE_LIB_DIR));

  return stream;
});

gulp.task('copy-examples-to-release', ['clean-dist'], function (cb) {
  var stream = gulp.src(SOURCE_EXAMPLES_DIR + '/**/*')
    .pipe(gulp.dest(RELEASE_EXAMPLES_DIR));

  return stream;
});

gulp.task('copy-lib-to-release', ['copy-build-to-lib', 'copy-examples-to-release'], function (cb) {
  var stream = gulp.src(RELEASE_LIB_DIR + '/**/*')
    .pipe(gulp.dest(LIB_DIR_IN_RELEASE_EXAMPLES));

  return stream;
});

gulp.task('ts-doc', ['clean-dist'], function (cb) {
  return gulp
    .src([TYPESCRIPT_SOURCE])
    .pipe(typedoc({
      // TypeScript options (see typescript docs)
      module: "umd",
      target: "es6",
      includeDeclarations: false,
      excludeExternals: true,

      // Output options (see typedoc docs)
      out: API_DOC_DIR,
      //json: "./docs/api/file.json",
      //mode: "modules",
      mode: "file",
      // TypeDoc options (see typedoc docs)
      name: "InteractiveGraph API",
      ignoreCompilerErrors: true,
      version: true,
      readme: 'none',
      hideGenerator: true,
      excludePrivate: true
    }));
});

gulp.task('update-release-html', ['copy-examples-to-release'], function () {
  gulp.src(RELEASE_EXAMPLES_DIR + '/**/*.html')
    .pipe(replace(RELEASE_REPLACE_1, RELEASE_REPLACE_2))
    .pipe(gulp.dest(RELEASE_EXAMPLES_DIR));
});

gulp.task('zip-lib', ['copy-lib-to-release'], function () {
  return gulp.src(RELEASE_LIB_DIR + '/**/*.*')
    .pipe(zip(LIB_ZIP_NAME))
    .pipe(gulp.dest(RELEASE_DIR));
});

gulp.task('zip-api-doc', ['ts-doc'], function () {
  return gulp.src(API_DOC_DIR + '/**/*.*')
    .pipe(zip(API_DOC_ZIP_NAME))
    .pipe(gulp.dest(RELEASE_DIR));
});

gulp.task('zip-examples', ['update-release-html', 'copy-lib-to-release'], function () {
  return gulp.src(RELEASE_EXAMPLES_DIR + '/**/*.*')
    .pipe(zip(EXAMPLES_ZIP_NAME))
    .pipe(gulp.dest(RELEASE_DIR));
});

gulp.task('war-examples', ['update-release-html', 'copy-lib-to-release'], function () {
  return gulp.src(RELEASE_EXAMPLES_DIR + '/**/*.*')
    .pipe(war({}))
    .pipe(zip(EXAMPLES_WAR_NAME))
    .pipe(gulp.dest(RELEASE_DIR));
});

/////////gulp release///////////
gulp.task('release', ['build', 'copy-build-to-lib', 'copy-examples-to-release', 'copy-lib-to-release',
  'ts-doc', 'update-release-html', 'zip-examples', 'war-examples', 'zip-lib', 'zip-api-doc'
]);

/////////gulp watch///////////
gulp.task('watch', function(){
    gulp.watch(SASS_SOURCE, ['bundle-scss']);
});