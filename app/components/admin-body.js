import React from 'react'
import SubmissionListItem from './admin-submission-list-item'


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
      $('.admin.tabs .tab').removeClass('toggled');
      $('.tab-' + tab).addClass('toggled');
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
							<div className="dialog-foot">
								<button type="button" className="btn btn-flat submission-revert" disabled>Revert changes</button>
								<button type="button" className="btn btn-flat pull-right submission-verify" disabled>Verify</button>
								<button type="button" className="btn btn-flat pull-right submission-skip" disabled>Skip</button>
								<button type="button" className="btn btn-flat pull-right submission-delete" disabled>Delete</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}