import React from 'react'

/** //

Description : Column on the left of the posts grid on the story detail page

// **/

/**
 * Story Sidebar parent object
 */

export default class StorySidebar extends React.Component {

	render() {	

		return (
			<div className="col-sm-4 profile hidden-xs">
				<div className="container-fluid fat">
					<div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
						<div className="meta">
							<div className="meta-description" id="story-description">{this.props.story.caption || 'No Description'}</div>
							<StoryStats story={this.props.story} />
						</div>
					</div>
				</div>
			</div>

		);
	}

}


/**
 * Story stats inside the sidebar
 */

class StoryStats extends React.Component {

	render() {

		if(!this.props.story.stats) return;
		
		return (

			<div className="meta-list">
				<ul className="md-type-subhead">
					<li>
						<span className="mdi mdi-image-multiple icon story-galleries"></span>
						<span>{this.props.story.stats.galleries} {this.props.story.stats.galleries > 1 ? 'galleries' : 'gallery'}</span>
					</li>
					<li>
						<span className="mdi mdi-image icon"></span>
						<span>{this.props.story.stats.photos} {this.props.story.stats.photos > 1 ? 'photos' : 'photo'}</span>
					</li>
					<li>
						<span className="mdi mdi-movie icon"></span>
						<span>{this.props.story.stats.videos} {this.props.story.stats.videos > 1 ? 'videos' : 'video'}</span>
					</li>
				</ul>
			</div>
			
		)
	}
}