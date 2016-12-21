import camelCase from 'lodash/camelCase';

export const createHandlerName = evtName => camelCase(`on${evtName.toUpperCase()}`);
