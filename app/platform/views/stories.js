import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import configureStore from 'app/redux/store/immutableStore';
import Root from '../containers/Root';
import Stories from '../containers/Stories';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const { user } = window.__initialProps__;

// default state for search,
// TODO: draw from local storage, save feature?
let location;
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
        location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }
    });
} else {
  location = {
      lat: 40.7127837,
      lng: 74.0059413,
  }
}
const searchParams  = {
    verified: true,
    unverified: false,
    seen: true,
    unseen: false,
    purchased: true,
    notPurchased: false,
    downloaded: true,
    notDownloaded: false,
    capturedTime: true,
    relativeTime: true,
    location,
    address: '',
    searchTerm: '',
    users: [],
    assignments:[],
    tags: [],
    loading: false
}

const stories = {
    1 : {
        user,
        id: 1,
        caption: "This event is LIT",
        thumbnails: ["http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg"],
        posts: [
            {
                image: "http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg",
                location: {
                    coordinates: [ -74.0110538, 40.7038987 ]
                },
                captured_at: "2017-05-10T21:46:51.000Z",
                updated_at: "2017-05-10T21:46:51.000Z"
            },
            {
                image: "http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg",
                location: {
                    coordinates: [ -74.0110538, 40.7038987 ]
                },
                captured_at: "2017-05-10T21:46:51.000Z",
                updated_at: "2017-05-10T21:46:51.000Z"
            },
            {
                image: "http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg",
                location: {
                    coordinates: [ -74.0110538, 40.7038987 ]
                },
                captured_at: "2017-05-10T21:46:51.000Z",
                updated_at: "2017-05-10T21:46:51.000Z"
            },
            {
                image: "http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg",
                location: {
                    coordinates: [ -74.0110538, 40.7038987 ]
                },
                captured_at: "2017-05-10T21:46:51.000Z",
                updated_at: "2017-05-10T21:46:51.000Z"
            },
            {
                image: "http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg",
                location: {
                    coordinates: [ -74.0110538, 40.7038987 ]
                },
                captured_at: "2017-05-10T21:46:51.000Z",
                updated_at: "2017-05-10T21:46:51.000Z"
            },
            {
                image: "http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg",
                location: {
                    coordinates: [ -74.0110538, 40.7038987 ]
                },
                captured_at: "2017-05-10T21:46:51.000Z",
                updated_at: "2017-05-10T21:46:51.000Z"
            },
        ]
    },
    2 : {
        user,
        id: 2,
        caption: "This event is LIT",
        thumbnails: ["http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg"],
        posts: [
            {
                image: "http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg",
                location: {
                    coordinates: [ -74.0110538, 40.7038987 ]
                },
                captured_at: "2017-05-10T21:46:51.000Z",
                updated_at: "2017-05-10T21:46:51.000Z"
            },
            {
                image: "http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg",
                location: {
                    coordinates: [ -74.0110538, 40.7038987 ]
                },
                captured_at: "2017-05-10T21:46:51.000Z",
                updated_at: "2017-05-10T21:46:51.000Z"
            },
            {
                image: "http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg",
                location: {
                    coordinates: [ -74.0110538, 40.7038987 ]
                },
                captured_at: "2017-05-10T21:46:51.000Z",
                updated_at: "2017-05-10T21:46:51.000Z"
            },
            {
                image: "http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg",
                location: {
                    coordinates: [ -74.0110538, 40.7038987 ]
                },
                captured_at: "2017-05-10T21:46:51.000Z",
                updated_at: "2017-05-10T21:46:51.000Z"
            },
            {
                image: "http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg",
                location: {
                    coordinates: [ -74.0110538, 40.7038987 ]
                },
                captured_at: "2017-05-10T21:46:51.000Z",
                updated_at: "2017-05-10T21:46:51.000Z"
            },
            {
                image: "http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg",
                location: {
                    coordinates: [ -74.0110538, 40.7038987 ]
                },
                captured_at: "2017-05-10T21:46:51.000Z",
                updated_at: "2017-05-10T21:46:51.000Z"
            },
        ]
    }

}



const store = configureStore({ user, searchParams, stories });
ReactDOM.render(
    <Root store={store}>
        <MuiThemeProvider>
            <Stories />
        </MuiThemeProvider>
    </Root>,
    document.getElementById('app')
);
