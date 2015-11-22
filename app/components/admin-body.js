import React from 'react'


class SubmissionListItem extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		var submission = this.props.submission;

		if(submission.owner) {
			var subOwnerText =
				<p className="md-type-body2">
					<a href={"/user/" + submission.owner._id} target="_blank">
						{(submission.owner ? submission.owner.firstname : '') + ' ' + (submission.owner ? submission.owner.lastname : '')}
					</a>
				</p>
		}

		var location = 'No Location';
							
		for (var i in submission.posts){
			if (submission.posts[i].location.address){
				location = sub.posts[i].location.address;
				break;
			}
		}

		var assignmentText =
			<div>
				<p className="md-type-body1">{location}</p>
			</div>

		if(submission.assignment) {
			assignmentText = <div><p className="md-type-body2 assignment-link">asdf</p></div>
		}


		return (
			<div className={"list-item" + (this.props.active ? ' active' : '')} onClick={this.props.setActiveSubmission.bind(null, submission._id)}>
				<div>
					<a href={"/gallery/" + submission._id} target="_blank">
						<img
							className="img-circle"
							style={{width: '40px', height: '40px'}}
							src={formatImg(submission.posts[0].image, 'small')} />{ /* screen.css got rid of the image style */ }
					</a>
				</div>
				<div className="flexy">
					<p className="md-type-body1">{submission.caption || ''}</p>
				</div>
				<div>
					{subOwnerText}
				</div>
					{assignmentText}
				<div>
					<p className="md-type-body1">{timestampToDate(submission.time_created)}</p>
				</div>
			</div>
		);
	}
}

export default class AdminBody extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			activeSubmission: null
		}

		this.setActiveTab = this.setActiveTab.bind(this);
		this.setActiveSubmission = this.setActiveSubmission.bind(this);
	}

	componentDidMount() {
      this.setActiveTab(this.props.activeTab);
	}

	componentDidUpdate(prevProps, prevState) {
	 	if(this.props.activeTab != prevProps.activeTab) {
	 		this.setActiveTab(this.props.activeTab);
	 	}
	}

	setActiveTab(tab) {
		switch(tab) {
			case 'submissions':
		      $('.admin.tabs .tab').removeClass('toggled');
		      $('.tab-' + tab).addClass('toggled');
		      break;
		}
	}

	setActiveSubmission(id) {
		if(this.state.activeSubmission == id) return; 
		this.setState({
			activeSubmission: id
		});
	}

	render() {
		var submissionsList = this.props.submissions.map((submission, i) => {
			return <SubmissionListItem
						submission={submission}
						key={i}
						active={this.state.activeSubmission == submission._id}
						setActiveSubmission={this.setActiveSubmission} />
		});

		return (
			<div className="container-fluid admin tabs">
				<div className="tab tab-submissions">
					<div className="col-md-6 col-lg-7 list">
						{submissionsList}
					</div>
					<div className="col-md-6 col-lg-5 form-group-default">
						<div className="dialog">
							<div className="dialog-foot">
								<button type="button" className="btn btn-flat submission-revert" disabled>Revert changes</button>
								<button type="button" className="btn btn-flat pull-right submission-verify" disabled>Verify</button>
								<button type="button" className="btn btn-flat pull-right submission-skip" disabled>Skip</button>
								<button type="button" className="btn btn-flat pull-right submission-delete" disabled>Delete</button>
							</div>
							<div className="dialog-body" style={{visibility: "hidden"}}>
								<div className="frick submission-images"></div>
								<input type="text" className="form-control floating-label submission-byline" placeholder="Byline" disabled />
								<textarea type="text" className="form-control floating-label submission-caption" placeholder="Caption"></textarea>
								<div className="split chips">
									<div className="split-cell">
										<input type="text" className="form-control floating-label tags-input" placeholder="Tags" />
										<ul className="chips tags submission-tags">
										</ul>
									</div>
									<div className="split-cell">
										<span className="md-type-body2">Suggested tags</span>
										<ul className="chips submission-suggested-tags">
										</ul>
									</div>
								</div>
								<div className="dialog-row split chips">
									<div className="split-cell">
										<input type="text" className="form-control floating-label submission-stories-input" placeholder="Stories" />
										<ul className="chips submission-stories"></ul>
									</div>
									<div className="split-cell">
										<span className="md-type-body2">Suggested stories</span>
										<ul className="chips submission-suggested-stories"></ul>
									</div>
								</div>
								<div className="map-group">
									<div className="form-group-default">
										<input type="text" className="form-control floating-label google-autocomplete submission-location" placeholder=" " disabled />
									</div>
									<div className="submission-map-container">
										Just pretend there is a map here ok
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