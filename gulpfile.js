const gulp = require('gulp')
const sass = require('gulp-sass')
// const uglify = require('gulp-uglify')
// const streamify = require('gulp-streamify')
const gutil = require('gulp-util')
const source = require('vinyl-source-stream')

const budo = require('budo')
const browserify = require('browserify')
const resetCSS = require('node-reset-scss').includePath
const babelify = require('babelify').configure({
  presets: ['es2020']
})
const history = require('connect-history-api-fallback')

const entry = './src/app.js'
const entryDemo = './index.demo.js'
const outfile = 'bundle.js'
const production = process.env.NODE_ENV === 'production'

const handleError = (err) => {
  gutil.log(err)
  gutil.beep()
  this.emit('end')
}

// our CSS pre-processor
gulp.task('sass', function () {
  gulp.src('./src/sass/main.scss')
    .pipe(sass({
      outputStyle: production ? 'compressed' : undefined,
      includePaths: [ resetCSS ]
    }).on('error', sass.logError))
    .pipe(gulp.dest('./app'))
})

// the development task
gulp.task('watch', ['sass'], function (cb) {
  // watch SASS
  gulp.watch('src/sass/*.scss', ['sass'])

  // dev server
  budo(entryDemo, {
    serve: 'bundle.js',     // end point for our <script> tag
    stream: process.stdout, // pretty-print requests
    live: true,             // live reload & CSS injection
    dir: 'app',             // directory to serve
    open: true,        // whether to open the browser
    browserify: {
      transform: babelify,   // browserify transforms
      debug: true
    },
    middleware: [history()]
  }).on('exit', cb)
})

// the distribution bundle task
gulp.task('bundle', ['sass'], function () {
  var bundler = browserify(entry, { transform: babelify })
        .bundle()
  return bundler
    .pipe(source(outfile))
    // .pipe(streamify(uglify()))
    .on('error', handleError)
    .pipe(gulp.dest('./app'))
})

gulp.task('default', ['watch'])