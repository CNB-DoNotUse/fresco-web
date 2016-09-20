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
const storeStateMock = fromJS({
    pushNotifs: {
        activeTab: 'default',
        templates: {},
        loading: false,
        error: null,
        dialog: null,
    },
});

let store;
let component;
describe('<PushNotifs />', () => {
    beforeEach(() => {
        store = mockStore(storeStateMock);
        component = shallow(
            <PushNotifs store={store} />
        ).shallow();
    });

    it('should render', () => {
        expect(component).to.have.length(1);
    });

    it('should render a `push-notifs__tab` by default', () => {
        expect(component.find('div.push-notifs__tab')).to.have.length(1);
    });

    it('should render <DefaultTemplate /> by default', () => {
        expect(component.find('DefaultTemplate')).to.have.length(1);
    });
});

