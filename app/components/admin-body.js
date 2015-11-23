import React from 'react'
import SubmissionListItem from './admin-submission-list-item'
import Tag from './editing/tag'

export default class AdminBody extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			hasActiveSubmission: false,
			activeSubmission: {},
			newTags: []
		}


		this.setActiveTab = this.setActiveTab.bind(this);
		this.setActiveSubmission = this.setActiveSubmission.bind(this);
		this.handleChangeCaption = this.handleChangeCaption.bind(this);
		this.submissionTagsInputKeyDown = this.submissionTagsInputKeyDown.bind(this);
		this.removeSubmissionTag = this.removeSubmissionTag.bind(this);
	}

	componentDidMount() {

		this.setActiveTab(this.props.activeTab);

		this.refs['submission-revert'].disabled = true;
		this.refs['submission-verify'].disabled = true;
		this.refs['submission-skip'].disabled = true;
		this.refs['submission-delete'].disabled = true;
	}

	componentDidUpdate(prevProps, prevState) {

		if(this.state.activeSubmission._id != prevState.activeSubmission._id) {
			this.refs['submission-caption'].value = this.state.activeSubmission.posts[0].caption;

			if(this.state.hasActiveSubmission) {
				this.refs['submission-caption'].value = this.state.activeSubmission.posts[0].caption;
			}


			$(this.refs['submission-byline']).removeClass('empty');
			$(this.refs['submission-caption']).removeClass('empty');

			this.refs['tags-input'].value = '';

		}

	 	if(this.props.activeTab != prevProps.activeTab) {
	 		this.setActiveTab(this.props.activeTab);
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

		this.refs['submission-revert'].disabled = false;
		this.refs['submission-verify'].disabled = false;
		this.refs['submission-skip'].disabled = false;
		this.refs['submission-delete'].disabled = false;

	}

	handleChangeCaption(e) {
		this.setState({
			editedCaption: e.target.value
		});

		this.refs['submission-caption'].value = e.target.value;

	}

	submissionTagsInputKeyDown(e) {
		if(e.keyCode == 13) {
			var text = e.target.value.replace(/[^a-z0-9.]+/i, '');

			if(text.length >= 3) {

				var newTags = this.state.newTags;

				if(newTags.indexOf(text) != -1) return;
				if(this.state.activeSubmission.tags.indexOf(text) != -1) return;

				newTags.push(text);

				this.setState({
					newTags: newTags
				});

				e.target.value = '';
			}
		}
	}

	removeSubmissionTag(tag) {
		var tags = this.state.activeSubmission.tags;
		if(tags.indexOf(tag) != -1) {
			var activeSubmission = this.state.activeSubmission;
			activeSubmission.tags.splice(tags.indexOf(tag), 1);
			this.setState({
				activeSubmission: activeSubmission
			})
		}

		var newTags = this.state.newTags;

		if(newTags.indexOf(tag) != -1) {
			console.log(newTags);
			console.log('deleting', tag);
			newTags.splice(newTags.indexOf(tag), 1);
			this.setState({
				newTags: newTags
			});
			console.log(newTags);
		}

	}

	render() {
		var submissionsList = this.props.submissions.map((submission, i) => {
			return <SubmissionListItem
						submission={submission}
						key={i}
						active={this.state.activeSubmission._id == submission._id}
						setActiveSubmission={this.setActiveSubmission} />
		});

		var activeSubmission = this.state.activeSubmission;

		if(this.state.hasActiveSubmission) {
			var submissionImages = activeSubmission.posts.map((post, i) => {
				if(post.video) {
					return (
						<video width="100%" height="100%" data-id={post._id} controls key={i}>
							<source src={post.video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4')} type="video/mp4" />
							Your browser does not support the video tag.\
						</video>
					)
				}
				return (
					<img className="img-responsive" src={formatImg(post.image, 'medium')} data-id={post._id}  key={i} />
				);
			});

			var submissionTags = activeSubmission.tags.map((tag, i) => {
				return <Tag text={tag} onClick={this.removeSubmissionTag.bind(null, tag)} key={i} />
			});

			var newSubmissionTags = this.state.newTags.map((tag, i) => {
				return <Tag text={tag} onClick={this.removeSubmissionTag.bind(null, tag)} key={this.state.activeSubmission.tags.length + i} />
			});

		}

		return (
			<div className="container-fluid admin tabs">
				<div className="tab tab-submissions">
					<div className="col-md-6 col-lg-7 list">
						{submissionsList}
					</div>
					<div className="col-md-6 col-lg-5 form-group-default">
						<div className="dialog">
							<div className="dialog-body" style={{visibility: this.state.hasActiveSubmission ? 'visible' : 'hidden'}}>
								<div className="frick submission-images">{submissionImages}</div>
								<input
									type="text"
									className="form-control floating-label submission-byline"
									placeholder="Byline"
									value={this.state.hasActiveSubmission ? this.state.activeSubmission.posts[0].byline : ''}
									ref="submission-byline" disabled  />
								<textarea
									type="text"
									className="form-control floating-label submission-caption"
									placeholder="Caption"
									onChange={this.handleChangeCaption}
									ref="submission-caption"></textarea>
								<div className="split chips">
									<div className="split-cell">
										<input
											type="text"
											className="form-control floating-label tags-input"
											placeholder="Tags"
											onKeyDown={this.submissionTagsInputKeyDown}
											ref="tags-input" />
										<ul className="chips tags submission-tags">
											{submissionTags}
											{newSubmissionTags}
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
								<button type="button" className="btn btn-flat submission-revert" ref="submission-revert">Revert changes</button>
								<button type="button" className="btn btn-flat pull-right submission-verify" ref="submission-verify">Verify</button>
								<button type="button" className="btn btn-flat pull-right submission-skip" ref="submission-skip">Skip</button>
								<button type="button" className="btn btn-flat pull-right submission-delete" ref="submission-delete">Delete</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}