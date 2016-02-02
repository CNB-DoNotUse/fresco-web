import React from 'react'
import global from './../../../lib/global'
import AssignmentEditStats from './assignment-edit-stats'
import AssignmentEditMap from './assignment-edit-map'
import AssignmentEditOutlet from './assignment-edit-outlet'

export default class AssignmentEdit extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			location: {
				lat: this.props.assignment.location.geo.coordinates[1],
				lng: this.props.assignment.location.geo.coordinates[0]
			},
			radius: this.props.assignment.location.radius,
			address: this.props.assignment.location.address,
			outlet: this.props.assignment.outlet
		}

		this.updateLocation = this.updateLocation.bind(this);
		this.updateOutlet = this.updateOutlet.bind(this);

		this.revert = this.revert.bind(this);
		this.cancel = this.cancel.bind(this);
		this.clear = this.clear.bind(this);
		this.save = this.save.bind(this);
		this.hide = this.hide.bind(this);
	}

	hide() {
		$(".toggle-edit").toggleClass("toggled");
	}

	revert() {
		this.refs.title.value = this.props.assignment.title;
		this.refs.caption.value = this.props.assignment.caption;
		//Set state back to original props
		this.updateLocation({
				lat: this.props.assignment.location.geo.coordinates[1],
				lng: this.props.assignment.location.geo.coordinates[0]
			},
			this.props.assignment.location.radius,
			this.props.assignment.location.address
		);
	}

	clear() {
		this.refs.title.value = '';
		this.refs.caption.value = '';
		this.refs.expiration.value = '';
		this.setState({
			address: null,
			radius: null
		});
	}

	updateOutlet(outletId) {
		this.setState({
			outlet: outletId
		});
	}

	/**
	 * Updates state location with passed params
	 * @param  {dictionary} location Location Dictionary object {lat: x, lng: y}
	 * @param  {integer} radius   Radius that has changed
	 * @param  {string} address The address to update
	 */
	updateLocation(passedLocation, passedRadius, passedAddress) {
	    this.setState({
	        location: passedLocation || null,
	        radius: passedRadius || null,
	        address: passedAddress || null,
	    });
	}

	/**
	 * Saves the assignment from the current values in the form
	 */
	save() {

		var params = {
			id: this.props.assignment._id,
			title: this.refs.title.value,
			caption: this.refs.caption.value,
			radius: this.state.radius,
			lat: this.state.location.lat,
			lon: this.state.location.lng, //should be `lng:`
			address: this.state.address,
			outlet: this.state.outlet ? this.state.outlet._id : null,
			now: Date.now(),
			expiration_time: this.refs.expiration.value * 60 * 60 * 1000 + Date.now() //Convert to milliseconds
		};

		if(!params.outlet) {
			return $.snackbar({content: 'An assignment must have an owner!'});
		}
		if (global.isEmptyString(params.title)){
			return $.snackbar({content: 'An assignment must have a title!'});
		}
		if (global.isEmptyString(params.caption)){
			return $.snackbar({content: 'An assignment must have a caption!'});
		}
		if (params.address === ''){
			return $.snackbar({content: 'An assignment must have a location1'});
		}
		if (!global.isValidRadius(params.radius)){
			return $.snackbar({content: 'Radius must be at least 250ft!'});
		}
		if (isNaN(params.expiration_time) || params.expiration_time == 0){
			return $.snackbar({content: 'Expiration time must be a number greater than 0!'});
		}

		$.post('/api/assignment/update', params, (response) => {
			console.log(response);
		   if(response.err) {
		       $.snackbar({
		           content: 'Could not save assignment!'
		       });
		   } else {
		       $.snackbar({
		           content: 'Assignment saved!'
		       });
   		       this.props.setAssignment(response.data);
		       this.props.toggle();
		   }
		});
	}

	/**
	 * Reverts fields to original state
	 */
	cancel() {
		this.revert();
		this.props.toggle();
	}

	render() {

		var toggledText = this.props.toggled ? ' toggled' : '';

		return (

			<div>
				<div className={"dim toggle-edit " + toggledText}></div>
				<div className={"edit panel panel-default toggle-edit" + toggledText}>

					<AssignmentEditStats 
						stats={this.props.stats}
						assignment={this.props.assignment} />

					<div className="col-xs-12 col-lg-9 edit-new dialog">
						<div className="dialog-head">
							<span className="md-type-title">Edit assignment</span>
							<span className="mdi mdi-close pull-right icon toggle-edit toggler" onClick={this.cancel}></span>
						</div>
						
						<div className="dialog-foot">
							<button 
								id="story-edit-revert" 
								type="button" 
								className="btn btn-flat" 
								onClick={this.revert}>Revert changes</button>
							<button 
								id="story-edit-clear" 
								type="button" 
								className="btn btn-flat" 
								onClick={this.clear}>Clear all</button>
							<button 
								id="story-edit-save" 
								type="button" 
								className="btn btn-flat pull-right" 
								onClick={this.save}>Save</button>
							<button 
								id="story-edit-discard" 
								type="button" 
								className="btn btn-flat pull-right toggle-edit toggler" 
								onClick={this.cancel}>Discard</button>
						</div>
						
						<div className="dialog-body">
							<div className="dialog-col col-xs-12 col-md-7 form-group-default">
								<div className="dialog-row">
									<input
										type="text"
										className="form-control floating-label"
										placeholder="Title"
										title="Title"
										ref="title"
										defaultValue={this.props.assignment.title} />
								</div>
								
								<div className="dialog-row">
									<textarea
										type="text"
										className="form-control floating-label"
										placeholder="Caption"
										title="Caption"
										ref="caption"
										defaultValue={this.props.assignment.caption} />
								</div>

								<AssignmentEditOutlet 
									outlet={this.state.outlet}
									updateOutlet={this.updateOutlet}
									/>

								<div className="dialog-row">
									<input
										type="text"
										className="form-control floating-label"
										placeholder="Outlet"
										title="Outlet"
										ref="outlet"
										defaultValue={this.props.assignment.outlet.title}
										data-outletid={this.props.assignment.outlet._id} />
								</div>
							</div>
							<div className="dialog-col col-xs-12 col-md-5">
								<div className="dialog-row map-group">
									<AssignmentEditMap
									    location={this.state.location}
									    radius={this.state.radius}
									    address={this.state.address}
									    updateLocation={this.updateLocation} />
								</div>
								
								<div className="dialog-row">
									<div className="form-group-default">
										<input
											ref="expiration"
											type="text"
											className="form-control floating-label"
											data-hint="hours from now"
											placeholder="Expiration time"
											defaultValue={global.hoursToExpiration(this.props.assignment.expiration_time)} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

AssignmentEdit.defaultProps = {
	toggled: false
}
