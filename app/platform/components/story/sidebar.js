import React, { PropTypes } from 'react';

/**
 * Story Sidebar parent object
 * @description Column on the left of the posts grid on the story detail page
 */
class Sidebar extends React.Component {
    renderStats() {
        const { story } = this.props;
        if (!story || !story.stats) return '';

        return (
            <div className="meta-list">
                <ul className="md-type-subhead">
                    <li>
                        <span className="mdi mdi-image-multiple icon story-galleries"></span>
                        <span>{story.stats.galleries} {story.stats.galleries > 1 ? 'galleries' : 'gallery'}</span>
                    </li>
                    <li>
                        <span className="mdi mdi-image icon"></span>
                        <span>{story.stats.photos} {story.stats.photos > 1 ? 'photos' : 'photo'}</span>
                    </li>
                    <li>
                        <span className="mdi mdi-movie icon"></span>
                        <span>{story.stats.videos} {story.stats.videos > 1 ? 'videos' : 'video'}</span>
                    </li>
                </ul>
            </div>
        );
    }

    render() {
        return (
            <div className="col-sm-4 profile hidden-xs">
                <div className="container-fluid fat">
                    <div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
                        <div className="meta">
                            <div className="meta-description" id="story-description">
                                {this.props.story.caption || 'No Description'}
                            </div>

                            {this.renderStats()}
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

Sidebar.propTypes = {
    story: PropTypes.object,
};

export default Sidebar;

