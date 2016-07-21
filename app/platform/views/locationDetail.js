import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import PostList from './../components/global/post-list.js';
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

        this.updateSort	= this.updateSort.bind(this);
        this.loadPosts 	= this.loadPosts.bind(this);
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

    updateSort(sort) {
        this.setState({ sort });
    }

	/**
	 * Returns array of posts with offset and callback, used in child PostList
	 */
    loadPosts(passedId, callback) {
        const params = {
            id: this.props.location.id,
            limit: utils.postCount,
            last: passedId || null,
        };

        $.ajax({
            url: '/api/outlet/location/posts',
            type: 'GET',
            data: params,
            dataType: 'json',
            success: (response) => {
                // Send empty array, because of bad response
                if (!response.data || response.err) callback([]);
                else callback(response.data);
            },
            error: (xhr, status, error) => {
                $.snackbar({ content: utils.resolveError(error) });
            },
        });
    }

    render() {
        const { user, location, outlet } = this.props;
        return (
            <App user={user}>
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
                    rank={this.props.user.rank}
                    sort={this.state.sort}
                    size="small"
                    idOffset
                    scrollable
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

