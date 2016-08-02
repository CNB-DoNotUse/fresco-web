import React, { PropTypes } from 'react';
import GalleryListItem from './gallery-list-item';
import GalleryEdit from './gallery-edit';
import findIndex from 'lodash/findIndex';

/**
 * Galleries - component for managing submissions
 * and imports galleries in admin view
 *
 * @extends React.Component
 */
class Galleries extends React.Component {
    constructor(props) {
        super(props);

        this.state = { activeGallery: null, loading: false };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.galleryType !== nextProps.galleryType) {
            this.setState({ activeGallery: null });
        }
    }

    /**
     * onUpdateGallery
     *
     * @param {number} id Called on updating gallery
     * to set next active assignment and remove updated
     */
    onUpdateGallery(id) {
        const { galleries, removeGallery } = this.props;
        const index = findIndex(galleries, { id });

        removeGallery(id, (arr) => {
            this.setActiveGallery(arr[index] || arr[index + 1] || arr[index - 1]);
        });
    }

    setActiveGallery(activeGallery) {
        this.setState({ activeGallery });
    }

	/**
	 * Gets all form data and verifies gallery.
	 */
    verify(id, params) {
        if (!id || !params || this.state.loading) return;
        this.setState({ loading: true });

        $.ajax({
            url: `/api/gallery/${id}/update`,
            method: 'POST',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json',
        })
        .done(() => {
            this.onUpdateGallery(id);
            $.snackbar({
                content: 'Gallery verified! Click to open',
                timeout: 5000,
            }).click(() => {
                const win = window.open(`/gallery/${id}`, '_blank');
                win.focus();
            });
        })
        .fail(() => {
            $.snackbar({ content: 'Unable to verify gallery' });
        })
        .always(() => {
            this.setState({ loading: false });
        });
    }

	/**
	 * Removes callery
     */
    remove(id) {
        if (!id || this.state.loading) return;
        this.setState({ loading: true });

        $.ajax({
            url: `/api/gallery/${id}/delete`,
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
        })
        .done(() => {
            this.onUpdateGallery(id);
            $.snackbar({ content: 'Gallery deleted' });
        })
        .fail(() => {
            $.snackbar({ content: 'Unable to delete gallery' });
        })
        .always(() => {
            this.setState({ loading: false });
        });
    }

	/**
     * Skips gallery
     */
    skip(id) {
        if (!id || this.state.loading) return;
        this.setState({ loading: true });

        $.ajax({
            url: `/api/gallery/${id}/update`,
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                rating: 1,
            }),
        })
        .done(() => {
            this.onUpdateGallery(id);
            $.snackbar({ content: 'Gallery skipped! Click to open', timeout: 5000 })
                .click(() => { window.open(`/gallery/${id}`); });
        })
        .fail(() => {
            $.snackbar({ content: 'Unable to skip gallery' });
        })
        .always(() => {
            this.setState({ loading: false });
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
                    skip={(id) => this.skip(id)}
                    remove={(id) => this.remove(id)}
                    verify={(id, p) => this.verify(id, p)}
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

