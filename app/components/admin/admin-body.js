import React from 'react'
import GalleryListItem from './admin-gallery-list-item'
import AssignmentListItem from './admin-assignment-list-item'
import AdminGalleryEdit from './admin-gallery-edit'
import AdminAssignmentEdit from './admin-assignment-edit'

export default class AdminBody extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			hasActiveGallery: false,
			activeGalleryType: '',
			activeGallery: {},
			activeAssignment: {}
		}

		this.setActiveAssignment = this.setActiveAssignment.bind(this);
		this.setActiveGallery = this.setActiveGallery.bind(this);

		this.updateAssignment = this.updateAssignment.bind(this);

		this.skip = this.skip.bind(this);
		this.verify = this.verify.bind(this);
		this.remove = this.remove.bind(this);

		this.spliceGallery = this.spliceGallery.bind(this);

		this.scroll = this.scroll.bind(this);

	}

	componentDidUpdate(prevProps, prevState) {

 		var galleryType = this.props.activeTab.slice(0, -1), self = this;

		// If tab changed
	 	if( this.props.activeTab != prevProps.activeTab ) {

	 		// If activeTab has submissions / assignments object, but no actual submissions / assignments, then hide admin panes.
	 		if( this.props[this.props.activeTab] && this.props[this.props.activeTab].length == 0 ) {
	 			this.setState({
	 				hasActiveGallery: false,
	 				activeAssignment: null,
	 				activeGallery: null,
	 				activeGalleryType: ''
	 			});
	 			return;
	 		}


	 		if(galleryType == 'assignment') { // Special case for assignments because they are not a gallery.

	 			this.setState({
	 				hasActiveGallery: true,
	 				activeAssignment: this.props.assignments[0],
	 				activeGallery: null,
	 				activeGalleryType: 'assignment'
	 			});

	 		} else {
	 			setFirstGalleryActive();
	 		}

	 	}

	 	// If didn't have content before, set active to the first in current.
		if(this.props[this.props.activeTab] && this.props[this.props.activeTab].length && prevProps[this.props.activeTab].length == 0) {
			setFirstGalleryActive();
		}

		function setFirstGalleryActive() {

			if(!self.props[self.props.activeTab]) return;

			let updatedData = {
	 			hasActiveGallery: true,
	 			activeGalleryType: galleryType,
	 			activeAssignment: null
	 		};

	 		let activeField = galleryType == 'assignment' ? 'activeAssignment' : 'activeGallery';

 			updatedData[activeField] = self.props[self.props.activeTab][0];
 			
	 		self.setState(updatedData);
		}


	}

	setActiveAssignment(id) {

		if(id == null) {
			this.setState({
				hasActiveGallery: false,
				activeAssignment: false
			});

			return;
		}

		for (var a in this.props.assignments) {
			if(this.props.assignments[a]._id == id) {
				this.setState({
					hasActiveGallery: true,
					activeAssignment: this.props.assignments[a]
				});
				break;
			}
		}
	}

	setActiveGallery(id, type) {

		if( this.state.activeGallery._id == id ) return;
		var gallery = {};

		if ( type == 'submission' ) {
			var submissions = this.props.submissions;
			for(var i in submissions) {
				if(submissions[i]._id == id) {
					gallery = submissions[i];
					break;
				}
			}
		}

		if( type == 'import' ) {
			var imports = this.props.imports;
			for( var i in imports ) {
				if( imports[i]._id == id ) {
					gallery = imports[i];
					break;
				}
			}
		}

 		this.setState({
 			hasActiveGallery: gallery.hasOwnProperty('_id'),
 			activeGalleryType: type,
 			activeGallery: gallery,
 			activeAssignment: null
 		});

	}

	updateAssignment(id) {
		var next_index = 0;
		var propGalleryType = this.state.activeGalleryType + 's';
		var assignments = this.props[propGalleryType];
		for (var a in assignments) {
			if(id == assignments[a]._id) {
				if (a == (assignments.length - 1))
					next_index = a - 1;
				else
					next_index = a;
				assignments.splice(a, 1);
			}
		}

		this.setActiveAssignment(assignments ? assignments[next_index] ? assignments[next_index]._id : null : null);
	}

	spliceGallery(cb) {
	
		let propGalleryType = this.state.activeGalleryType + 's';

		this.props.spliceGallery({ type: propGalleryType, gallery: this.state.activeGallery._id }, (err, nextGallery) => {

			if(this.props[propGalleryType].length) {
				this.setActiveGallery(this.props[propGalleryType][nextGallery]._id, this.state.activeGalleryType);
			}

			cb();
		});
	}

	remove(cb) {

		$.ajax({
			url: '/api/gallery/remove',
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify({
				id: this.state.activeGallery._id
			}),
			dataType: 'json',
			success: (result, status, xhr) => {
				this.spliceGallery(() => {
					cb(null, this.state.activeGallery._id);
				})
			},
			error: (xhr, status, error) => {
				cb(error)
			}
		});
	}

	skip(cb) {
		$.ajax({
			url: '/api/gallery/update',
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify({
				id: this.state.activeGallery._id,
				rated: 1,
				visibility: 0
			}),
			dataType: 'json',
			success: (result, status, xhr) => {
				this.spliceGallery(() => {
					cb(null, this.state.activeGallery._id);
				})
			},
			error: (xhr, status, error) => {
				cb(error)
			}
		});
	}

	verify(options, cb) {

		$.ajax({
			url: '/api/gallery/update',
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify(options),
			dataType: 'json',
			success: (result, status, xhr) => {
				if(result.err) {
					return cb(result.err);
				}
				
				this.spliceGallery(() => {
					cb(null, options.id);
				})
			},
			error: (xhr, status, error) => {
				cb(error)
			}
		});

	}

	scroll(e) {
		var target = e.target;
		if(target.scrollTop == target.scrollHeight - target.offsetHeight) {
			var items = this.props[this.props.activeTab];
			if(!items) return;

			this.props.getData(items[items.length - 1]._id, {concat: true, tab: this.state.activeGalleryType + 's'}, (data) => {});
		}
	}

	render() {
		
		function sortListItem(a, b) {
			return a.time_created > b.time_created ? -1 : a.time_created < b.time_created ? 1 : 0;
		}

		switch(this.props.activeTab) {

			case 'assignments':

				if (!this.state.activeAssignment || !this.state.hasActiveGallery || !this.props.assignments.length) break;

				var listItems = this.props.assignments.sort(sortListItem).map((assignment, i) => {
								return <AssignmentListItem
											type="assignment"
											assignment={assignment}
											key={i}
											active={this.state.activeAssignment._id == assignment._id}
											setActiveAssignment={this.setActiveAssignment} />
							});

				if(this.state.activeAssignment && this.state.activeAssignment._id) {
					var editPane = <AdminAssignmentEdit
									hasActiveGallery={this.state.hasActiveGallery}
									activeGalleryType={this.state.activeGalleryType}
									assignment={this.state.activeAssignment}
									updateAssignment={this.updateAssignment} />
				}

			break;

			case 'submissions':

				if (!this.state.activeGallery|| !this.state.hasActiveGallery || !this.props.submissions.length) break;

				var listItems = this.props.submissions.sort(sortListItem).map((submission, i) => {
								return <GalleryListItem
											type="submission"
											gallery={submission}
											key={i}
											active={this.state.activeGallery._id == submission._id}
											setActiveGallery={this.setActiveGallery} />
							});

				var editPane = <AdminGalleryEdit
								hasActiveGallery={this.state.hasActiveGallery}
								activeGalleryType={this.state.activeGalleryType}
								gallery={this.state.activeGallery}
								skip={this.skip}
								verify={this.verify}
								remove={this.remove} />
			break;

			case 'imports':

				if (!this.state.activeGallery || !this.state.hasActiveGallery || !this.props.imports.length) {
					break;
				}

				var listItems = this.props.imports.sort(sortListItem).map((gallery, i) => {
								return <GalleryListItem
											type="import"
											gallery={gallery}
											key={i}
											active={this.state.activeGallery._id == gallery._id}
											setActiveGallery={this.setActiveGallery} />
							});

				var editPane = <AdminGalleryEdit
								hasActiveGallery={this.state.hasActiveGallery}
								activeGalleryType={this.state.activeGalleryType}
								gallery={this.state.activeGallery}
								skip={this.skip}
								verify={this.verify}
								remove={this.remove} />
			break;

		}

		return (
			<div className="container-fluid admin">
				<div className="col-md-6 col-lg-7 list" onScroll={this.scroll}>
					{listItems}
				</div>
				<div className="col-md-6 col-lg-5 form-group-default admin-edit-pane">
					{editPane}
				</div>
			</div>
		);
	}
}
