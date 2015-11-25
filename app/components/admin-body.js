import React from 'react'
import SubmissionListItem from './admin-submission-list-item'
import SubmissionEdit from './admin-submission-edit'

export default class AdminBody extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			hasActiveSubmission: false,
			activeSubmission: {}
		}

		this.setActiveTab = this.setActiveTab.bind(this);
		this.setActiveSubmission = this.setActiveSubmission.bind(this);
		this.spliceCurrentSubmission = this.spliceCurrentSubmission.bind(this);

		this.skip = this.skip.bind(this);
		this.verify = this.verify.bind(this);
		this.remove = this.remove.bind(this);
		
	}

	componentDidMount() {

		this.setActiveTab(this.props.activeTab);

	}

	componentDidUpdate(prevProps, prevState) {  
	 	if(this.props.activeTab != prevProps.activeTab) {
	 		this.setActiveTab(this.props.activeTab);
	 	}
	 	if(prevProps.submissions.length == 0 && this.props.submissions.length && !this.state.hasActiveSubmission) {
	 		this.setActiveSubmission(this.props.submissions[0]._id);
	 	}
	}	

	setActiveTab(tab) {
      $('.admin.tabs .tab').removeClass('toggled');
      $('.tab-' + tab).addClass('toggled');
	}

	setActiveSubmission(id) {
		if(this.state.activeSubmission._id == id) return; 

		var submission = {};

		for(var i in this.props.submissions) {
			if(this.props.submissions[i]._id == id) {
				submission = this.props.submissions[i];
			}
		}

		this.setState({
			hasActiveSubmission: true,
			activeSubmission: submission
		});

	}

	spliceCurrentSubmission() {
		var next_index = 0;
		for (var index in this.props.submissions) {
			if (this.state.activeSubmission._id == this.props.submissions[index]._id) {

				if (index == (this.props.submissions.length - 1))
					next_index = index - 1;
				else
					next_index = index;
				
				if(this.props.submissions.length == 1) {
					this.props.submissions = []
				} else {
					this.props.submissions.splice(index, 1);
				}

				break;
			}
		}
		this.setActiveSubmission(this.props.submissions[next_index]._id);
	}

	remove(cb) {
		$.ajax({
			url: '/scripts/gallery/remove',
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify({
				id: this.state.activeSubmission._id
			}),
			dataType: 'json',
			success: (result, status, xhr) => {
				cb(null, this.state.activeSubmission._id);
				this.spliceCurrentSubmission();
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
				id: this.state.activeSubmission._id
			}),
			dataType: 'json',
			success: (result, status, xhr) => {
				cb(null, this.state.activeSubmission._id);
				this.spliceCurrentSubmission();
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
				this.spliceCurrentSubmission();
			},
			error: (xhr, status, error) => {
				cb(error)
			}
		});

	}

	render() {
		var submissionsList = this.props.submissions.map((submission, i) => {
			return <SubmissionListItem
						submission={submission}
						key={i}
						active={this.state.activeSubmission._id == submission._id}
						setActiveSubmission={this.setActiveSubmission} />
		});

		return (
			<div className="container-fluid admin tabs">
				<div className="tab tab-submissions">
					<div className="col-md-6 col-lg-7 list">
						{submissionsList}
					</div>
					<div className="col-md-6 col-lg-5 form-group-default">
						<SubmissionEdit
						hasActiveSubmission={this.state.hasActiveSubmission}
						activeSubmission={this.state.activeSubmission}
						skip={this.skip}
						verify={this.verify}
						remove={this.remove} />
					</div>
				</div>
			</div>
		);
	}
}