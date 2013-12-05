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
    React = require('react-tools').React,
    description = require('../package.json').description;

function extend(obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function (source) {
        var key;

        if (!source) { return; }

        for (key in source) {
            if (source.hasOwnProperty(key)) {
                obj[key] = source[key];
            }
        }
    });

    return obj;
}

// custom version of React for the server side
React.revive = function (fn) {
    return function () {
        var component = React.createClass({
                render: fn
            }),
            instance = component();
        return function (data) {
            var result;
            // passing data into the template
            extend(instance.props, data);
            React.renderComponentToString(instance, function(html) {
                // according to react's documentation, the API
                // is async but the operations are sync, so we are good.
                result = html;
            });
            return result;
        };
    };
};

global.React = React;

function PluginClass(config) {

    config = config || {};
    config.ReactTools = config.ReactTools || ReactTools;

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
            ReactTools = this.describe.options.ReactTools,
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
