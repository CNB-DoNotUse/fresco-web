import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import GalleryList from './../components/global/gallery-list.js'
import TopBar from './../components/topbar'

/**
 * Galleries Parent Object (composed of GalleryList and Navbar) 
 * Half = False, to render at large size instead of half size
 */

 class Galleries extends React.Component {

 	constructor(props) {
 		super(props);

 		this.state = {
 			verifiedToggle: true,
 		}
 		this.onVerifiedToggled = this.onVerifiedToggled.bind(this);
 	}

 	onVerifiedToggled(toggle) {
 		this.setState({
 			verifiedToggle: toggle
 		});
 	}

	render() {
		return (
			<App user={this.props.user}>
				<TopBar 
					title="Galleries"
					timeToggle={true}
					rank={this.props.user.rank}
					verifiedToggle={true}
					updateSort={this.updateSort}
					onVerifiedToggled={this.onVerifiedToggled} />
					
				<GalleryList 
					withList={false}
					highlighted={false}
					onlyVerified={this.state.verifiedToggle} />
			</App>
		)
	}

}

ReactDOM.render(
  <Galleries 
  	user={window.__initialProps__.user} />,
  document.getElementById('app')
);