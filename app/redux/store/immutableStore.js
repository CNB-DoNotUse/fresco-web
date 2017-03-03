import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { fromJS, Iterable } from 'immutable';
import createLogger from 'redux-logger';
import rootReducer from '../modules/reducer';

/**
 * Immutable js store. 
 */
export default function configureStore(initialState) {
    const middleware = [thunk];

    let enhancer;

    if (process.env.NODE_ENV === 'development') {
        const logger = createLogger({
            stateTransformer: (state) => {
                const newState = {};

                for (const i of Object.keys(state.toJS())) {
                    if (Iterable.isIterable(state.get(i))) {
                        newState[i] = state.get(i).toJS();
                    } else {
                        newState[i] = state.get(i);
                    }
                }
                return newState;
            },
        });

        middleware.push(logger);

        enhancer = compose(
            applyMiddleware(...middleware),
            // https://github.com/zalmoxisus/redux-devtools-extension#redux-devtools-extension
            window.devToolsExtension ? window.devToolsExtension() : f => f
        );
    } else {
        enhancer = applyMiddleware(...middleware);
    }

    // See https://github.com/rackt/redux/releases/tag/v3.1.0
    const store = createStore(rootReducer, fromJS(initialState), enhancer);

    return store;
}