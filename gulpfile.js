const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const csso = require('postcss-csso');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const del = require('del');
const sync = require('browser-sync').create();

// Styles

const styles = () => {
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(sync.stream());
}

exports.styles = styles;

// HTML

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
}

// Scripts

const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(plumber())
    .pipe(gulp.dest('build/js'))
    .pipe(uglify().on('error', function (e) {
      console.log(e);
    }))
    .pipe(rename(function (path) {
      path.extname = '.min.js';
    }))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
}

exports.scripts = scripts;

// Images

const images = () => {
  return gulp.src('source/img/*.{jpg,png}')
    .pipe(imagemin([
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
    ]))
    .pipe(gulp.dest('build/img'))
}

exports.images = images;

// Webp

const createWebp = () => {
  return gulp.src('source/img/*.{jpg,png}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('build/img'))
}

exports.createWebp = createWebp;

// Copy

const copy = (done) => {
  return gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
    'source/img/*.{jpg,png,svg}',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

exports.copy = copy;

// Clean

const clean = () => {
  return del('build');
};

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Reload

const reload = done => {
  sync.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series('styles'));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

// Build

const build = gulp.series(
  clean,
  gulp.parallel(
    styles,
    html,
    scripts,
    copy,
    images,
    createWebp
  )
);

exports.build = build;

// Default

exports.default = gulp.series(
  clean,
  gulp.parallel(
    styles,
    html,
    scripts,
    copy,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
