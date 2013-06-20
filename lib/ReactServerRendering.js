/*jslint nomen:true, node:true */

// Requires react-tools 0.3.2. This is an ugly require() but this is not
// "officially" supported yet.
var ReactReconcileTransaction = require('react-tools/build/modules/ReactReconcileTransaction');

function renderComponentToString(component) {

    var transaction = ReactReconcileTransaction.getPooled(),
        content;

    // We use a callback API to keep the API async in case in the future we ever
    // need it, but in reality this is a synchronous operation.

    transaction.reinitializeTransaction();
    try {
        transaction.perform(function () {
            content = component.mountComponent('', transaction);
        }, null);
    } finally {
        ReactReconcileTransaction.release(transaction);
    }
    return content;
}

module.exports = {
    renderToString: renderComponentToString
};
