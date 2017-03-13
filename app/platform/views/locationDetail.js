import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import PostList from './../components/post/list.js';
import TopBar from './../components/topbar';
import utils from 'utils';
import LocationDropdown from '../components/global/location-dropdown';

/**
 * Location Detail Parent Object (composed of Post and Navbar)
 * @description Page for showing the content for an outlet's saved location
 */
class LocationDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            initialPostsLoaded: false,
            sort: 'created_at',
        };
    }

    componentWillMount() {
        // Set up session storage for sinceList as empty object
        if (typeof(window.sessionStorage.sinceList) !== 'object') {
            window.sessionStorage.sinceList = JSON.stringify({});
        }
    }

    componentDidUpdate() {
        // Check if we've loaded the initial set of posts
        if (this.state.initialPostsLoaded) {
            const sinceList = JSON.parse(window.sessionStorage.sinceList);

            // Update the last seen time to now after posts have been loaded
            sinceList[this.props.location.id] = Date.now();

            window.sessionStorage.sinceList = JSON.stringify(sinceList);
        }
    }

	/**
	 * Returns array of posts with offset and callback, used in child PostList
	 */
    loadPosts = (last, cb) => {
        const { location } = this.props;
        const params = {
            limit: utils.postCount,
            geo: location.location,
            radius: 1,
            last,
        };

        $.ajax({
            url: '/api/post/list',
            type: 'GET',
            data: params,
            dataType: 'json',
            contentType: 'applcation/json',
        })
        .done((res) => {
            cb(res);
        })
        .fail(() => {
            $.snackbar({ content: 'Coudn\'t load posts!' });
            cb([]);
        });
    };

    render() {
        const { user, location, outlet } = this.props;
        const page = 'locationDetail';
        return (
            <App
                user={user}
                page={page}>
                <TopBar
                    title={location.title}
                    timeToggle
                >
                    <LocationDropdown
                        user={user}
                        outlet={outlet}
                        addLocationButton={false}
                        inList
                    />
                </TopBar>

                <PostList
                    loadPosts={this.loadPosts}
                    roles={user.roles}
                    sortBy={this.state.sort}
                    size="small"
                    idOffset
                    scrollable
                    page={page}
                    user={user}
                />
            </App>
        );
    }
}

LocationDetail.propTypes = {
    location: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    outlet: PropTypes.object.isRequired,
};

ReactDOM.render(
    <LocationDetail
        location={window.__initialProps__.location}
        user={window.__initialProps__.user}
        outlet={window.__initialProps__.outlet}
    />,
    document.getElementById('app')
);
