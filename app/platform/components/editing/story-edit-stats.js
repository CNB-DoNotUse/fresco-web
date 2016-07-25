import React from 'react'
import utils from 'utils'

export default class StoryEditStats extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const { story } = this.props;

		if(!story.stats) {
			return (
				<div></div>
			);
		}

		return (
			<div className="meta">
				<div id="story-edit-caption" className="meta-description">
					{story.description}
				</div>

				<div className="meta-list">
					<ul className="md-type-subhead">
						<li>
							<span className="mdi mdi-clock icon"></span>
							<span id="story-edit-date">{utils.formatTime(story.created_at)}</span>
						</li>
						<li>
							<span className="mdi mdi-image icon"></span>
							<span id="story-edit-photo-num">{story.stats.photos} {story.stats.photos == 1 ? 'photo' : 'photos'}</span>
						</li>
						<li>
							<span className="mdi mdi-movie icon"></span>
							<span id="story-edit-video-num">{story.stats.videos} {story.stats.videos == 1 ? 'video' : 'videos'}</span>
						</li>
					</ul>
				</div>
			</div>
		)
	}
}
