'use strict';
const MongoClient = require('mongodb').MongoClient;
const gulp        = require('gulp');
const gulpNodemon = require('gulp-nodemon');

// tests
const istanbul    = require('gulp-istanbul');
const mocha       = require('gulp-mocha');

// constants
const DEV_DB_URI = 'mongodb://localhost:27017/cebola-server-dev-db-product-model';

/**
 * Run server and restart it everytime server file changes
 */
gulp.task('nodemon', function () {
  gulpNodemon({
    script: 'cli/start.js',
    env: {
      PORT: '4000',
      MONGODB_URI: DEV_DB_URI,
      SECRET: 'TEST_SECRET',
      CORS_ALLOWED_ORIGINS: 'http://localhost:3000',
      HOST: 'http://localhost:4000',
      AWS_S3_BUCKET: 'cebola-dev',
      TEMPORARY_PASSWORD: 'senhateste',
      TEMPORARY_SECRET: 'TEST_TEMPORARY_SECRET',
      SENTRY_DSN: 'https://829d9e452a2841dfb005cd4475e32c3c:3e0dba70a6804235b4eca4fd15cad5dd@sentry.io/217993',
      SENTRY_ENVIRONMENT: 'dev-local',
    },
    ext: 'js',
    ignore: [
      'client/**/*',
      'dist/**/*',
      'gulpfile.js',
    ],
  })
});

gulp.task('pre-test', function () {
  return gulp.src(['server/**/*.js', 'shared/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
  return gulp.src(['test/tests/**/*.js'])
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
    .on('error', (err) => {
      this.emit('error', err);
    });
});

/**
 * Drops the database
 */
gulp.task('drop-db', function (done) {
  // connect
  var _db;

  MongoClient.connect(DEV_DB_URI)
    .then((db) => {
      _db = db;
      return db.dropDatabase();
    })
    .then(() => {
      return _db.close(true, done);
    })
    .catch(done);
});
