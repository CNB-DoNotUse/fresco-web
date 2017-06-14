import React, { PropTypes } from 'react';
import utils from 'utils';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';
import EditPosts from './edit-posts';
import ChipInput from '../global/chip-input';
import NewBulkEdit from 'app/platform/components/admin/new-bulk-edit';
import * as Promise from 'bluebird';

/**
 * Component for editing multiple posts at once (from possibly different galleries)
 * Bulk Edit Parent Object
 */
class BulkEdit extends React.Component {
    state = { loading: false };

    static propTypes = {
        posts: PropTypes.array.isRequired,
        onHide: PropTypes.func.isRequired,
    };

    static defaultProps = {
        posts: [],
    };

    componentDidMount() {
        $.material.init();
    }

    onClickSave() {

    }

    /**
     * onScroll - stopPropagation of event
     * (prevents post/list and other parent cmp scroll listeners from triggering)
     *
     * @param {object} e event
     */
    onScroll = (e) => {
        e.stopPropagation();
    };

    getStateFromProps(posts) {

    }

    clear() {
        this.setState({ caption: '', tags: [], stories: [] });
    }

    /**
     * Revert the component to it's initial state (pre-edits)
     */
    revert() {
        this.setState(this.getStateFromGalleries(this.state.galleries));
    }

    renderFooter() {
        const { loading } = this.state;

        return (
            <div className="dialog-foot">
                <button
                    onClick={() => this.revert()}
                    type="button"
                    className="btn btn-flat"
                    disabled={loading}
                >
                    Revert
                </button>
                <button
                    onClick={() => this.clear()}
                    type="button"
                    className="btn btn-flat"
                    disabled={loading}
                >
                    Clear fields
                </button>
                <button
                    onClick={() => this.onClickSave()}
                    type="button"
                    className="btn btn-flat pull-right"
                    disabled={loading}
                >
                    Edit posts
                </button>
                <button
                    onClick={this.props.onHide}
                    type="button"
                    className="btn btn-flat pull-right toggle-bedit"
                    disabled={loading}
                >
                    Discard changes
                </button>
            </div>
        );
    }

    render() {
        return (
            <div onScroll={this.onScroll}>
                <div className="dim toggle-bedit toggled" />

                <div className="edit panel panel-default toggle-bedit bedit toggled">
                    <div className="col-xs-12 col-lg-12 edit-new dialog">
                        <div className="dialog-head">
                            <span className="md-type-title">Bulk Edit</span>
                            <span
                                className="mdi mdi-close pull-right icon toggle-edit toggler"
                                onClick={this.props.onHide}
                            />
                        </div>

                        <NewBulkEdit
                            posts={this.props.posts}
                            onUpdateGallery={() => {}}/>
                        {this.renderFooter()}
                    </div>
                </div>
            </div>
        );
    }
}

export default BulkEdit;
