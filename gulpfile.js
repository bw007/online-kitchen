import gulp from 'gulp';
import browsersync from 'browser-sync';
import gulpclean from 'gulp-clean';
import autoprefixer from 'gulp-autoprefixer';
import cssbeautify from 'gulp-cssbeautify';
import cssnano from 'gulp-cssnano';
import imagemin from 'gulp-imagemin';
import plumber from 'gulp-plumber';
import gulppug from 'gulp-pug';
import rename from 'gulp-rename';
import rigger from 'gulp-rigger';
import gulpSass from 'gulp-sass';
import * as sass from 'sass';
import uglify from 'gulp-uglify';

const sassCompiler = gulpSass(sass);

const path = {
  build: {
    html: 'dist/',
    js: 'dist/js/',
    css: 'dist/css/',
    font: 'dist/fonts/',
    images: 'dist/imgs/',
  },
  src: {
    font: 'src/fonts/**/*',
    pug: 'src/pug/pages/**/*.pug',
    js: 'src/js/*.js',
    css: 'src/scss/main.scss',
    images: 'src/imgs/**/*.{jpg,png,svg,gif,ico}',
  },
  watch: {
    font: 'src/fonts/**/*',
    pug: 'src/pug/**/*.pug',
    js: 'src/js/**/*.js',
    css: 'src/scss/**/*.scss',
    images: 'src/imgs/**/*.{jpg,png,svg,gif,ico}',
  },
  clean: './dist',
};


function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './dist/',
    },
    port: 3000,
  });
  done();
}

function css() {
  return gulp.src(path.src.css, { base: 'src/scss/' })
    .pipe(plumber())
    .pipe(sassCompiler())
    .pipe(autoprefixer())
    .pipe(cssbeautify())
    .pipe(gulp.dest(path.build.css))
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min', extname: '.css' }))
    .pipe(gulp.dest(path.build.css))
    .pipe(browsersync.stream());
}

function js() {
  return gulp.src(path.src.js, { base: './src/js/' })
    .pipe(plumber())
    .pipe(rigger())
    .pipe(gulp.dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min', extname: '.js' }))
    .pipe(gulp.dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return gulp.src(path.src.images)
    .pipe(imagemin())
    .pipe(gulp.dest(path.build.images));
}

function clean() {
  return gulp.src(path.clean, { read: false, allowEmpty: true }).pipe(gulpclean());
}

function pug() {
  return gulp.src(path.src.pug, { base: './src/pug/pages/' })
    .pipe(gulppug({ pretty: true }))
    .pipe(gulp.dest(path.build.html))
    .pipe(browsersync.stream());
}

function font() {
  return gulp.src(path.src.font, { base: 'src/fonts' })
    .pipe(gulp.dest(path.build.font))
    .pipe(browsersync.stream());
}

function watchFiles() {
  gulp.watch([path.watch.pug], pug);
  gulp.watch([path.watch.font], font);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
}

const build = gulp.series(clean, css, font, js, pug, images);
const watchTask = gulp.series(build, gulp.parallel(watchFiles, browserSync));

export { css, js, images, clean, pug, font, build, watchTask as default };
