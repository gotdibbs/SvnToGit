/*globals __dirname, process*/
(function (global) {
    'use strict';

    var $ = require('jquery'),
        Promise = require('bluebird'),
        exec = require('child_process').exec,
        spawn = require('child_process').spawn,
        path = require('path'),
        tmpdir = require('os').tmpdir(),
        fs = Promise.promisifyAll(require('fs')),
        rp = require('request-promise'),
        rimraf = require('rimraf'),
        $log;

    global.App = (function () {

        function _log(text) {
            if (!$log) {
                $log = $('#log');
            }
            
            $log.append(text + '\r\n');
            $log.scrollTop($log[0].scrollHeight - $log.height());
        }

        function validateGit() {
            var child;

            child = exec('git --version', {
                env: process.env
            });

            child.stdout.on('data', function (data) {
                _log('Git Check: ' + data);
            });

            child.stderr.on('data', function (data) {
                _log('Error Git Check: ' + data);
            });

            return new Promise(function (resolve, reject) {
                child.on('exit', function (code, signal) {
                    if (code === 0) {
                        resolve();
                    }
                    else {
                        reject();
                    }
                })
            });
        } 

        function validateSvn() {
            var child;

            child = exec('svn --version', {
                env: process.env
            });

            child.stdout.on('data', function (data) {
                _log('SVN Check: ' + data);
            });

            child.stderr.on('data', function (data) {
                _log('Error SVN Check: ' + data);
            });

            return new Promise(function (resolve, reject) {
                child.on('exit', function (code, signal) {
                    if (code === 0) {
                        resolve();
                    }
                    else {
                        reject();
                    }
                })
            });
        } 

        function validateGems() {
            var child;

            child = exec('gem install svn2git', {
                env: process.env
            });

            child.stdout.on('data', function (data) {
                _log('Gem Check: ' + data);
            });

            child.stderr.on('data', function (data) {
                _log('Error Gem Check: ' + data);
            });

            return new Promise(function (resolve, reject) {
                child.on('exit', function (code, signal) {
                    if (code === 0) {
                        resolve();
                    }
                    else {
                        reject();
                    }
                })
            });
        }

        function validateRuby() {
            var child;

            child = exec('ruby --version', {
                env: process.env
            });

            child.stdout.on('data', function (data) {
                _log('Ruby Check: ' + data);
            });

            child.stderr.on('data', function (data) {
                _log('Error Ruby Check: ' + data);
            });

            return new Promise(function (resolve, reject) {
                child.on('exit', function (code, signal) {
                    if (code === 0) {
                        resolve();
                    }
                    else {
                        reject();
                    }
                })
            });
        }

        function setupEnvironment() {
            NProgress.start();

            _log(' -- Validating Environment -- ');

            validateRuby()
                .then(validateGems)
                .then(validateSvn)
                .then(validateGit)
                .then(function onSuccess() {
                    $('#migrate').removeAttr('disabled');
                },
                function onError() {
                    _log('Environment validation failed. Cannot continue.');
                    alert('Environment validation failed. Cannot continue.');
                })
                .finally(function () {
                    _log(' -- Environment Validated --');
                    NProgress.done();
                });
        }

        function cleanup(state) {
            return new Promise(function (resolve, reject) {
                rimraf(path.join(tmpdir, 'SvnToGit'), function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        $('#migrate,#gitUrl,#svnUrl,#username,#password').attr('disabled', false);
                        _log(' -- Migration Completed -- ');
                        NProgress.done();
                        resolve();
                    }
                });
            });
        }

        function pushTags(state) {
             var child,
                command = ['git', 'push', '--tags'].join(' ');

            _log('Git Tags: ' + command + ' in ' + state.gitDir);

            child = exec(command, {
                cwd: state.gitDir,
                env: process.env
            });

            // Pipes are reversed for git push
            child.stdout.on('data', function (data) {
                _log('Error Git Tags: ' + data);
            });

            // Pipes are reversed for git push
            child.stderr.on('data', function (data) {
                _log('Git Tags: ' + data);
            });

            return new Promise(function (resolve, reject) {
                child.on('exit', function (code, signal) {
                    if (code === 0) {
                        resolve(state);
                    }
                    else {
                        reject();
                    }
                })
            });
        }   

        function push(state) {
             var child,
                command = ['git', 'push', '--all', '-f'].join(' ');

            _log('Git Push: ' + command + ' in ' + state.gitDir);

            child = exec(command, {
                cwd: state.gitDir,
                env: process.env
            });

            // Pipes are reversed for git push
            child.stdout.on('data', function (data) {
                _log('Error Git Push: ' + data);
            });

            // Pipes are reversed for git push
            child.stderr.on('data', function (data) {
                _log('Git Push: ' + data);
            });

            return new Promise(function (resolve, reject) {
                child.on('exit', function (code, signal) {
                    if (code === 0) {
                        resolve(state);
                    }
                    else {
                        reject();
                    }
                })
            });
        }

        function commitChanges(state) {
             var child,
                command = ['git', 'commit', '-m', '"Adding gitignore"'].join(' ');

            _log('Git Commit: ' + command + ' in ' + state.gitDir);

            child = exec(command, {
                cwd: state.gitDir,
                env: process.env
            });

            child.stdout.on('data', function (data) {
                _log('Git Commit: ' + data);
            });

            child.stderr.on('data', function (data) {
                _log('Error Git Commit: ' + data);
            });

            return new Promise(function (resolve, reject) {
                child.on('exit', function (code, signal) {
                    if (code === 0) {
                        resolve(state);
                    }
                    else {
                        reject();
                    }
                })
            });
        }

        function trackChanges(state) {
            var child,
                command = ['git', 'add', '.'].join(' ');

            _log('Git Add: ' + command + ' in ' + state.gitDir);

            child = exec(command, {
                cwd: state.gitDir,
                env: process.env
            });

            // Pipes are reversed for git add
            child.stdout.on('data', function (data) {
                _log('Error Git Add: ' + data);
            });

            // Pipes are reversed for git add
            child.stderr.on('data', function (data) {
                _log('Git Add: ' + data);
            });

            return new Promise(function (resolve, reject) {
                child.on('exit', function (code, signal) {
                    if (code === 0) {
                        resolve(state);
                    }
                    else {
                        reject();
                    }
                })
            });
        }

        function downloadGitignore(state) {
            return rp('https://raw.githubusercontent.com/github/gitignore/master/VisualStudio.gitignore')
                .then(function (body) {
                    return fs.writeFileAsync(path.join(state.gitDir, '.gitignore'), body);
                })
                .then(function () {
                    return state;
                });
        }

        function unlinkAuthors(state) {
            return fs.unlinkAsync(path.join(state.gitDir, 'authors.txt'))
                .then(function () {
                    return state;
                });
        }

        function runMigration(state) {
            var child,
                svnPath = $('#svnUrl').val(),
                command = [
                    'svn2git', svnPath,
                    '--no-minimize-url',
                    '--revision', state.lastRevision,
                    '--authors', 'authors.txt',
                    '--verbose',
                    '&&',
                    'pause'
                ].join(' ');

            _log('Migrate: ' + command + ' in ' + state.gitDir);

            child = spawn('cmd', {
                cwd: state.gitDir,
                env: process.env,
                detached: true,
                stdio: ['pipe', 'ignore', 'ignore']
            });

            child.stdin.setEncoding('utf-8');
            child.stdin.write(command + '\n');
            child.stdin.end();

            return new Promise(function (resolve, reject) {
                child.on('close', function (code, signal) {
                    _log('Migrate: completed with code ' + code);

                    child = null;

                    if (code === 0) {
                        resolve(state);
                    }
                    else {
                        reject();
                    }
                })
            });
        }

        function writeAuthors(state) {
            var authorsText = '';

            for (var p in state.authors) {
                authorsText += [p, ' = ', p, ' <', p, '@example.com>', '\r\n'].join('');
            }

            return fs.writeFileAsync(path.join(state.gitDir, 'authors.txt'), authorsText)
                .then(function () {
                    return state;
                });
        }

        function getAuthors(state) {
           var child,
               svnPath = $('#svnUrl').val(),
               command = [
                   'svn',
                   'log',
                   '--xml', svnPath,
                   '--username', $('#username').val(),
                   '--password', $('#password').val()
                ].join(' '),
               authorRegEx,
               revisionRegEx,
               m;

            state.authors = {};
            state.lastRevision = null;

            _log('SVN Authors: ' + svnPath);

            child = exec(command, {
                cwd: state.svnDir,
                env: process.env
            });

            child.stdout.on('data', function (data) {
                authorRegEx = /<author>(.+)<\/author>/gi;
                revisionRegEx = /revision=\"(\d+)\"/gi;

                do {
                    m = authorRegEx.exec(data);
                    if (m && m.length > 1) {
                        state.authors[m[1]] = true;
                    }
                } while(m);

                do {
                    m = revisionRegEx.exec(data);
                    if (m && m.length > 1) {
                        state.lastRevision = parseInt(m[1], 10);
                    }
                } while(m);
            });

            child.stderr.on('data', function (data) {
                _log('Error SVN Authors: ' + data);
            });

            return new Promise(function (resolve, reject) {
                child.on('exit', function (code, signal) {
                    if (code === 0) {
                        _log('SVN Authors: ' + JSON.stringify(state.authors));
                        _log('SVN Authors: ' + state.lastRevision);

                        resolve(state);
                    }
                    else {
                        reject();
                    }
                })
            });
        }

        function _parseGitPath() {
            var gitPath = $('#gitUrl').val(),
                username = $('#username').val(),
                password = $('#password').val(),
                parts;

            // Check URL for auth
            if (/\/\/.+\:.+@/.test(gitPath)) {
                return gitPath;
            }

            parts = gitPath.split('//');

            return [
                parts[0], '//',
                username, ':', password,
                '@',
                parts[1]
            ].join('');
        }

        function checkoutFromGit(state) {
            var child,
                gitUrl = $('#gitUrl').val(),
                gitPath = _parseGitPath(),
                command = ['git', 'clone', gitPath, '.'].join(' ');

            _log('Git Checkout: ' + gitUrl + ' in ' + state.gitDir);

            child = exec(command, {
                cwd: state.gitDir,
                env: process.env
            });

            // Pipes are reversed for git clone
            child.stdout.on('data', function (data) {
                _log('Error Git Checkout: ' + data);
            });

            // Pipes are reversed for git clone
            child.stderr.on('data', function (data) {
                _log('Git Checkout: ' + data);
            });

            return new Promise(function (resolve, reject) {
                child.on('close', function (code, signal) {
                    if (code === 0) {
                        resolve(state);
                    }
                    else {
                        reject();
                    }
                })
            });
        }

        function createTempFolders(state) {
            state.tempDir = path.join(tmpdir, 'SvnToGit');
            state.gitDir = path.join(tmpdir, 'SvnToGit', 'git');

            return fs.mkdirAsync(state.tempDir)
                .then(function () {
                    return fs.mkdirAsync(state.gitDir);
                })
                .then(function () {
                    return state;
                });
        }

        function migrate() {
            var $cols = $('.app-container col');

            NProgress.start();

            $cols[0].width = '23%';
            $cols[1].width = '4%';
            $cols[2].width = '100%';

            $('#migrate,#gitUrl,#svnUrl,#username,#password').attr('disabled', true);
            $('#log').empty();

            _log(' -- Beginning Migration -- ');

            createTempFolders({})
                .then(checkoutFromGit)
                .then(getAuthors)
                .then(writeAuthors)
                .then(runMigration)
                .then(unlinkAuthors)
                .then(downloadGitignore)
                .then(trackChanges)
                .then(commitChanges)
                .then(push)
                .then(pushTags)
                .finally(cleanup);
        }

        function attachEvents() {
            $('#migrate').on('click', migrate);
        }

        function onLoad() {
            process.env.Path += [
                ';', path.join(__dirname, 'tools', 'Git', 'bin'),
                ';', path.join(__dirname, 'tools', 'SlikSvn', 'bin'),
                ';', path.join(__dirname, 'tools', 'Ruby', 'bin')
            ].join('');

            attachEvents();

            setupEnvironment();
        }

        return {
            onLoad: onLoad
        };

    }());

    $(global.App.onLoad);

}(window));