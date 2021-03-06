var gulp = require('gulp');
var bump = require('gulp-bump');
var fs = require('fs');
var path = require('path');
var prompt = require('gulp-prompt');
var semver = require('semver');
var git = require('gulp-git');
var filter = require('gulp-filter');
var tagVersion = require('gulp-tag-version');
var runSequence = require('run-sequence').use(gulp);

var config = require('../config');
var pkg = require('../../package.json');

var type = 'patch';

gulp.task('release:sequence', function() {
  runSequence(
    'lint',
    'test:js',
    'release:bump',
    'release:tag'
  );
});

gulp.task('release:tag', function() {

  var getPkg = function() {
    var _pkg = JSON.parse(fs.readFileSync(path.join(config.project.path, 'package.json'), 'utf8'));
    return _pkg.version;
  };

  return gulp.src(['./package.json', 'README.md'])
    .pipe(git.commit('bump package version v' + getPkg())) // commit the changed version number
    .pipe(filter('package.json'))
    .pipe(tagVersion());
});

gulp.task('release:bump', function() {
  return gulp.src(config.packages.src)
    .pipe(bump({ type: type }))
    .pipe(gulp.dest('./'));
});

gulp.task('release', function() {

  return gulp.src('')
    .pipe(prompt.prompt({
      type: 'rawlist',
      name: 'bump',
      message: 'What type of version bump would you like to do ? (current version is ' + pkg.version + ')',
      choices: [
        'patch (' + pkg.version + ' --> ' + semver.inc(pkg.version, 'patch') + ')',
        'minor (' + pkg.version + ' --> ' + semver.inc(pkg.version, 'minor') + ')',
        'major (' + pkg.version + ' --> ' + semver.inc(pkg.version, 'major') + ')',
        'none (exit)'
      ]
    }, function(res) {
      if (res.bump.match(/^patch/)) {
        type = 'patch';
      } else if (res.bump.match(/^minor/)) {
        type = 'minor';
      } else if (res.bump.match(/^major/)) {
        type = 'major';
      }

      gulp.start('release:sequence');

    }));

});
