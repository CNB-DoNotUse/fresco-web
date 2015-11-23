import React from 'react'
import ReactDOM from 'react-dom'
import TopBar from './../components/topbar'
import App from './app'
import DispatchMap from './../components/dispatch-map'

/**
 * Gallery Detail Parent Object, made of a side column and PostList
 */

class Dispatch extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		return (
		<App user={this.props.user}>
			<TopBar 
				title={this.props.title}
				location={true} />
			<DispatchMap
				user={this.props.user} />
		</App>
		);

	}
 }



ReactDOM.render(
	<Dispatch 
		user={window.__initialProps__.user} 
		title={window.__initialProps__.title} />,
	document.getElementById('app')
);