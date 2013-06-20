locator-react
=============

Prototype of React template compiler for locator.

This component is a result of a hack to try to integrate Facebook's [React][] framework with [Locator][] component from Yahoo! to compile [React][]'s templates into [YUI][] Modules that could be used on the server thru express and on the client thru [YAF][].

_Note: This is not production ready by any means._

[React]: https://github.com/facebook/react
[Locator]: https://github.com/yahoo/locator
[YUI]: https://github.com/yui/yui3
[YAF]: http://yuilibrary.com/yui/docs/app/

Usage
-----

Normally, you will plug the locator plugin exposed by `locator-react` into the locator instance, and locator will be able to analyze every file in your express app, and it will compile any `*.react` or `*.jsx` into a YUI module that can be used thru `express-yui` for example. The example below describes how to use the yui plugin with locator:

```
var Locator = require('locator'),
    LocatorReact = require('locator-react'),
    loc = new Locator();

// using locator-react yui plugin
loc.plug(LocatorReact.yui());

// walking the filesystem for an express app
loc.parseBundle(__dirname, {});
```

A more complete example will be:

```
/*jslint node:true, nomen: true*/

'use strict';

var express = require('express'),
    YUI = require('express-yui'),
    Locator = require('locator'),
    LocatorReact = require('locator-react'),
    app = express(),
    loc;

// custom view engine to rely on yui templates
app.set('view', app.yui.view({
    // defaultLayout: 'templates/layouts/index' // optional layout
}));

// serving static yui modules
app.use(yui.static());

// creating a page with YUI embeded
app.get('/bar', YUI.expose(), function (req, res, next) {
    res.render('templates/bar', {
        tagline: 'testing with some data for template bar'
    });
});

// locator initialiation
loc = new Locator({
    buildDirectory: 'build'
});

locator.plug(LocatorReact.yui())
    .plug(app.yui.plugin({
        registerGroup: true,
        registerServerModules: true
    }))
    .parseBundle(__dirname, {}).then(function () {

        // listening for traffic only after locator finishes the walking process
        app.listen(3000, function () {
            console.log("Server listening on port 8080");
        });

    });
```

On the client side, any React template will be accessible as well thru `Y.use()` statement.

License
-------

(The MIT License)

Copyright (c) 2013 Caridy Patino &lt;caridy@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.