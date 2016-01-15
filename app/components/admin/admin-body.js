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

		this.setActiveTab = this.setActiveTab.bind(this);
		this.setActiveAssignment = this.setActiveAssignment.bind(this);
		this.setActiveGallery = this.setActiveGallery.bind(this);
		this.spliceCurrentGallery = this.spliceCurrentGallery.bind(this);

		this.updateAssignment = this.updateAssignment.bind(this);

		this.skip = this.skip.bind(this);
		this.verify = this.verify.bind(this);
		this.remove = this.remove.bind(this);
		
	}

	componentDidMount() {
		this.setActiveTab(this.props.activeTab);
	}

	componentDidUpdate(prevProps, prevState) {

	 	if( this.props.activeTab != prevProps.activeTab ) {
	 		this.setActiveTab(this.props.activeTab);

	 		if( this.props[this.props.activeTab].length == 0 ) {
	 			return;
	 		}

	 		var galleryType = this.props.activeTab.slice(0, -1);

	 		if(galleryType == 'assignment') { // Special case for assignments because they are not a gallery.

	 			this.setState({
	 				hasActiveGallery: true,
	 				activeAssignment: this.props.assignments[0],
	 				activeGallery: null,
	 				activeGalleryType: 'assignment'
	 			});

	 		} else {
		 		this.setState({
		 			hasActiveGallery: true,
		 			activeGalleryType: galleryType,
		 			activeGallery: this.props[this.props.activeTab][0],
		 			activeAssignment: null
		 		});
	 		}


	 	}

	 	if(
	 		this.state.activeGalleryType == '' &&
	 		this.props.submissions.length &&
	 		this.props.activeTab == 'submissions'
 		) {
	 		this.setActiveGallery(this.props.submissions[0]._id, 'submission');
	 	}

	}	

	setActiveTab(tab) {
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
			for(var i in this.props.submissions) {
				if(this.props.submissions[i]._id == id) {
					gallery = this.props.submissions[i];
				}
			}
		}

		if( type == 'import' ) {
			var imports = this.props.imports;
			for( var i in imports ) {
				if( imports[i]._id == id ) {
					gallery = imports[i];
				}
			}
		}

		this.setState({
			hasActiveGallery: true,
			activeGalleryType: type,
			activeGallery: gallery
		});

	}

	spliceCurrentGallery() {
		var next_index = 0;
		var propGalleryType = this.state.activeGalleryType + 's';
		for ( var index in this.props[propGalleryType] ) {
			if ( this.state.activeGallery._id == this.props[propGalleryType][index]._id ) {

				if ( index == ( this.props[ propGalleryType ].length - 1 ) )
					next_index = index - 1;
				else
					next_index = index;

				this.props[propGalleryType].splice(index, 1);
				
				break;
			}
		}

		this.setActiveGallery( this.props[propGalleryType][next_index]._id, this.state.activeGalleryType );
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

	remove(cb) {
		$.ajax({
			url: '/scripts/gallery/remove',
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify({
				id: this.state.activeGallery._id
			}),
			dataType: 'json',
			success: (result, status, xhr) => {
				cb(null, this.state.activeGallery._id);
				this.spliceCurrentGallery();
			},
			error: (xhr, status, error) => {
				cb(error)
			}
		});
	}

	skip(cb) {
		$.ajax({
			url: '/scripts/gallery/skip',
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify({
				id: this.state.activeGallery._id
			}),
			dataType: 'json',
			success: (result, status, xhr) => {
				cb(null, this.state.activeGallery._id);
				this.spliceCurrentGallery();
			},
			error: (xhr, status, error) => {
				cb(error)
			}
		});
	}

	verify(options, cb) {

		$.ajax({
			url: '/scripts/gallery/verify',
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify(options),
			dataType: 'json',
			success: (result, status, xhr) => {
				cb(null, options.id);
				this.spliceCurrentGallery();
			},
			error: (xhr, status, error) => {
				cb(error)
			}
		});

	}

	render() {

		var listItems = [];
		
		switch(this.props.activeTab) {

			case 'assignments':
				listItems = this.props.assignments.map((assignment, i) => {
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
				listItems = this.props.submissions.map((submission, i) => {
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
				listItems = this.props.imports.map((gallery, i) => {
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
				<div className="col-md-6 col-lg-7 list">
					{listItems}
				</div>
				<div className="col-md-6 col-lg-5 form-group-default admin-edit-pane">
					{editPane}
				</div>
			</div>
		);
	}
}