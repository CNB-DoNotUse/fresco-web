import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { fromJS, Iterable } from 'immutable';
import rootReducer from '../modules/reducer';
import createLogger from 'redux-logger';

export default function configureStore(initialState) {
    const middleware = [thunk];

    let enhancer;

    if (__DEV__) {
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

        // https://github.com/zalmoxisus/redux-devtools-extension#redux-devtools-extension
        let devToolsExtension = f => f;
        if (process.env.BROWSER && window.devToolsExtension) {
            devToolsExtension = window.devToolsExtension();
        }

        enhancer = compose(
            applyMiddleware(...middleware),
            devToolsExtension
        );
    } else {
        enhancer = applyMiddleware(...middleware);
    }

    // See https://github.com/rackt/redux/releases/tag/v3.1.0
    const store = createStore(rootReducer, fromJS(initialState), enhancer);

    // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
    if (__DEV__ && module.hot) {
        module.hot.accept('../reducers', () =>
            store.replaceReducer(require('../reducers').default) // eslint-disable-line global-require
        );
    }

    return store;
}

