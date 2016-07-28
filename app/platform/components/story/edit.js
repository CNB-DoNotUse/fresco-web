import React, { PropTypes } from 'react';
import utils from 'utils';

class Edit extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getStateFromProps(props);
    }

    componentDidMount() {
        $.material.init();
    }

    getStateFromProps(props) {
        const { story } = props;
        if (!story) return { loading: false };

        return {
            loading: false,
            title: story.title || '',
            caption: story.caption || '',
        };
    }

    hide() {
        this.props.onToggle();
    }

    revert() {
        if (this.state.loading) return;
        this.setState(this.getStateFromProps(this.props));
    }

    clear() {
        if (this.state.loading) return;
        this.setState({ title: '', caption: '' });
    }

    save() {
        const { story, onUpdateStory } = this.props;
        const { title, caption } = this.state;
        if (!story || !story.id) return;

        $.ajax({
            url: `/api/story/${story.id}/update`,
            method: 'post',
            data: JSON.stringify({ title, caption }),
            contentType: 'application/json',
            dataType: 'json',
        })
        .done((res) => {
            this.hide();
            onUpdateStory(res);
        })
        .fail(() => {
            $.snackbar({ content: 'Unable to save story' });
        })
        .always(() => {
            this.setState({ loading: false });
        });
    }

    remove() {
        const { story } = this.props;
        if (!story || !story.id || this.state.loading) return;

        alertify.confirm('Are you sure you want to delete this story? This cannot be undone.', (e) => {
            $.ajax({
                url: `/api/story/${story.id}/delete`,
                method: 'POST',
                dataType: 'json',
                contentType: 'application/json',
            })
            .done(() => {
                $.snackbar({ content: 'Story deleted' });
                location.href = document.referrer || '/archive/stories';
            })
            .fail(() => {
                $.snackbar({ content: 'Unable to delete gallery' });
            })
            .always(() => {
                this.setState({ loading: false });
            });
        });
    }

    cancel() {
        this.revert();
        this.props.onToggle();
    }

    renderFooter() {
        return (
            <div className="dialog-foot">
                <button
                    id="story-edit-revert"
                    type="button"
                    className="btn btn-flat"
                    onClick={() => this.revert()}
                >
                    Revert changes
                </button>
                <button
                    id="story-edit-clear"
                    type="button"
                    className="btn btn-flat"
                    onClick={() => this.clear()}
                >
                    Clear all
                </button>
                <button
                    id="story-edit-save"
                    type="button"
                    className="btn btn-flat pull-right"
                    onClick={() => this.save()}
                >
                    Save
                </button>
                <button
                    id="story-edit-delete"
                    type="button"
                    className="btn btn-flat pull-right"
                    onClick={() => this.remove()}
                >
                    Delete
                </button>
                <button
                    id="story-edit-discard"
                    type="button"
                    className="btn btn-flat pull-right toggle-edit toggler"
                    onClick={() => this.cancel()}
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
        if (!story || !story.stats) return <div />;

        return (
            <div className="meta">
                <div id="story-edit-caption" className="meta-description">
                    {story.description}
                </div>

                <div className="meta-list">
                    <ul className="md-type-subhead">
                        <li>
                            <span className="mdi mdi-clock icon" />
                            <span id="story-edit-date">{utils.formatTime(story.created_at)}</span>
                        </li>
                        <li>
                            <span className="mdi mdi-image icon" />
                            <span id="story-edit-photo-num">
                                {story.stats.photos} {story.stats.photos === 1 ? 'photo' : 'photos'}
                            </span>
                        </li>
                        <li>
                            <span className="mdi mdi-movie icon" />
                            <span id="story-edit-video-num">
                                {story.stats.videos} {story.stats.videos === 1 ? 'video' : 'videos'}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                <div className="dim toggle-edit toggled" />
                <div className="edit panel panel-default toggle-edit toggled">
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
    story: PropTypes.object.isRequired,
    onUpdateStory: PropTypes.func,
};

export default Edit;

