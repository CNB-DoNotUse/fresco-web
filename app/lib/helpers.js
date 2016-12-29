import camelCase from 'lodash/camelCase';

/**
 * Returns a name for a handler function based on the given event string
 *
 * @param {String} `on${evtName.toUpperCase The name of the event for the handler to be created
 * @returns {String} The name of the handler for the given event
 */
export const createHandlerName = evtName => camelCase(`on${evtName.toUpperCase()}`);
