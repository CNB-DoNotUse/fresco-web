import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import GalleryList from './../components/gallery-list.js'
import TopBar from './../components/topbar.js'

/**
 * Galleries Parent Object (composed of GalleryList and Navbar) 
 * Half = False, to render at large size instead of half size
 */

 class Galleries extends React.Component {

	render() {
		return (
			<App user={this.props.user}>
				<TopBar 
					title="Galleries"
					timeToggle={true} />
				<GalleryList 
					withList={false}
					highlighted={false} />
			</App>
		)
	}

}

ReactDOM.render(
  <Galleries 
  	user={window.__initialProps__.user} />,
  document.getElementById('app')
);
