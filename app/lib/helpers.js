import camelCase from 'lodash/camelCase';

/**
 * Returns a name for a handler function based on the given event string
 *
 * @param {String} `on${evtName.toUpperCase The name of the event for the handler to be created
 * @returns {String} The name of the handler for the given event
 */
export const createHandlerName = evtName => camelCase(`on${evtName.toUpperCase()}`);

/**
 * scrolledToBottom
 *
 * @param {DOM element} el
 * @param {Number} Offset - the pixel offset to calculate bottom scrolled
 * @returns {Boolean} Whether or not the scroll has reached the bottom of the passed DOM element
 */
export const scrolledToBottom = (el, offset = 400) => (
    el && (el.scrollTop > ((el.scrollHeight - el.offsetHeight) - offset))
);

/**
 * Finds element by it's identifying field
 * @param  {String} id         ID to look for
 * @param  {Array} array      data source to search
 * @param  {String} identifier identifiying field on the object look for
 * @return {Object} Contains index found at, and the object itself
 */
export const findById = (id, array, identifier) => {
    let index = null;
    const object = array.find((o, i) => {
        index = i;
        return o[identifier] === id;
    })

    return {index, object};
}