<<<<<<< HEAD
import React from 'react'
import Sidebar from '../components/sidebar'
=======
var isNode = require('detect-node'),
	React = require('react'),
	ReactDOM = require('react-dom'),
	global = require('../../lib/global'),
    Sidebar = require('../components/sidebar.js');


/**
 * Gallery Detail Parent Object
 */

var App = React.createClass({

	displayName: 'App',

	render: function(){
>>>>>>> 20c1f33910a609075b9407a1fddd4b04ccbafcbc

export default class App extends React.Component {
	render() {
		return (
			<div>
				<div className="dim toggle-drawer toggler"></div>
				<div className="container-fluid">
					<Sidebar user={this.props.user} />
					<div className="col-md-12 col-lg-10">
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}