import React from 'react'
import ReactDom from 'react-dom'
import App from './app'
import GalleryList from './../components/global/gallery-list'
import TopBar from './../components/topbar'

/**
 * Highlights Parent Object (composed of GalleryList and Navbar)
 * Half = False, to render at large size instead of half size
 */

class Highlights extends React.Component {
	render() {
		return (
			<App user={this.props.user} page="highlights">
				<TopBar title="Highlights" timeToggle />

				<GalleryList withList highlighted />
			</App>
		);
	}
}

ReactDom.render(
	<Highlights user={window.__initialProps__.user} />,
	document.getElementById('app')
)
