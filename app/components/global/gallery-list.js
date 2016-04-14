import React from 'react';
import SuggestionList from '../highlights/suggestion-list'
import GalleryCell from './gallery-cell'
import global from '../../../lib/global'

/** //

Description : List for a gallery used across the site (/highlights, /content/galleries, etc.)

// **/

/**
 * Gallery List Parent Object 
 */

export default class GalleryList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			galleries: [],
			offset : 0,
			loading : false,
			tags :[]
		}
		this.loadGalleries = this.loadGalleries.bind(this);
		this.loadInitalGalleries = this.loadInitalGalleries.bind(this);
		this.scroll = this.scroll.bind(this);
	}

	loadInitalGalleries() {
		this.loadGalleries(0, (galleries) => {

			var offset = galleries ? galleries.length : 0;

			//Set galleries from successful response
			this.setState({
				galleries: galleries,
				offset : offset
			});

		});
	}

	componentDidUpdate(prevProps, prevState) {
		if(prevProps.onlyVerified != this.props.onlyVerified) {
			this.setState({
				galleries: []
			});
			
			this.loadInitalGalleries();
		}
	}

	componentDidMount() {

		this.loadInitalGalleries();

	}

	//Returns array of galleries with offset and callback
	loadGalleries(passedOffset, callback) {

		var endpoint,
			params = {
				limit: 20,
				offset: passedOffset,
				sort: this.props.sort
			};

		if(this.props.highlighted) {
			endpoint = 'gallery/highlights';
			
			params.invalidate = 1;
		} else {
			endpoint ='gallery/list';
			
			params.tags = this.state.tags.join(',')
			
			if(this.props.onlyVerified)
				params.verified = true;
		}

		$.ajax({
			url:  '/api/' + endpoint,
			type: 'GET',
			data: params,
			dataType: 'json',
			success: (response, status, xhr) => {
				
				//Do nothing, because of bad response
				if(!response.data || response.err) 
					callback([]);
				else
					callback(response.data);
				
			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error)});
			}

		});

	}

	//Scroll listener for main window
	scroll(e) {

		var grid = e.target;

		if(!this.state.loading && grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight) - 400)){

			this.setState({ 
				loading : true 
			})

			this.loadGalleries(this.state.offset, (galleries) => {

				if(!galleries) return;

				var offset = this.state.galleries.length + galleries.length;

				//Set galleries from successful response
				this.setState({
					galleries: this.state.galleries.concat(galleries),
					offset : offset,
					loading : false
				});

			});

		}

	}

	render() {

		var half = !this.props.withList;

		//Save all the galleries
		var galleries = <div className="row tiles">
				    		{this.state.galleries.map((gallery, i) => {
						      	return (
						        	<GalleryCell gallery={gallery} half={half} key={i} />
						      	)
					  		})}
			    		</div>;


		//Check if a list is needed
		if(!half) {

			return (
	    		<div className="container-fluid grid" onScroll={this.scroll} ref="grid" >
			    	<div className="col-md-8">{galleries}</div>
				    <SuggestionList />
		    	</div>
		    );

		}
		//No list needed
		else {

			return (
	    		<div className="container-fluid grid" onScroll={this.scroll} ref="grid">
	    			{galleries}
	    		</div>
		    );
		}
	}
}

GalleryList.defaultProps = {
	onlyVerified: true
}