import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import PushNotifs from 'app/platform/containers/PushNotifs';
import DefaultTemplate from 'app/platform/components/pushNotifs/default-template';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);
// const storeStateMock = {
//   myReducer:{
//     someState: 'ABC'
//   }
// };
const storeStateMock = fromJS({
    activeTab: 'default',
    templates: {},
    loading: false,
    error: null,
    dialog: null,
});

let store;
let component;
describe('<PushNotifs />', () => {
    beforeEach(() => {
        store = mockStore(storeStateMock);
        component = mount(
            <Provider store={store}>
                <PushNotifs />
            </Provider>
        );
        // component = shallow(
        //     <Provider store={store}>
        //         <PushNotifs />
        //     </Provider>
        // ).shallow();
        // component = shallow(<PushNotifs store={store} />).shallow();
    });

    it('should render', () => {
        expect(component).length.toBeTruthy();
    });

    // it('should render <DefaultTemplate /> by default', () => {
    //     expect(component.find(DefaultTemplate)).to.have.length(1);
    // });
});

