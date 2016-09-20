import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import configureStore from 'app/redux/store/configureStore';
import * as pushActions from 'app/redux/modules/pushNotifs';
import PushNotifs from 'app/platform/containers/PushNotifs';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import DefaultTemplate from 'app/platform/components/pushNotifs/default-template';
import GalleryListTemplate from 'app/platform/components/pushNotifs/gallery-list-template';
import TitleBody from 'app/platform/components/pushNotifs/title-body';
import { RestrictByLocation, RestrictByUser } from 'app/platform/components/pushNotifs/restrict-by';
import ChipInput from 'app/platform/components/global/chip-input';

let store;
let component;
describe('<PushNotifs />', () => {
    beforeEach(() => {
        store = configureStore();
        component = mount(
            <MuiThemeProvider>
                <PushNotifs store={store} />
            </MuiThemeProvider>
        );
    });

    it('should render', () => {
        expect(component).to.have.length(1);
    });

    it('should render a `push-notifs__tab` by default', () => {
        expect(component.find('div.push-notifs__tab')).to.have.length(1);
    });

    it('should render <DefaultTemplate /> by default', () => {
        expect(component.find(DefaultTemplate)).to.have.length(1);
        expect(component.find(TitleBody)).to.have.length(1);
        expect(component.find(RestrictByLocation)).to.have.length(1);
        expect(component.find(RestrictByUser)).to.have.length(1);
    });

    it('should render <GalleryListTemplate /> when set as active tab', () => {
        store.dispatch(pushActions.setActiveTab('gallery list'));
        expect(component.find(GalleryListTemplate)).to.have.length(1);
        expect(component.find(TitleBody)).to.have.length(1);
        expect(component.find(RestrictByLocation)).to.have.length(1);
        expect(component.find(RestrictByUser)).to.have.length(1);
        expect(component.find(ChipInput)).to.have.length(1);
    });

    // describe('<DefaultTemplate />', () => {
    // });

    // describe('<GalleryListTemplate />', () => {
        // console.log('component props', component.instance().props);
        // console.log('component debug', component.debug());
    // });
});

