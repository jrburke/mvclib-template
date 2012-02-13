/*jslint */
/*global require, process, console, __dirname */
(function () {
    'use strict';

    var requirejs = require('./r'),
        defineRegExp = /define\s*\(\s*["'][^'"]+["']\s*,\s*\[[^\]]*\]\s*,/,
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

            //Now trigger
            requirejs.optimize({
                baseUrl: __dirname + "/../lib",
                name: "main",
                out: __dirname + "/../LIBNAME.js",
                //Comment out the next line if you want minified code
                optimize: 'none',
                logLevel: 0,
                wrap: {
                    startFile: __dirname + "/wrap.start",
                    endFile: __dirname + "/wrap.end"
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