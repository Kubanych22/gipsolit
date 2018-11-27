let   gulp       = require('gulp'),
    babel        = require('gulp-babel'),
    eslint       = require('gulp-eslint'),
    sass         = require('gulp-sass'),
    broswerSync  = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    useref       = require('gulp-useref'),
    uglify       = require('gulp-uglify-es').default,
    gulpif       = require('gulp-if'),
    minifyCss    = require('gulp-clean-css'),
    imagemin     = require('gulp-imagemin'),
    cache        = require('gulp-cache'),
    del          = require('del'),
    plumber      = require('gulp-plumber'),
    sourcemaps   = require('gulp-sourcemaps'),
    concat       = require('gulp-concat'),
    // php          = require('gulp-connect-php'),
	// requireDir   = require('require-dir'),
    runSequence  = require('run-sequence');
	// uncss        = require('gulp-uncss');

const config = {
    paths: {
        css: 'css/',
        cssName: 'styles.css',
        scss: ['scss/styles.scss', 'scss/**/!(styles)*.scss'],
        html: '*.html',
        js: 'js/*.js',
        php: '*.php',
        images: 'images/**/*.+(png|jpg|gif|svg)',
        fonts: 'fonts/**/*'
    },
    output: {
        dest: 'dist/',
        imgs: 'dist/images',
        fnts: 'dist/fonts',
	    js: 'dist/js',
      	transpiled: 'js/transpiled'
    }
};

gulp.task('sass', function() {
    return gulp.src(config.paths.scss)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        // .pipe(uncss({
        //     html: ['http://localhost:3000/']
        // }))
        .pipe(concat(config.paths.cssName))
        .pipe(autoprefixer('last 1 version'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.paths.css));
});

gulp.task('watch', ['browserSync'], function () {
    gulp.watch(config.paths.scss, ['sass']);
    gulp.watch(config.paths.js, ['babel']);
    gulp.watch(config.paths.html, broswerSync.reload);
    gulp.watch(config.paths.php, broswerSync.reload);
    gulp.watch(config.paths.js, broswerSync.reload);
    gulp.watch(config.paths.css + 'styles.css', broswerSync.reload);
});

gulp.task('browserSync', function () {
  broswerSync({
    server: {
      baseDir: './'
    },
    notify: false,
    browser: 'chrome'
  });
});

gulp.task('useref', function () {
    return gulp.src(config.paths.html)
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
      	.pipe(gulpif('*.css', minifyCss()))      
        .pipe(gulp.dest(config.output.dest));
});

gulp.task('images', function () {
    return gulp.src(config.paths.images)
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest(config.output.imgs));
});

gulp.task('fonts', function () {
    return gulp.src(config.paths.fonts)
        .pipe(gulp.dest(config.output.fnts));
});

gulp.task('copy-php', function () {
    return gulp.src(config.paths.php)
        .pipe(gulp.dest(config.output.dest));
});

gulp.task('copy-favicon', function () {
  return gulp.src('./favicon.ico')
    .pipe(gulp.dest(config.output.dest));
});

gulp.task('clean', function() {
    return del.sync(config.output.dest);
});

gulp.task('clean:public', function() {
    return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

gulp.task('build', function (callback) {
    runSequence('clean:public',
        ['useref', 'images', 'fonts', 'copy-php', 'copy-favicon'],
        callback);
});

gulp.task('babel', function() {
  gulp.src(config.paths.js)
    .pipe(plumber())
    .pipe(eslint.format())
    .pipe(babel())
    .pipe(gulp.dest(config.output.transpiled));
});

gulp.task('default', ['sass', 'babel', 'watch']);
