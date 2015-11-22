import React from 'react'
import Dropdown from './global/dropdown'

/** //

Description : Top for admin page

// **/

export default class TopBarAdmin extends React.Component {

	constructor(props) {
		super(props);
		this.setTab = this.setTab.bind(this);
	}

	setTab(e) {
		var tab = e.target.dataset.tab;
		this.props.setTab(tab);
	}

	componentDidMount() {
 		$('[data-tab="' + this.props.activeTab + '"]').addClass('toggled');     
	}

	componentWillUpdate(nextProps, nextState) {
	 	if(this.props.activeTab != nextProps.activeTab) {
	 		$('.tab, .tab-admin').removeClass('toggled');
	 		$('[data-tab="' + nextProps.activeTab + '"]').addClass('toggled');
	 	}
	}

	componentDidUpdate(prevProps, prevState) {
	 	$.material.init();
	}

	render() {

		return (
			<nav className="navbar navbar-fixed-top navbar-default">
				<input type="file" className="upload-import-files" style={{position: "absolute", top: "-100px"}} accept="image/*,video/*,video/mp4" multiple />
				<div className="dim transparent toggle-drop toggler"></div>
				<button type="button" className="icon-button toggle-drawer toggler hidden-lg">
					<span className="mdi mdi-menu icon"></span>
				</button>
				<button type="button" className="icon-button hidden-xs upload-import">
					<span className="mdi mdi-upload icon"></span>
				</button>
				<div className="form-group-default">
					<input type="text" className="form-control twitter-import" placeholder="Link" />
				</div>
				<div className="tab-control">
					<button className="btn btn-flat tab-admin" data-tab="assignments" onClick={this.setTab}>
						Assignments
					</button>
					<button className="btn btn-flat tab-admin"  data-tab="submissions" onClick={this.setTab}>
						Submissions
					</button>
					<button className="btn btn-flat tab-admin" data-tab="imports" onClick={this.setTab}>
						Imports
					</button>
				</div>
				<li className="drop no-border pull-right hidden-xs" style={{opacity: 0}}>
					<button className="toggle-drop md-type-subhead">
						<span className="mdi mdi-settings icon"></span><span className="mdi mdi-menu-down icon"></span>
					</button>
					<div className="drop-menu panel panel-default">
						<div className="toggle-drop toggler md-type-subhead">Settings<span className="mdi mdi-menu-up icon pull-right"></span></div>
						<div className="drop-body">
							<ul className="md-type-subhead">
								<li>Import alternate</li>
								<li>Import alternate</li>
							</ul>
						</div>
					</div>
				</li>
			</nav>
		);

	}

}