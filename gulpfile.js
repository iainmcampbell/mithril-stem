var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
var inlineSource = require('gulp-inline-source');

gulp.task('styles', function() {
 return gulp.src('src/sass/style.sass' )
   .pipe(sourcemaps.init())
   .pipe(sass({
     style: 'expanded',
     indentedSyntax: true
   }).on('error', sass.logError))
   .pipe(autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
   .pipe(sourcemaps.write('./'))
   .pipe(gulp.dest( 'src/' ))
});

// ********************************************************

// clean the dist folder
gulp.task('clean', function(){
  return del([ 'dist/*', '!dist/.git*' ]);
});

gulp.task('scripts', function(){
  var b = browserify({
    entries: ['src/js/main.js'],
    debug: true
  })
  return b.bundle()
    .on('error', e => gutil.log(gutil.colors.red('Error: ') + e.message))
    .pipe(source('bundle.min.js')) // <- OUTPUT FILENAME HERE
    .pipe(buffer()) // only need this if you are dealing with multiple files?
    .pipe(sourcemaps.init({loadMaps: true})) // loadMaps extracts source map from browserify
      .pipe(uglify())
      .on('error', e => gutil.log(gutil.colors.red('Error: ') + e.message))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/'))
})

gulp.task('inline', function(){
  return gulp.src('src/index.html', {base: 'src/'})
    .pipe(inlineSource())
    .pipe(gulp.dest('./dist'))
})

gulp.task('copy', function(){
  return gulp.src([
    'src/*.css',
    'src/*.ico',
    // 'src/index.html',
  ], { base: 'src/' })
    .pipe(gulp.dest('dist/'))
})

gulp.task('build', function(done){
  runSequence(['clean'], ['styles', 'scripts'], ['inline', 'copy'], done)
})




// ********************************************************

// watchify etc

// ********************************************************

gulp.task('default', ['styles'], function(){

  livereload.listen();

  gulp.watch('src/sass/**/*.sass', ['styles'])
  gulp.watch('src/*.css', livereload.changed)

  gulp.watch(['src/*.min.js'], livereload.changed); // watch minified file to livereload

  // Browserify
  var b = browserify({
    entries: ['src/js/main.js'], // <- MAIN JS FILE HERE
    debug: true, // output source maps
  });
  var w = watchify(b);

  function bundle() {
    return w.bundle()
      .on('error', e => gutil.log(gutil.colors.red('Error: ') + e.message))
      .pipe(source('bundle.min.js')) // <- OUTPUT FILENAME HERE
      .pipe(buffer()) // only need this if you are dealing with multiple files?
      .pipe(sourcemaps.init({loadMaps: true})) // loadMaps extracts source map from browserify
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('src/'))
  }

  w.on('update', bundle);
  w.on('log', gutil.log);

  bundle();
});
