import React from 'react'
import StoryCell from './story-cell.js'

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
		this.props.loadStories(0, (stories) => {
			
			var offset = stories ? stories.length : 0;

			//Set stories from successful response
			this.setState({
				stories: stories,
			});

		});
	}

	//Scroll listener for main window
	scroll(e) {

		var grid = e.target;

		//Check that nothing is loading and that we're at the end of the scroll, 
		//and that we have a parent bind to load  more stories
		if(!this.state.loading && grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight) - 400) && this.props.loadStories){

			self = this;

			//Set that we're loading
			this.setState({ loading : true })

			//Run load on parent call
			this.props.loadStories(this.state.offset, function(stories){

				if(!stories) return;

				var offset = self.state.stories.length + stories.length;

				//Set galleries from successful response, and unset loading
				self.setState({
					stories: self.state.stories.concat(stories),
					offset : offset,
					loading : false
				});

			}, this);
		}
	}
	
	render() {

		//Check if list was initialzied with stories
		stories = this.state.stories;

		var purchases = this.props.purchases,
			rank = this.props.rank;

		//Map all the stories into cells
		var stories = stories.map((story, i) => {

			var purchased = purchases ? purchases.indexOf(story._id) != -1 : null;

	      	return (
	        	
	        	<StoryCell 
	        		story={story} 
	        		key={i} />
	        		
	      	)

  		})

		return (

			<div className="container-fluid fat grid" ref='grid' onScroll={this.props.scrollable ? this.scroll : null}>
				<div className="row tiles" id="stories">{stories}</div>
			</div>

		)		
	}

}
