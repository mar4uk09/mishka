"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var run = require("run-sequence");
var del = require("del");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");

gulp.task("style", function() {
  gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("source/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("source/*.html", ["html"]);
});

gulp.task("html", ["html:copy"], function () {
  server.reload();
})

gulp.task("html:copy", function () {
  return gulp.src("source/*.html")
    .pipe(gulp.dest("build"));
})

gulp.task("clean", function () {
  return del("build")
})

gulp.task("copy", function() {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.html"
  ],{
    base: "source"
  })
  .pipe(gulp.dest("build"));
})

gulp.task("images", function() {
  return gulp
    .src("build/img/**/*.{png,jpg,gif}")
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.jpegtran({ progressive: true })
      ])
    )
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function () {
  return gulp.src("build/img/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
})

gulp.task("build", function (callback) {
  run(
    "clean",
    "copy",
    "style",
    "images",
    "sprite",
    callback
  );
})
