import React, { PropTypes } from 'react';
import GalleryListItem from './gallery-list-item';
import GalleryEdit from './gallery-edit';
import findIndex from 'lodash/findIndex';
import omit from 'lodash/omit';

class Galleries extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasActiveGallery: false,
            activeGallery: {},
        };
    }

    onUpdateGallery(id) {
        const { removeGallery, galleries } = this.props;
        const index = findIndex(galleries, { id });
        const newIndex = galleries.length === (index + 1)
            ? index - 1
            : index + 1;

        if (galleries[newIndex]) {
            this.setState({ activeGallery: galleries[newIndex] },
                () => removeGallery(id));
        } else {
            this.setState({ activeGallery: null }, () => removeGallery(id));
        }
    }

    setActiveGallery(activeGallery) {
        this.setState({ activeGallery });
    }

    remove(id) {
        $.ajax({
            url: `/api/gallery/${id}/delete`,
            method: 'post',
            contentType: 'application/json',
            dataType: 'json',
            success: () => {
                this.onUpdateGallery(id);
            },
            // error: (xhr, status, error) => {
            //     cb(error);
            // },
        });
    }

    skip(id) {
        $.ajax({
            url: `/api/gallery/${id}/update`,
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify({
                rating: 1,
            }),
            dataType: 'json',
            success: () => {
                this.onUpdateGallery(id);
            },
            // error: (xhr, status, error) => {
            //     cb(error);
            // },
        });
    }


    verify(params, cb) {
        const { id } = params;
        if (!id || !cb) return;
        let data = Object.assign({}, params, { rating: 2 });
        data = omit(data, 'id');

        $.ajax({
            url: `/api/gallery/${id}/update`,
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(data),
            dataType: 'json',
            success: () => {
                this.onUpdateGallery(id);
                cb(null, id);
            },
            error: (xhr, status, error) => {
                cb(error);
            },
        });
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
                setActiveGallery={() => this.setActiveGallery(gallery)}
            />
        ));
    }

    render() {
        const { activeGallery } = this.state;
        let editPane = '';

        if (activeGallery && activeGallery.id) {
            editPane = (
                <GalleryEdit
                    hasActiveGallery
                    activeGalleryType={'galleries'}
                    gallery={activeGallery}
                    skip={(id, cb) => this.skip(id, cb)}
                    verify={(params, cb) => this.verify(params, cb)}
                    remove={(id, cb) => this.remove(id, cb)}
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
};

export default Galleries;

