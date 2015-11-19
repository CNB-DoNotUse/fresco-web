var React = require('react'),
	ReactDOM = require('react-dom');

/**
 * Global download action
 */

var DownloadAction = React.createClass({

	displayName: 'DownloadAction',

	render: function(){

		return(

			<span className="mdi mdi-download icon pull-right" onClick={this.download}></span>

		);
		
	},
	//Called whenever the purhcase icon is selected
	download: function(event){

		console.log('test');

		if(!this.props.post){
			
			$.snackbar({
				content:'There was an error downloading this post', 
				timeout:0
			});

			return;
		}
		
		var href = this.props.post.video ?
					this.props.post.video.replace('videos/','videos/mp4/').replace('.m3u8','.mp4')
					:
					this.props.post.image;

		var link = document.createElement("a");

	    link.download = Date.now() + '.' + href.split('.').pop();
	    link.href = href;
	    link.click();
		
	},

});

module.exports = DownloadAction;
