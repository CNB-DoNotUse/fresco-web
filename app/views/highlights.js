import React from 'react'
import ReactDom from 'react-dom'
import App from './app.js'
import GalleryList from './../components/gallery-list.js'
import TopBar from './../components/topbar.js'
	
/**
 * Highlights Parent Object (composed of GalleryList and Navbar) 
 * Half = False, to render at large size instead of half size
 */

class Highlights extends React.Component {
	render() {
		return (
			<App user={this.props.user}>
				<TopBar title="Highlights" />
				<GalleryList 
					withList={true} 
					highlighted={true} />
			</App>
		);
	}
}

ReactDom.render(
	<Highlights user={window.__initialProps__.user} />,
	document.getElementById('app')
)