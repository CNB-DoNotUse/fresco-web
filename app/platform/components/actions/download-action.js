import React from 'react';

/**
 * Global download action
 */

export default class DownloadAction extends React.Component {

	constructor(props) {
		super(props);

		this.download = this.download.bind(this);
	}

	render() {
		return (
			<span className="mdi mdi-download icon pull-right" onClick={this.download}></span>
		)
	} 

	//Called whenever the purhcase icon is selected
	download(event) {

		//Override click event for browsers that do not support it
		HTMLElement.prototype.click = function() {
			var evt = this.ownerDocument.createEvent('MouseEvents');
			evt.initMouseEvent('click', true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
			this.dispatchEvent(evt);
		}

		if (!this.props.post) {

			$.snackbar({
				content: 'We couldn\'t find this post!',
				timeout: 0
			});

			return;
		}

		var href = this.props.post.video ?
			this.props.post.video.replace('videos/', 'videos/mp4/').replace('.m3u8', '.mp4') :
			this.props.post.image;

		var link = document.createElement("a");

		link.download = Date.now() + '.' + href.split('.').pop();
		link.href = href;
		link.click();
	}

}
