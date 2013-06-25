/*jslint node:true, nomen: true*/

'use strict';

var express = require('express'),
    YUI = require('express-yui'),
    Locator = require('locator'),
    LocatorReact = require('locator-react'),
    LocatorHandlebars = require('locator-handlebars'),
    app = express();

app.yui.debugMode();
app.yui.setCoreFromAppOrigin();

// custom view engine to rely on yui templates
app.set('view', app.yui.view({
    defaultBundle: 'demo',
    defaultLayout: 'templates/layouts/index'
}));

// serving static yui modules
app.use(YUI['static']());

// creating a page with YUI embeded
app.get('/bar', YUI.expose(), function (req, res, next) {
    res.render('templates/bar', {
        tagline: 'testing with some data for template bar'
    });
});

// locator initialiation
new Locator({
    buildDirectory: 'build'
})
    .plug(LocatorReact.yui())
    .plug(LocatorHandlebars.yui())
    .plug(app.yui.plugin({
        registerGroup: true,
        registerServerModules: true
    }))
    .parseBundle(__dirname, {}).then(function () {

        // listening for traffic only after locator finishes the walking process
        app.listen(3000, function () {
            console.log("Server listening on port 3000");
        });

    }, function (err) {
        throw err;
    });