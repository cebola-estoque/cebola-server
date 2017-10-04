// native
const fs = require('fs');
const path = require('path');

// third-party
const MongoClient = require('mongodb').MongoClient;
const gulp        = require('gulp');
const gulpNodemon = require('gulp-nodemon');
const inquirer    = require('inquirer');

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

gulp.task('migrate-db', function () {

  var defaultAppOptions = {
    apiVersion: require('./package').version,
    port: process.env.PORT || 4000,
    corsAllowedOrigins: 'localhost',

    // mongodbURI: process.env.MONGODB_URI,
    host: process.env.HOST || 'localhost',
    secret: process.env.SECRET || 'MIGRATION_SECRET',
    temporaryPassword: process.env.TEMPORARY_PASSWORD || 'MIGRATION_TEMPORARY_PASSWORD',
    temporarySecret: process.env.TEMPORARY_SECRET || 'MIGRATION_TEMPORARY_SECRET',

    sentryDSN: process.env.SENTRY_DSN || 'https://829d9e452a2841dfb005cd4475e32c3c:3e0dba70a6804235b4eca4fd15cad5dd@sentry.io/217993',
    sentryEnvironment: process.env.SENTRY_ENVIRONMENT || 'MIGRATION_SENTRY_ENVIRONMENT',

    awsS3Bucket: process.env.AWS_S3_BUCKET || 'MIGRATION_AWS_S3_BUCKET',
  };

  return inquirer.prompt([
    {
      name: 'mongodbURI',
      type: 'input',
      message: 'mongodbURI',
      default: process.env.MONGODB_URI,
      required: true
    },
    {
      name: 'migrationFilepath',
      type: 'list',
      message: 'Target migration',
      choices: fs.readdirSync(path.join(__dirname, 'migrations')).map(filename => {
        return {
          name: filename,
          value: path.join(__dirname, 'migrations', filename),
        }
      }),
      required: true
    }
  ])
  .then((answers) => {
    var migration = require(answers.migrationFilepath);

    var appOptions = Object.assign({}, defaultAppOptions, {
      mongodbURI: answers.mongodbURI,
    });

    return migration.do(appOptions);
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
