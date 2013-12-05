YUI.add('template-react', function (Y) {

    var React = Y.config.global.React;

    React.revive = React.revive || function (fn) {
        return function () {
            var component = React.createClass({
                    render: fn
                }),
                instance = component();
            return function (data, node) {
                var fragment = !node && document.createDocumentFragment();
                // supporting node and elements
                node = (node && node._node) || node;
                // mixing in the template data
                Y.mix(instance.props, data, true);
                if (node) {
                    React.renderComponent(instance, node);
                    return; // not need to return the html since the node was passed in
                }
                // fallback to return the html if node was not provided
                React.renderComponent(instance, fragment);
                return fragment.innerHTML;
            };
        };
    };

    Y.React = React;

}, '', {requires: ['template-base']});
