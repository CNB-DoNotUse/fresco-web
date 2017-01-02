import React, { PropTypes } from 'react';
import ReactDom from 'react-dom';
import App from './app';
import GalleryList from '../components/gallery/list';
import TopBar from '../components/topbar';
import api from 'app/lib/api';
import isEqual from 'lodash/isEqual';

/**
 * Highlights Parent Object (composed of GalleryList and Navbar)
 * Half = False, to render at large size instead of half size
 */

class Highlights extends React.Component {
    static propTypes = {
        user: PropTypes.object,
    }

    state = {
        galleries: [],
        loading: false,
    };

    componentDidMount() {
        this.loadInitialGalleries();
    }

    // Scroll listener for main window
    onScroll = (e) => {
        const grid = e.target;
        const bottomReached = grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight) - 400);

        if (!this.state.loading && bottomReached) {
            const lastGallery = this.state.galleries[this.state.galleries.length - 1];
            if (!lastGallery) return;
            this.setState({ loading: true });

            this.loadGalleries(lastGallery.id, (galleries) => {
                if (!galleries) return;

                // Set galleries from successful response
                this.setState({
                    galleries: this.state.galleries.concat(galleries),
                    loading: false,
                });
            });
        }
    }

    loadInitialGalleries = () => {
        this.setState({ galleries: [] }, () => {
            this.loadGalleries(null, (galleries) => {
                this.list.grid.scrollTop = 0;
                this.setState({ galleries });
            });
        });
    }

    // Returns array of galleries with offset and callback
    loadGalleries = (last, callback) => {
        const params = {
            limit: 20,
            last,
        };

        api
        .get('gallery/highlights', params)
        .then(callback)
        .catch(() => {
            $.snackbar({ content: 'Failed to load galleries' });
        });
    }
    render() {
        return (
            <App user={this.props.user} page="highlights">
                <TopBar title="Highlights" timeToggle />

                <GalleryList
                    ref={(r) => { this.list = r; }}
                    onScroll={this.onScroll}
                    galleries={this.state.galleries}
                    withList
                    highlighted
                />
            </App>
        );
    }
}

ReactDom.render(
    <Highlights user={window.__initialProps__.user} />,
    document.getElementById('app')
);

