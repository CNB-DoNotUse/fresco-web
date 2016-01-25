import React from 'react'
import global from '../../../lib/global'

/**
 * Generic Dropdown Element
 * @param  {function} onSelected A function called wtih the user's selection
 */

export default class Dropdown extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			locations: []
		}

		this.toggle = this.toggle.bind(this);
		this.addLocation = this.addLocation.bind(this);
	}

	componentWillMount() {
		//Load intial locations
	    this.loadLocations();  
	}

	/**
	 * Adds the curret prop location to the outlet locations
	 */
	addLocation() {
		console.log('Test');
	}

	/**
	 * Called whenever the master button is clicked
	 */
	toggle(e) {
		//Make sure it's the toggle and not one of the icons
		if(e.target.className === 'mdi mdi-playlist-plus') return;

		var drop = this.refs.drop,
			dim = document.getElementById('platform-dim');
			
		if(drop.className.indexOf('active') == -1) {
			drop.className += ' active';
			dim.className += ' toggled';
		} else{
			drop.className = drop.className.replace(/\bactive\b/,'');
			dim.className = dim.className.replace(/\btoggled\b/,'');
		}
	}
	
	/**
	 * Loads locations for the outlet
	 */
	loadLocations(){

		//`since` is the last time they've seen the locations page,
		//eitehr grabbed from location storage, or defaults to the current timestamp
		var self = this,
			since = window.sessionStorage.location_since ? JSON.parse(window.sessionStorage.location_since) : {};

		$.ajax({
			url: '/api/outlet/location/list?since=' + encodeURIComponent(JSON.stringify(since)),
			method: 'GET',
			success: function(response){

				if (response.err || !response.data)
					return this.error(null, null, response.err);
				
				//Loop through and add all the `since` data from the response
				response.data.forEach(function(location){
					if (!since[location._id])
						since[location._id] = Date.now();
				});

				//Update state
				self.setState({ locations: response.data });
			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error)});
			}
		});
	}
	

	render() {

		var locations = this.state.locations.map((location, i) => {

			var unseenCount = location.unseen_count || 0;

			unseenCount = global.isPlural(unseenCount) ? unseenCount + ' unseen items' : unseenCount + ' unseen item';
			
			return ( 
				<li className="location-item" key={i}>
					<a href={"/location/" + location._id}>
							<span className="area">{location.title}</span>
							<span className="count">{unseenCount}</span>
					</a>
				</li> 
			);

		});

		var dropdownButton = <div className="toggle" ref="toggle_button" onClick={this.toggle}>
								<span>SAVED</span>
								
								<span className="mdi mdi-menu-down"></span>
								
								<a href="/outlet/settings">
									<span className="mdi mdi-settings"></span>
								</a>

								<span className="mdi mdi-playlist-plus" onClick={this.addLocation}></span>
							</div>

		var dropdownList = <ul className="list">
								{locations}
							</ul>
					
		return (
			<div className="nav-dropdown location-dropdown pull-right" ref="drop">
				{dropdownButton}
				{dropdownList}
			</div>
		);
	}
}

Dropdown.defaultProps = {
	inList: false
}