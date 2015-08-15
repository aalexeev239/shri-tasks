pkg = require './package.json'
gulp = require 'gulp'
plugins = require('gulp-load-plugins')(pattern: [
  '*{-,.}*'
  'csswring'
])
require('gulp-grunt') gulp

layoutPath = './'
srcPath = layoutPath + 'src/'



gulp.task 'styles', ->
  processors = [
    plugins.autoprefixerCore browsers: ['last 2 versions','ie 9','ie 8']
    plugins.cssMqpacker
    # plugins.csswring
    plugins.postcssAssets {loadPaths: ['img/','fonts/']}
  ]
  gulp.src srcPath+'styl/styles.styl'
  .pipe plugins.plumber errorHandler: plugins.notify.onError("Error: <%= error.message %>")
  .pipe plugins.sourcemaps.init()
  .pipe plugins.stylus
    errors: true
    'include css': true
  .pipe plugins.postcss processors
  .pipe plugins.rename suffix: '.min'
  .pipe plugins.sourcemaps.write '.'
  .pipe gulp.dest srcPath+'css'
  .pipe plugins.notify 'css подготовлен'
  .pipe plugins.browserSync.stream()
  return



gulp.task 'csslint', ->
  gulp.src srcPath+'css/styles.min.css'
  .pipe plugins.csslint '.csslintrc'
  .pipe plugins.csslint.reporter()
  # .pipe plugins.csslint.failReporter()
  return



gulp.task 'scripts', ->
  gulp.src [srcPath+'js/app/*.js', srcPath+'js/main.js']
  .pipe plugins.plumber errorHandler: plugins.notify.onError("Error: <%= error.message %>")
  .pipe plugins.concat 'scripts.js'
  # .pipe plugins.uglify()
  .pipe gulp.dest srcPath+'js/build'
  .pipe plugins.notify 'скрипты обработаны'
  return




gulp.task 'browser-sync', ->
  plugins.browserSync.init
    server: baseDir: srcPath



gulp.task 'default', ['browser-sync','grunt-assemble'], ->
  gulp.watch srcPath+'styl/**/*.styl',               ['styles']
  gulp.watch srcPath+'js/**/*.js',                   ['scripts']
  gulp.watch srcPath+'_templates/**/*.hbs',          ['grunt-assemble', plugins.browserSync.reload]
  return
