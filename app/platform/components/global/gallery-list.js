import React, { PropTypes } from 'react';
import utils from 'utils';
import api from 'app/lib/api';
import { geoParams } from 'app/lib/location';
import GalleryCell from './gallery-cell';
import SuggestionList from '../highlights/suggestion-list';

/**
 * Gallery List Parent Object
 * @description : List for a gallery used across the site (/highlights, /content/galleries, etc.)
 */
class GalleryList extends React.Component {
    static propTypes = {
        onlyVerified: PropTypes.bool,
        withList: PropTypes.bool,
        highlighted: PropTypes.bool,
        location: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
            radius: PropTypes.number,
            address: PropTypes.string,
            source: PropTypes.string,
        }),
        sort: PropTypes.string,
    };

    state = {
        galleries: [],
        loading: false,
        tags: [],
    };

    componentDidMount() {
        this.loadInitialGalleries();
    }

    componentDidUpdate(prevProps) {
        const { onlyVerified, location } = this.props;
        if (prevProps.onlyVerified !== onlyVerified) this.onChangeOnlyVerified();
        if (prevProps.location !== location) this.loadInitialGalleries();
    }

    onChangeOnlyVerified() {
        this.setState({ galleries: [] });
        this.loadInitialGalleries();
        this.grid.scrollTop = 0;
    }

    loadInitialGalleries = () => {
        this.loadGalleries(null, (galleries) => {
            // Set galleries from successful response
            this.setState({ galleries });
        });
    }

    // Returns array of galleries with offset and callback
    loadGalleries = (last, callback) => {
        const { highlighted, onlyVerified, sort, location } = this.props;
        const params = {
            limit: 20,
            last,
            sort,
            ...geoParams(location),
        };

        let endpoint = 'gallery/list';

        if (highlighted) {
            endpoint = 'gallery/highlights';
        } else if (onlyVerified) {
            params.rating = 2;
        } else {
            params.rating = [0, 1, 2];
        }

        api
        .get(endpoint, params)
        .then(callback)
        .catch(() => {
            $.snackbar({ content: 'Failed to load galleries' });
        });
    }

	// Scroll listener for main window
    onScroll = (e) => {
        const grid = e.target;

        if(!this.state.loading && grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight) - 400)){
            const lastGallery = this.state.galleries[this.state.galleries.length - 1];
            if (!lastGallery) return;
            this.setState({ loading : true });

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

    render() {
        const half = !this.props.withList;
        // Save all the galleries
        const galleries = (
            <div className="row tiles">
                {this.state.galleries.map((gallery, i) => (
                    <GalleryCell gallery={gallery} half={half} key={i} />
                ))}
            </div>
        );

        // Check if a list is needed
        if (!half) {
            return (
                <div
                    className="container-fluid grid"
                    onScroll={this.onScroll}
                    ref={(r) => { this.grid = r; }}
                >
                    <div className="col-md-8">{galleries}</div>

                    <SuggestionList />
                </div>
            );
        }
        // No list needed
        return (
            <div
                className="container-fluid grid"
                onScroll={this.onScroll}
                ref={(r) => { this.grid = r; }}
            >
                {galleries}
            </div>
        );
    }
}

GalleryList.defaultProps = {
    onlyVerified: true,
};

export default GalleryList;

