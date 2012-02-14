/*jslint */
/*global require, process, console, __dirname */
(function () {
    'use strict';

    var requirejs = require('./r'),
        fs = require('fs'),
        path = require('path'),
        rootPath = path.resolve(__dirname, '..'),
        defineRegExp = /define\s*\(\s*["'][^'"]+["']\s*,\s*\[[^\]]*\]\s*,/,
        stringifyStart = '//>>STRINGIFY',
        stringifyEnd = '//<<STRINGIFY',
        stringify = process.argv[2] === 'stringify';

    function makeJsString(text) {
        return text.replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"');
    }

    //Load the internal 'optimize' module so uglify can be applied manually
    //in the onBuildWrite callback.
    requirejs.tools.useLib(function (require) {
        require(['optimize'], function (optimizeLib) {

            var wrapStart = fs.readFileSync(rootPath + '/tools/wrap.start', 'utf8'),
                wrapEnd = fs.readFileSync(rootPath + '/tools/wrap.end', 'utf8'),
                index;

            //Trim out any stringify goo from the wrap start if stringify
            //is not in play.
            if (!stringify) {
                while ((index = wrapStart.indexOf(stringifyStart)) !== -1) {
                    wrapStart = wrapStart.substring(0, index) +
                        wrapStart.substring(wrapStart.indexOf(stringifyEnd) +
                                            stringifyEnd.length + 1);
                }
            }

            //Now trigger
            requirejs.optimize({
                baseUrl:rootPath + "/lib",
                paths: {
                    //Do not look for a jQuery file to include in the output,
                    //it is an external dependency.
                    'jquery': 'empty:'
                },
                name: "main",
                out: rootPath + "/dist/LIBNAME.js",
                //Comment out the next line if you want minified code
                optimize: 'none',
                logLevel: 0,
                wrap: {
                    start: wrapStart,
                    end: wrapEnd
                },
                onBuildRead: function (id, url, contents) {
                    return 'define(function (require, exports, module) {\n' +
                           contents +
                           '\n})';
                },
                onBuildWrite: function (id, url, contents) {
                    //Convert the define wrapper, since the built file will have
                    //its own type of define, called def. The contents will will have
                    //a define('id', [], function (require, exports, module) {} structure,
                    //convert that to be:
                    //def('id', stringifiedcontentof->function(require, exports, module) {})
                    contents =  contents.replace(defineRegExp, '')
                                //Remove the trailing ) for the define call and any semicolon
                                .replace(/\)(;)?\s*$/, '');

                    //Minify the contents
                    contents = optimizeLib.js(url, contents);

                    if (stringify) {
                        contents = makeJsString(contents);
                        return "defStore('" + id + "', '" + url + "', " +
                            "'" + contents + "'" +
                            ");";
                    } else {
                        return "def('" + id + "', " + contents + ");";
                    }
                }
            }, function (summary) {
            });
        });
    });
}());