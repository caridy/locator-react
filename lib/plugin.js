/*
 * Copyright (c) 2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE.txt file for terms.
 */

/*jslint nomen:true, node:true */

"use strict";

var libfs = require('fs'),
    libpath = require('path'),
    ReactTools = require('react-tools'),
    description = require('../package.json').description;

// custom version of React for the server side
ReactTools.React.revive = function (component) {
    var comp = component;
    return function (data) {
        var instance = comp(data),
            result;
        ReactTools.React.renderComponentToString(instance, function(html) {
            // according to react's documentation, the API
            // is async but the operations are sync, so we are good.
            result = html;
        });
        return result;
    };
};

// Hack: exposing it as global so `template-react` can use it
// on the server side.
global.React = ReactTools.React;

function PluginClass(config) {

    config = config || {};

    this.describe = {
        summary: description,
        extensions: ['react', 'jsx'],
        options: config
    };

}

PluginClass.prototype = {

    fileUpdated: function (evt, api) {

        var file = evt.file,
            source_path = file.fullPath,
            bundleName = file.bundleName,
            templateName = libpath.basename(file.relativePath, '.' + file.ext),
            moduleName = bundleName + '-template-' + templateName,
            destination_path = moduleName + '.js',
            format = this.describe.options.format;

        return api.promise(function (fulfill, reject) {

            // TODO: make this async
            var source = libfs.readFileSync(source_path, 'utf8'),
                precompiled;

            try {
                precompiled = ReactTools.transform(source);
                // removing compiler token from functions, if we don't do this,
                // it breaks bad on the server side.
                precompiled = precompiled.replace('/** @jsx React.DOM */', '');
            } catch (e) {
                throw new Error('Error parsing React template: ' +
                        file.relativePath + '. ' + e);
            }

            if (format) {
                // trying to write the destination file which will fulfill or reject the initial promise
                api.writeFileInBundle(bundleName, destination_path,
                    require('./formats/' + format)(bundleName, templateName, moduleName, precompiled))
                    .then(fulfill, reject);
            } else {
                fulfill();
            }

        });

    }

};

module.exports = PluginClass;
