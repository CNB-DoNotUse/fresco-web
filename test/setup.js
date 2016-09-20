import jsdom from 'jsdom';
import chai from 'chai';
import chaiImmutable from 'chai-immutable';
const jQuery = require('jquery');

const exposedProperties = ['window', 'navigator', 'document'];
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;

global.$ = jQuery;
global.$.material = { init: () => {} };
global.document = doc;
global.window = win;
Object.keys(document.defaultView).forEach((property) => {
    if (typeof global[property] === 'undefined') {
        exposedProperties.push(property);
        global[property] = document.defaultView[property];
    }
});

global.navigator = {
    userAgent: 'node.js',
};

chai.use(chaiImmutable);

