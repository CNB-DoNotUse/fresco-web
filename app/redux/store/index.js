import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { fromJS, Iterable } from 'immutable';
import createLogger from 'redux-logger';
import rootReducer from '../modules/reducer';

/**
 * Configures our redux store
 * @param  {Object} initialState Initial starting state
 * @return {Redux Store} redux Store object
 */
export default function configureStore(initialState) {

    //Use thunk middleware for our async reducers
    const middleware = [thunk];

    let enhancer;

    if (process.env.__DEV__) {
        const logger = createLogger({
            // stateTransformer: (state) => {
            //     const newState = {};

            //     for (const i of Object.keys(state.toJS())) {
            //         if (Iterable.isIterable(state.get(i))) {
            //             newState[i] = state.get(i).toJS();
            //         } else {
            //             newState[i] = state.get(i);
            //         }
            //     }
            //     return newState;
            // },
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


    const store = createStore(rootReducer, initialState, enhancer);

    return store;
}

