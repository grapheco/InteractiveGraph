# InteractiveGraphBrowser
InteractiveGraphBrowser is a web-based browser for large graph databases.

online demo: https://bluejoe2008.github.io/igbrowser/examples/example1.html

# dependencies
this project depends on following components:
```
    "async": "^2.6.0",
    "babel-core": "^6.26.0",
    "babel-loader": "^7.1.3",
    "babel-plugin-transform-es3-member-expression-literals": "^6.22.0",
    "babel-plugin-transform-es3-property-literals": "^6.22.0",
    "babel-plugin-transform-runtime": "^6.23.0",
    "babel-polyfill": "^6.26.0",
    "babel-preset-es2015": "^6.24.1",
    "babel-runtime": "^6.26.0",
    "babelify": "^8.0.0",
    "canvas": "^1.6.9",
    "events": "^2.0.0",
    "gulp": "^3.9.1",
    "gulp-browserify": "^0.5.1",
    "gulp-clean-css": "^3.9.2",
    "gulp-concat": "^2.6.1",
    "gulp-rename": "^1.2.2",
    "gulp-sourcemaps": "^2.6.4",
    "gulp-typescript": "^4.0.1",
    "gulp-uglify": "^3.0.0",
    "gulp-util": "^3.0.8",
    "jquery": "^3.3.1",
    "jsdom": "^11.6.2",
    "jsdom-global": "^3.0.2",
    "minify": "^3.0.4",
    "requirejs": "^2.3.5",
    "rimraf": "^2.6.2",
    "typescript": "^2.7.2",
    "uglify-js": "^2.8.29",
    "vinyl-buffer": "^1.0.1",
    "vinyl-source-stream": "^2.0.0",
    "vis": "^4.21.0",
    "webpack": "^3.3.0",
    "yargs": "^11.0.0"
```

# build & run

__Step 1.__ use `npm run build` or `gulp build` to build InteractiveGraphBrowser, which generates `igbrowser.min.js`.

in development mode, use `gulp dev` to generate `igbrowser.js`.

__Step 2.__ open `examples/example1.html` in web browser, such as `file:///Users/bluejoe/IdeaProjects/InteractiveGraphBrowser/examples/example1.html`. No web server is required, local file browse is ok.
