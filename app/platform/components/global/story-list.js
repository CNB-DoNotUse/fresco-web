import React from 'react'
import StoryCell from './story-cell.js'
import _ from 'lodash';

/** //

Description : List for a set of stories used across the site (/videos, /photos, /gallery/id, /assignment/id , etc.)

// **/

/**
 * Story List Parent Object
 */

export default class StoryList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			stories: []
		}
		this.scroll = this.scroll.bind(this);
	}

	componentDidMount() {
		//Access parent var load method
		this.props.loadStories(null, (stories) => {
			//Set stories from successful response
			this.setState({
				stories: stories
			});
		});
	}

	//Scroll listener for main window
	scroll(e) {
		const grid = e.target;

		//Check that nothing is loading and that we're at the end of the scroll,
		//and that we have a parent bind to load more stories
		if(!this.state.loading && grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight) - 400) && this.props.loadStories){
			//Set that we're loading
			this.setState({ loading : true })

			//Run load on parent call
			this.props.loadStories(_.last(this.state.stories).id, (stories) => {
				if(!stories) return;

				//Set galleries from successful response, and unset loading
				this.setState({
					stories: this.state.stories.concat(stories),
					loading : !this.state.loading
				});
			});
		}
	}

    render() {
    	console.log(this.state);

		return (
			<div 
				className="container-fluid fat grid" 
				ref='grid' 
				onScroll={this.props.scrollable ? this.scroll : null}
			>
				<div className="row tiles" id="stories">
					{this.state.stories.map((story, i) => {
				      	return (
				        	<StoryCell
				        		story={story}
				        		key={i} />
				      	)
			  		})}
				</div>
			</div>
		);
	}
}
