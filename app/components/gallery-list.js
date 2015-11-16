var React = require('react');
	ReactDOM = require('react-dom'),
	SuggestionList = require('./suggestion-list.js'),
	GalleryCell = require('./gallery-cell.js');

/** //

Description : List for a gallery used across the site (/highlights, /content/galleries, etc.)

// **/

/**
 * Gallery List Parent Object 
 */

var GalleryList = React.createClass({

	displayName : 'GalleryList',

	getInitialState: function() {
		return {
			galleries: [],
			offset : 0,
			loading : false,
			tags :[]
		}
	},
	componentDidMount: function() {

		var self = this;

		this.loadGalleries(0, function(galleries){

			var offset = galleries ? galleries.length : 0;

			//Set galleries from successful response
			self.setState({
				galleries: galleries,
				offset : offset
			});

		});

	},
	//Returns array of galleries with offset and callback
	loadGalleries: function(passedOffset, callback){

		var endpoint,
			params = {
				limit: 14,
				offset: passedOffset,
			};

		if(this.props.highlighted){
			
			endpoint = '/v1/gallery/highlights';

			params.invalidate = 1;

		}
		else{
			
			endpoint ='/v1/gallery/list';
			params.verified = true;
			params.tags = this.state.tags.join(',')

		}

		$.ajax({
			url:  API_URL + endpoint,
			type: 'GET',
			data: params,
			dataType: 'json',
			success: function(response, status, xhr){
				
				//Do nothing, because of bad response
				if(!response.data || response.err) 
					callback([]);
				else
					callback(response.data);
				
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}

		});

	},
	//Scroll listener for main window
	scroll: function(){

		var grid = this.refs.grid;

		if(!this.state.loading && grid.scrollTop === (grid.scrollHeight - grid.offsetHeight)){

			var self = this;

			self.setState({ loading : true })

			this.loadGalleries(this.state.offset, function(galleries){

				if(!galleries) return;

				var offset = self.state.galleries.length + galleries.length;

				//Set galleries from successful response
				self.setState({
					galleries: self.state.galleries.concat(galleries),
					offset : offset,
					loading : false
				});

			});

		}

	},
	render : function(){

		var half = !this.props.withList;

		//Save all the galleries
		var galleries = <div className="row tiles">
				    		{this.state.galleries.map(function (gallery, i) {
						      	return (
						        	<GalleryCell gallery={gallery} half={half} key={i} />
						      	)
					  		})}
			    		</div>;


		//Check if a list is needed
		if(this.props.withList){

			return (
	    		<div className="container-fluid grid" onScroll={this.scroll} ref="grid" >
			    	<div className="col-md-8">{galleries}</div>
				    <SuggestionList />
		    	</div>
		    );

		}
		//No list needed
		else{

			return (
	    		<div className="container-fluid grid" onScroll={this.scroll} ref="grid">
	    			{galleries}
	    		</div>
		    );
		}
	}
});

module.exports = GalleryList;