import React, { PropTypes } from 'react';
import GalleryListItem from './admin-gallery-list-item';
import AssignmentListItem from './admin-assignment-list-item';
import AdminGalleryEdit from './admin-gallery-edit';
import AdminAssignmentEdit from './admin-assignment-edit';

class AdminBody extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasActiveGallery: false,
            activeGalleryType: '',
            activeGallery: {},
            activeAssignment: {},
        };

        this.setActiveAssignment = this.setActiveAssignment.bind(this);
        this.setActiveGallery = this.setActiveGallery.bind(this);
        this.updateAssignment = this.updateAssignment.bind(this);
        this.skip = this.skip.bind(this);
        this.verify = this.verify.bind(this);
        this.remove = this.remove.bind(this);
        this.spliceGallery = this.spliceGallery.bind(this);
        this.scroll = this.scroll.bind(this);
    }

    componentDidUpdate(prevProps) {
        const galleryType = this.props.activeTab.slice(0, -1);
        const self = this;

        // If tab changed
        if (this.props.activeTab != prevProps.activeTab) {
            // If activeTab has submissions / assignments object, but no actual submissions / assignments, then hide admin panes.
            if (this.props[this.props.activeTab] && this.props[this.props.activeTab].length === 0) {
                this.setState({
                    hasActiveGallery: false,
                    activeAssignment: null,
                    activeGallery: null,
                    activeGalleryType: '',
                });

                return;
            }

            if (galleryType === 'assignment') {
                // Special case for assignments because they are not a gallery.

                this.setState({
                    hasActiveGallery: true,
                    activeAssignment: this.props.assignments[0],
                    activeGallery: null,
                    activeGalleryType: 'assignment',
                });

            } else {
                setFirstGalleryActive();
            }
        }

        // If didn't have content before, set active to the first in current.
        if (this.props[this.props.activeTab] && this.props[this.props.activeTab].length && prevProps[this.props.activeTab].length == 0) {
            setFirstGalleryActive();
        }

        function setFirstGalleryActive() {
            if (!self.props[self.props.activeTab]) return;

            const updatedData = {
                hasActiveGallery: true,
                activeGalleryType: galleryType,
                activeAssignment: null,
            };
            const activeField = galleryType == 'assignment' ? 'activeAssignment' : 'activeGallery';

            updatedData[activeField] = self.props[self.props.activeTab][0];

            self.setState(updatedData);
        }
    }

    setActiveAssignment(id) {
        if (id == null) {
            this.setState({
                hasActiveGallery: false,
                activeAssignment: false,
            });

            return;
        }

        for (let a in this.props.assignments) {
            if (this.props.assignments[a].id == id) {
                this.setState({
                    hasActiveGallery: true,
                    activeAssignment: this.props.assignments[a],
                });
                break;
            }
        }
    }

    setActiveGallery(id, type) {
        if( this.state.activeGallery.id == id ) return;
        let gallery = {};

        if (type === 'submission') {
            const submissions = this.props.submissions;
            for (let i in submissions) {
                if (submissions[i].id === id) {
                    gallery = submissions[i];
                    break;
                }
            }
        }

        if ( type === 'import' ) {
            const imports = this.props.imports;
            for (var i in imports) {
                if (imports[i].id === id) {
                    gallery = imports[i];
                    break;
                }
            }
        }

        this.setState({
            hasActiveGallery: gallery.hasOwnProperty('id'),
            activeGalleryType: type,
            activeGallery: gallery,
            activeAssignment: null,
        });
    }

    updateAssignment(id) {
        const propGalleryType = this.state.activeGalleryType + 's';
        const assignments = this.props[propGalleryType];
        let next_index = 0;

        for (let a in assignments) {
            if (id === assignments[a].id) {
                if (a === (assignments.length - 1)) {
                    next_index = a - 1;
                } else {
                    next_index = a;
                    assignments.splice(a, 1);
                }
            }
        }

        this.setActiveAssignment(assignments ? assignments[next_index] ? assignments[next_index].id : null : null);
    }

    spliceGallery(cb) {
        const propGalleryType = this.state.activeGalleryType + 's';
        this.props.spliceGallery({ type: propGalleryType, gallery: this.state.activeGallery.id }, (err, nextGallery) => {
            if (this.props[propGalleryType].length) {
                this.setActiveGallery(this.props[propGalleryType][nextGallery].id, this.state.activeGalleryType);
            }
            cb();
        });
    }

    remove(cb) {
        $.ajax({
            url: '/api/gallery/remove',
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify({ id: this.state.activeGallery.id }),
            dataType: 'json',
            success: () => {
                this.spliceGallery(() => {
                    cb(null, this.state.activeGallery.id);
                });
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
                this.spliceGallery(() => {
                    cb(null, this.state.activeGallery.id);
                });
            },
            error: (xhr, status, error) => {
                cb(error);
            },
        });
    }

    verify(options, cb) {
        $.ajax({
            url: '/api/gallery/update',
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(options),
            dataType: 'json',
            success: (result) => {
                if (result.err) {
                    return cb(result.err);
                }

                return this.spliceGallery(() => {
                    cb(null, options.id);
                });
            },
            error: (xhr, status, error) => {
                cb(error);
            },
        });
    }

    scroll(e) {
        const target = e.target;
        if (target.scrollTop === target.scrollHeight - target.offsetHeight) {
            const items = this.props[this.props.activeTab];
            if (!items) return;

            this.props.getData(items[items.length - 1].id, {concat: true, tab: this.state.activeGalleryType + 's'}, (data) => {});
        }
    }

    render() {
        function sortListItem(a, b) {
            if (a.created_at > b.created_at) {
                return -1;
            } else if (a.created_at < b.created_at) {
                return 1;
            }

            return 0;
        }

        let listItems;
        let editPane;
        switch (this.props.activeTab) {
            case 'assignments':
                if (!this.state.activeAssignment || !this.state.hasActiveGallery || !this.props.assignments.length) break;
                listItems = this.props.assignments.sort(sortListItem).map((assignment, i) => {
                    return (
                        <AssignmentListItem
                            type="assignment"
                            assignment={assignment}
                            key={i}
                            active={this.state.activeAssignment.id === assignment.id}
                            setActiveAssignment={this.setActiveAssignment}
                        />
                    );
                });
                if (this.state.activeAssignment && this.state.activeAssignment.id) {
                    editPane = (
                        <AdminAssignmentEdit
                            hasActiveGallery={this.state.hasActiveGallery}
                            activeGalleryType={this.state.activeGalleryType}
                            assignment={this.state.activeAssignment}
                            updateAssignment={this.updateAssignment}
                        />
                    );
                }
                break;
			case 'submissions':
                if (!this.state.activeGallery|| !this.state.hasActiveGallery || !this.props.submissions.length) break;
                listItems = this.props.submissions.sort(sortListItem).map((submission, i) => {
                    return (
                        <GalleryListItem
                            type="submission"
                            gallery={submission}
                            key={i}
                            active={this.state.activeGallery.id == submission.id}
                            setActiveGallery={this.setActiveGallery}
                        />
                    );
                });
                editPane = (
                    <AdminGalleryEdit
                        hasActiveGallery={this.state.hasActiveGallery}
                        activeGalleryType={this.state.activeGalleryType}
                        gallery={this.state.activeGallery}
                        skip={this.skip}
                        verify={this.verify}
                        remove={this.remove}
                    />
                );

                break;
            case 'imports':
				if (!this.state.activeGallery || !this.state.hasActiveGallery || !this.props.imports.length) {
					break;
				}

                listItems = this.props.imports.sort(sortListItem).map((gallery, i) => {
                    return (
                        <GalleryListItem
                            type="import"
                            gallery={gallery}
                            key={i}
                            active={this.state.activeGallery.id == gallery.id}
                            setActiveGallery={this.setActiveGallery}
                        />
                    );
                });

                editPane = (
                    <AdminGalleryEdit
                        hasActiveGallery={this.state.hasActiveGallery}
                        activeGalleryType={this.state.activeGalleryType}
                        gallery={this.state.activeGallery}
                        skip={this.skip}
                        verify={this.verify}
                        remove={this.remove}
                    />
                );

                break;
            default:
                break;
        }

        return (
            <div className="container-fluid admin">
                <div className="col-md-6 col-lg-7 list" onScroll={this.scroll}>
                    {listItems}
                </div>
                <div className="col-md-6 col-lg-5 form-group-default admin-edit-pane">
                    {editPane}
                </div>
            </div>
        );
    }
}

AdminBody.propTypes = {
    activeTab: PropTypes.string,
};

export default AdminBody;
