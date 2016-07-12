import React from 'react'
import utils from 'utils'

/**
 * Global download action
 */

export default class PostEditAction extends React.Component {

	constructor(props) {
		super(props);
		this.edit = this.edit.bind(this);
	}

	render() {

		return (

			<span className="mdi mdi-pencil icon pull-right" onClick={this.edit}></span>

		);
		
	} 
	

	/**
	 * Called when PostCellAction's Edit button is clicked
	 * @param  {Object} post - Has post
	 */
	edit() {
		
		$.get('/api/gallery/get', { id: this.props.post.parent }, (response) => {
			
			if(response.err) {
				$.snackbar({ content: 'We couldn\'t find the gallery attached to this post!'});
				return;
			}

			//Send data back up
			this.props.edit(response.data);

		});
	}

}

PostEditAction.defaultProps = {
	post: {},
	edit: () => {}
}

