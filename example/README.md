What is this example?
---------------------

This examples demonstrate how to use `locator-react` in an express application that relies on `locator` and `express-yui` to render a page.

It also demonstrate how to combine different template languages, by using `handlebars` as the main layout of the page while relying on `react` for the main area of the page. In this particular case, it relies on `locator-handlebars` locator plugin, which is similar to `locator-react`.


How does it work?
-----------------

There are two templates in this example, `templates/bar.react` and `templates/layouts/index.handlebars`. They work together to form a composite view where `bar` will be inserted within a `div` in `index`.

But when the page gets rendered on the client side, the `app` can use yui to load a compiled version of `bar` on-demand, and call for render as many times as you want, and during the rendering process, `react` will do that it does best, update only the piece of data that changed since the last rendered.

Bottomline, this is an experiment to render the initial view on the server side using the same code, then rehydrating on the client side by relying on `react` rendering capabilities.


How to test this app?
---------------------

First, install the demo dependencies, then run the express application:

```
npm install
node app.js
```

Then navigate to:

* `http://localhost:3000/`
