import React, { PropTypes } from 'react';
import GalleryListItem from './admin-gallery-list-item';
import AdminGalleryEdit from './admin-gallery-edit';
import findIndex from 'lodash/findIndex';
import omit from 'lodash/omit';

class Submissions extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasActiveSubmission: false,
            activeSubmission: {},
        };

        this.skip = this.skip.bind(this);
        this.verify = this.verify.bind(this);
        this.remove = this.remove.bind(this);
        this.scroll = this.scroll.bind(this);
    }

    onUpdateSubmission(id) {
        const { removeSubmission, submissions } = this.props;
        const index = findIndex(submissions, { id });

        if (submissions[index + 1]) {
            this.setState({ activeSubmission: submissions[index + 1] },
                () => removeSubmission(id));
        } else {
            this.setState({ activeSubmission: null }, () => removeSubmission(id));
        }
    }


    setActiveSubmission(activeSubmission) {
        this.setState({ activeSubmission });
    }

    remove(cb) {
        $.ajax({
            url: '/api/gallery/remove',
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify({ id: this.state.activeGallery.id }),
            dataType: 'json',
            success: () => {
                this.onUpdateSubmission();
                cb();
            },
            error: (xhr, status, error) => {
                cb(error);
            },
        });
    }

    skip(cb) {
        $.ajax({
            url: '/api/gallery/update',
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify({
                id: this.state.activeGallery.id,
                rated: 1,
                visibility: 0,
            }),
            dataType: 'json',
            success: () => {
                this.onUpdateSubmission();
                cb();
            },
            error: (xhr, status, error) => {
                cb(error);
            },
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
                this.onUpdateSubmission();
                cb(null, id);
            },
            error: (xhr, status, error) => {
                cb(error);
            },
        });
    }

    scroll(e) {
        const { getData, submissions } = this.props;
        const target = e.target;

        if (target.scrollTop === target.scrollHeight - target.offsetHeight) {
            if (!submissions || !submissions.length) return;

            getData(submissions[submissions.length - 1].id, {
                concat: true,
                tab: 'submissions',
            },
            null);
        }
    }

    renderSubmissions() {
        const { submissions } = this.props;
        const { activeSubmission } = this.state;

        function sortListItem(a, b) {
            if (a.created_at > b.created_at) {
                return -1;
            } else if (a.created_at < b.created_at) {
                return 1;
            }

            return 0;
        }

        return submissions.sort(sortListItem).map((gallery, i) => (
            <GalleryListItem
                type="submission"
                gallery={gallery}
                key={i}
                active={activeSubmission && activeSubmission.id === gallery.id}
                setActiveGallery={() => this.setActiveSubmission(gallery)}
            />
        ));
    }

    render() {
        const { activeSubmission } = this.state;
        let editPane = '';

        if (activeSubmission && activeSubmission.id) {
            editPane = (
                <AdminGalleryEdit
                    hasActiveGallery
                    activeGalleryType={'submissions'}
                    gallery={activeSubmission}
                    skip={this.skip}
                    verify={this.verify}
                    remove={this.remove}
                />
            );
        }

        return (
            <div className="container-fluid admin">
                <div className="col-md-6 col-lg-7 list" onScroll={this.scroll}>
                    {this.renderSubmissions()}
                </div>
                <div className="col-md-6 col-lg-5 form-group-default admin-edit-pane">
                    {editPane}
                </div>
            </div>
        );
    }
}

Submissions.propTypes = {
    removeSubmission: PropTypes.func.isRequired,
    submissions: PropTypes.array.isRequired,
    getData: PropTypes.func.isRequired,
};

export default Submissions;
