/*jslint nomen:true, node:true */

"use strict";

var libfs = require('fs'),
    libpath = require('path'),
    visitors = require('react-tools/vendor/fbtransform/visitors').transformVisitors,
    transform = require('react-tools/vendor/fbtransform/lib/transform').transform,
    debranch = require("react-tools/vendor/woodchipper").debranch,
    ReactServerRendering = require('./ReactServerRendering'),
    React = require('react-tools').React;

/**
Extends object with properties from other objects.

    var a = { foo: 'bar' }
      , b = { bar: 'baz' }
      , c = { baz: 'xyz' };

    extends(a, b, c);
    // a => { foo: 'bar', bar: 'baz', baz: 'xyz' }

@method extend
@param {Object} obj the receiver object to be extended
@param {Object*} supplier objects
@return {Object} The extended object
**/
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
    return function (data) {
        var component = React.createClass({
                render: fn
            }),
            instance = component();
        // passing data into the template
        extend(instance.props, data);
        return ReactServerRendering.renderToString(instance);
    };
};

global.React = React;

module.exports = {

    describe: {
        summary: 'React compiler plugin',
        extensions: ['react', 'jsx'],
        constants: {}
    },

    fileUpdated: function (evt, api) {

        var self = this,
            file = evt.file,
            source_path = file.fullPath,
            bundleName = file.bundleName,
            templateName = libpath.basename(file.relativePath, '.' + file.ext),
            moduleName = bundleName + '-templates-' + templateName,
            destination_path = moduleName + '.js';

        return api.promise(function (fulfill, reject) {

            var source = libfs.readFileSync(source_path, 'utf8'),
                constants = self.describe.constants || {};

            // This is where JSX, ES6, etc. desugaring happens.
            try {
                source = transform(visitors.react, source).code;
            } catch (e) {
                console.error(e);
                reject(e);
            }

            // Debranching means removing any obviously dead code after
            // replacing constant conditional expressions with literal
            // (boolean) values.
            debranch(constants, source, function (compiled) {
                // removing compiler token from functions, if we don't do this,
                // it breaks bad on the server side.
                compiled = compiled.replace('/** @jsx React.DOM */', '');
                // trying to write the destination file which will fulfill or reject the initial promise
                api.writeFileInBundle(bundleName, destination_path,
                    self._wrapAsYUI(bundleName, templateName, moduleName, compiled))
                    .then(function () {
                        // provisioning the module to be used on the server side automatically
                        evt.bundle.useServerModules = evt.bundle.useServerModules || [];
                        evt.bundle.useServerModules.push(moduleName);
                        // we are now ready to roll
                        fulfill();
                    }, reject);
            });
        });

    },

    _wrapAsYUI: function (bundleName, templateName, moduleName, compiled) {

        return [
            'YUI.add("' + moduleName + '",function(Y, NAME){',
            '   var React = Y.config.global.React,',
            '       fn = React.revive(function () {',
            '           var compiled = (' + compiled + ');',
            '           return compiled;',
            '       }),',
            '       cache = Y.Template._cache = Y.Template._cache || {};',
            '   cache["' + bundleName + '/' + templateName + '"] = fn;',
            '}, "", {requires: ["template-react"]});'
        ].join('\n');

    }

};