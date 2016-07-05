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

class GalleryList extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			galleries: [],
			loading : false,
			tags :[]
		}

		this.loadGalleries = this.loadGalleries.bind(this);
		this.loadInitalGalleries = this.loadInitalGalleries.bind(this);
		this.scroll = this.scroll.bind(this);
	}

	componentDidMount() {
		this.loadInitalGalleries();
	}

	componentDidUpdate(prevProps, prevState) {
		if(prevProps.onlyVerified !== this.props.onlyVerified) {
			this.setState({
				galleries: []
			});

	      	this.loadInitalGalleries();

	      	this.refs.grid.scrollTop = 0;
		}
	}

	loadInitalGalleries() {
		this.loadGalleries(null, (galleries) => {
			//Set galleries from successful response
			this.setState({ galleries });
		});
	}

	// Returns array of galleries with offset and callback
	loadGalleries(last, callback) {
        const { highlighted, onlyVerified, sort } = this.props;
        let endpoint;
        let	params = {
            limit: 20,
            last,
            sort,
            skipped: true,
            verified: true,
            highlighted: true,
        };

        if(highlighted) {
            endpoint = 'gallery/highlights';
        } else {
            endpoint = 'gallery/list';

            if(onlyVerified){
                params = Object.assign({}, params, {skipped: false, verified: true, highlighted: true});
            }
		}

		$.ajax({
			url: '/api/' + endpoint,
			type: 'GET',
			data: params,
			dataType: 'json',
			success: (data, status) => {
                if (status === 'success') {
                    callback(data);
                }
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

            const lastGallery = this.state.galleries[this.state.galleries.length - 1];
			this.loadGalleries(lastGallery.id, (galleries) => {
				if(!galleries) return;

				//Set galleries from successful response
				this.setState({
					galleries: this.state.galleries.concat(galleries),
					loading : false
				});

			});
		}
	}

	render() {
		var half = !this.props.withList;

		//Save all the galleries
        var galleries = (
            <div className="row tiles">
                {this.state.galleries.map((gallery, i) => (
                    <GalleryCell gallery={gallery} half={half} key={i} />
                ))}
            </div>
        );

		//Check if a list is needed
		if(!half) {
			return (
	    		<div
	    			className="container-fluid grid"
	    			onScroll={this.scroll}
	    			ref="grid" >
			    	<div className="col-md-8">{galleries}</div>

				    <SuggestionList />
		    	</div>
		    );
		}
		//No list needed
		else {

			return (
	    		<div
	    			className="container-fluid grid"
	    			onScroll={this.scroll}
	    			ref="grid"
	    		>
	    			{galleries}
	    		</div>
		    );
		}
	}
}

GalleryList.defaultProps = {
	onlyVerified: true,
};

export default GalleryList;
