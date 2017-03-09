import React, { PropTypes } from 'react';
import pickBy from 'lodash/pickBy';
import utils from 'utils';
import time from 'app/lib/time';

/**
 * Story Edit Component
 */
class Edit extends React.Component {
    state = this.getStateFromProps(this.props);

    componentDidMount() {
        $.material.init();
    }

    onSave() {
        const { title, caption } = this.state;
        const { story, save } = this.props;
        if (!story || !story.id) return;
        let params = pickBy({ title, caption }, (v, k) => story[k] !== v);

        save(story.id, params);
    }

    onRemove() {
        const { story, remove } = this.props;
        if (!story || !story.id) return;

        remove(story.id);
    }

    getStateFromProps(props) {
        const { story } = props;
        if (!story) return {};

        return {
            title: story.title || '',
            caption: story.caption || '',
        };
    }

    hide() {
        this.props.onToggle();
    }

    revert() {
        if (this.props.loading) return;
        this.setState(this.getStateFromProps(this.props));
    }

    clear() {
        if (this.props.loading) return;
        this.setState({ title: '', caption: '' });
    }

    cancel() {
        this.revert();
        this.props.onToggle();
    }

    renderFooter() {
        const { loading } = this.props;

        return (
            <div className="dialog-foot">
                <button
                    id="story-edit-revert"
                    type="button"
                    className="btn btn-flat"
                    onClick={() => this.revert()}
                    disabled={loading}
                >
                    Revert changes
                </button>
                <button
                    id="story-edit-clear"
                    type="button"
                    className="btn btn-flat"
                    onClick={() => this.clear()}
                    disabled={loading}
                >
                    Clear all
                </button>
                <button
                    id="story-edit-save"
                    type="button"
                    className="btn btn-flat pull-right"
                    onClick={() => this.onSave()}
                    disabled={loading}
                >
                    Save
                </button>
                <button
                    id="story-edit-delete"
                    type="button"
                    className="btn btn-flat pull-right"
                    onClick={() => this.onRemove()}
                    disabled={loading}
                >
                    Delete
                </button>
                <button
                    id="story-edit-discard"
                    type="button"
                    className="btn btn-flat pull-right toggle-edit toggler"
                    onClick={() => this.cancel()}
                    disabled={loading}
                >
                    Discard
                </button>
            </div>
        );
    }

    renderBody() {
        const { title, caption } = this.state;

        return (
            <div className="dialog-body">
                <div className="dialog-col col-xs-12 form-group-default">
                    <div className="dialog-row">
                        <input
                            id="story-edit-title-input"
                            type="text"
                            className="form-control floating-label"
                            placeholder="Title"
                            title="Title"
                            value={title}
                            onChange={(e) => this.setState({ title: e.target.value })}
                        />
                    </div>
                    <div className="dialog-row">
                        <textarea
                            id="story-edit-caption-input"
                            type="text"
                            className="form-control floating-label"
                            placeholder="Caption"
                            title="Caption"
                            value={caption}
                            onChange={(e) => this.setState({ caption: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        );
    }

    renderHeader() {
        return (
            <div className="dialog-head">
                <span className="md-type-title">Edit story</span>
                <span
                    className="mdi mdi-close pull-right icon toggle-edit toggler"
                    onClick={() => this.hide()}
                />
            </div>
        );
    }

    renderStats() {
        const { story } = this.props;
        const { caption } = this.state;

        return (
            <div className="meta">
                <div id="story-edit-caption" className="meta-description">
                    {caption}
                </div>

                <div className="meta-list">
                    <ul className="md-type-subhead">
                        <li>
                            <span className="mdi mdi-clock icon" />
                            <span id="story-edit-date">Created {time.formatTime(story.created_at)}</span>
                        </li>
                        <li>
                            <span className="mdi mdi-clock icon" />
                            <span id="story-edit-date">Updated {time.formatTime(story.updated_at)}</span>
                        </li>
                        <li>
                            <span className="mdi mdi-image icon" />
                            <span id="story-edit-photo-num">
                                {story.photo_count} {story.photo_count=== 1 ? 'photo' : 'photos'}
                            </span>
                        </li>
                        <li>
                            <span className="mdi mdi-movie icon" />
                            <span id="story-edit-video-num">
                                {story.video_count} {story.video_count === 1 ? 'video' : 'videos'}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    render() {
        const { visible } = this.props;

        return (
            <div>
                <div className={`dim toggle-edit ${visible ? 'toggled' : ''}`} />
                <div className={`edit panel panel-default toggle-edit ${visible ? 'toggled' : ''}` }>
                    <div className="col-lg-4 visible-lg edit-current">
                        {this.renderStats()}
                    </div>

                    <div className="col-xs-12 col-lg-8 edit-new dialog">
                        {this.renderHeader()}
                        {this.renderBody()}
                        {this.renderFooter()}
                    </div>
                </div>
            </div>
        );
    }
}

Edit.propTypes = {
    onToggle: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    story: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    visible: PropTypes.bool.isRequired,
};

export default Edit;

