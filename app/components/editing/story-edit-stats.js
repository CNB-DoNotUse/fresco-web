import React from 'react'

export default class StoryEditStats extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="meta">
				<div id="story-edit-caption" className="meta-description"></div>
				<div className="meta-list">
					<ul className="md-type-subhead">
						<li>
							<span className="mdi mdi-clock icon"></span>
							<span id="story-edit-date">{timestampToDate(this.props.story.time_created)}</span>
						</li>
						<li>
							<span className="mdi mdi-file-image-box icon"></span>
							<span id="story-edit-photo-num">{this.props.story.stats.photos} {this.props.story.stats.photos == 1 ? 'photo' : 'photos'}</span>
						</li>
						<li>
							<span className="mdi mdi-movie icon"></span>
							<span id="story-edit-video-num">{this.props.story.stats.videos} {this.props.story.stats.videos == 1 ? 'video' : 'videos'}</span>
						</li>
					</ul>
				</div>
			</div>
		)
	}
}