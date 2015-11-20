var React = require('react');
var ReactDOM = require('react-dom');

/** //

Description : Column on the left of the posts grid on the story detail page

// **/

/**
 * Story sidebar parent object
 */

var StorySidebar = React.createClass({

	displayName: 'StorySidebar',

	render: function() {	

		return (
			<div className="col-sm-4 profile hidden-xs">
				<div className="container-fluid fat">
					<div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
						<div className="meta">
							<div className="meta-description" id="story-description">{this.props.story.caption || ''}</div>
							<StoryStats story={this.props.story} />
						</div>
					</div>
				</div>
			</div>

		);
	}

});


/**
 * Story stats inside the sidebar
 */

var StoryStats = React.createClass({

	displayName : 'StoryStats',

	render: function(){

		if(!this.props.story.stats) return;

		var photos = ''
			videos = '';

		if(this.props.story.stats.photos){
			photos = <li>
						<span className="mdi mdi-file-image-box icon"></span>
						{this.props.story.stats.photos}photos
					</li>
		}
		if(this.props.story.stats.videos){
			videos = <li>
						<span className="mdi mdi-movie icon"></span>
						{this.props.story.stats.videos + ' video'}
					</li>
		}

		return (

			<div className="meta-list">
				<ul className="md-type-subhead">
					{photos}
					{videos}
				</ul>
			</div>
			
		)
	}
});

module.exports = StorySidebar;