import React, { PropTypes } from 'react';
import GalleryListItem from './gallery-list-item';
import GalleryEdit from './gallery-edit';
import findIndex from 'lodash/findIndex';

class Galleries extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasActiveGallery: false,
            activeGallery: {},
        };
    }

    onUpdateGallery(id) {
        const { galleries, removeGallery } = this.props;
        const index = findIndex(galleries, { id });
        const nextGallery = galleries[index + 1]
            || galleries[index - 1]
            || null;
        removeGallery(id);
        this.setActiveGallery(nextGallery);
    }

    setActiveGallery(activeGallery) {
        this.setState({ activeGallery });
    }

    scroll(e) {
        const { getData, galleries } = this.props;
        const target = e.target;

        if (target.scrollTop === target.scrollHeight - target.offsetHeight) {
            if (!galleries || !galleries.length) return;

            getData(galleries[galleries.length - 1].id, {
                concat: true,
                tab: 'galleries',
            },
            null);
        }
    }

    renderGalleries() {
        const { galleries } = this.props;
        const { activeGallery } = this.state;

        function sortListItem(a, b) {
            if (a.created_at > b.created_at) {
                return -1;
            } else if (a.created_at < b.created_at) {
                return 1;
            }

            return 0;
        }

        return galleries.sort(sortListItem).map((gallery, i) => (
            <GalleryListItem
                type="gallery"
                gallery={gallery}
                key={i}
                active={(activeGallery && activeGallery.id === gallery.id) || false}
                onClick={() => this.setActiveGallery(gallery)}
            />
        ));
    }

    render() {
        const { activeGallery } = this.state;
        let editPane = '';

        if (activeGallery && activeGallery.id) {
            editPane = (
                <GalleryEdit
                    galleryType={this.props.galleryType}
                    gallery={activeGallery}
                    onUpdateGallery={(id) => this.onUpdateGallery(id)}
                />
            );
        }

        return (
            <div className="container-fluid admin">
                <div className="col-md-6 col-lg-7 list" onScroll={(e) => this.scroll(e)}>
                    {this.renderGalleries()}
                </div>
                <div className="col-md-6 col-lg-5 form-group-default admin-edit-pane">
                    {editPane}
                </div>
            </div>
        );
    }
}

Galleries.propTypes = {
    removeGallery: PropTypes.func.isRequired,
    galleries: PropTypes.array.isRequired,
    getData: PropTypes.func.isRequired,
    galleryType: PropTypes.string.isRequired,
};

export default Galleries;

