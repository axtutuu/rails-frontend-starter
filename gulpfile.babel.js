'use strict';

// import
import gulp from 'gulp';
import source from 'vinyl-source-stream';
import sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import assetFunctions from 'node-sass-asset-functions';
import pleeease from 'gulp-pleeease';
import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import browserSync from 'browser-sync';
import readConfig from 'read-config';
import watch from 'gulp-watch';
import RevLogger from 'rev-logger';
import gitRev from 'git-rev';
import gutil from 'gutil';
import env from 'gulp-env';

// const
const SRC = './src';
const CONFIG = './src/config';
const HTDOCS = '../public/static';
const BASE_PATH = '';
const DEST = `${HTDOCS}${BASE_PATH}`;

const revLogger = new RevLogger({
    'style.css': `${DEST}/css/style.css`,
    'script.js': `${DEST}/js/script.js`
});
const versions = revLogger.versions();
env.set({
  STATIC_VERSION: versions['script.js'] // キャッシュ対策用
})

// css
gulp.task('sass', () => {
    const config = readConfig(`${CONFIG}/pleeease.json`);
    return gulp.src(`${SRC}/scss/style.scss`)
        .pipe(sassGlob())
        .pipe(sass({
          functions: assetFunctions({
            images_path: '../public/static/img',
            http_images_path: '../img',
            asset_cache_buster: function(http_path, real_path, done){
              gitRev.short(revision => done(`v=${revision}`));
            },
          }),
        }))
        .pipe(pleeease(config))
        .pipe(gulp.dest(`${DEST}/css`));
});

gulp.task('css', gulp.series('sass'));

// js
const browserifyOption = {};
browserifyOption.cache        = {};
browserifyOption.packageCache = {};
gulp.task('watchify', () => {
    return watchify(browserify(`${SRC}/js/script.js`, browserifyOption))
        .transform(babelify)
        .bundle()
        .on("error", function(err) {
            gutil.log(err.message);
            gutil.log(err.codeFrame);
            this.emit('end');
        })
        .pipe(source('script.js'))
        .pipe(gulp.dest(`${DEST}/js`));
});

gulp.task('js', gulp.parallel('watchify'));

// serve
gulp.task('browser-sync', () => {
    browserSync({
      proxy: `localhost:${process.env.PORT}`
    });
    watch([`${SRC}/scss/**/*.scss`], gulp.series(['sass'], browserSync.reload));
    watch([`${SRC}/js/**/*.js`, `${SRC}/js/**/*.jsx`], gulp.series(['watchify'], browserSync.reload));
    watch(['../app/views/**/*'], browserSync.reload)
});

gulp.task('serve', gulp.series('browser-sync'));

// default
gulp.task('build', gulp.parallel('css', 'js'));
gulp.task('default', gulp.series('build', 'serve'));
