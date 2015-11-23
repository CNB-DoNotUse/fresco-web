import React from 'react'
import Slider from 'react-slick'
import Tag from './editing/tag'

export default class AdminSubmissionEdit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeSubmission: {},
			newTags: [],
			stories: []
		}
		this.editButtonEnabled = this.editButtonEnabled.bind(this);
		this.handleChangeCaption = this.handleChangeCaption.bind(this);
		this.submissionTagsInputKeyDown = this.submissionTagsInputKeyDown.bind(this);
		this.removeSubmissionTag = this.removeSubmissionTag.bind(this);

		this.revert = this.revert.bind(this);
		this.skip = this.skip.bind(this);
		this.verify = this.verify.bind(this);
		this.remove = this.remove.bind(this);
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
				let activeSubmission = this.state.activeSubmission;
				let tags = this.state.newTags;

				if(tags.indexOf(text) != -1) return;
				if(activeSubmission.tags.indexOf(text) != -1) return;

				tags.push(text);

				this.setState({
					newTags: tags
				});

				e.target.value = '';
			}
		}
	}

	removeSubmissionTag(tag) {

		let tags = this.state.activeSubmission.tags;

		if(tags.indexOf(tag) != -1) {

			let activeSubmission = this.state.activeSubmission;

			if(activeSubmission.tags.length == 1) {
				activeSubmission.tags = [];
			} else {
				activeSubmission.tags.splice(tags.indexOf(tag), 1);
			}

			this.setState({
				activeSubmission: activeSubmission
			});

		}

		let newTags = this.state.newTags;
		if(newTags.indexOf(tag) != -1) {
			if(newTags.length == 1) {
				newTags = [];
			} else {
				newTags.splice(newTags.indexOf(tag), 1);
			}

			this.setState({
				newTags: newTags
			});
		}

	}

	editButtonEnabled(is) {
		this.refs['submission-revert'].disabled = !is;
		this.refs['submission-verify'].disabled = !is;
		this.refs['submission-skip'].disabled = !is;
		this.refs['submission-delete'].disabled = !is;
	}

	componentDidMount() {
		this.editButtonEnabled(false);
	}

	componentDidUpdate(prevProps, prevState) {
		if(this.props.activeSubmission._id != prevProps.activeSubmission._id) {

			this.setState({
				activeSubmission: this.props.activeSubmission,
				newTags: [],
				stories: []
			});

			this.editButtonEnabled(true);

			this.refs['submission-caption'].value = this.props.activeSubmission.posts[0].caption;

			if(this.props.hasActiveSubmission) {
				this.refs['submission-caption'].value = this.props.activeSubmission.posts[0].caption;
			}


			$(this.refs['submission-byline']).removeClass('empty');
			$(this.refs['submission-caption']).removeClass('empty');

			this.refs['tags-input'].value = '';

		}
	}

	revert() {
		this.setState({
				activeSubmission: this.props.activeSubmission,
				newTags: [],
				stories: []
			});

		this.editButtonEnabled(true);

		this.refs['submission-caption'].value = this.props.activeSubmission.posts[0].caption;

		$(this.refs['submission-byline']).removeClass('empty');
		$(this.refs['submission-caption']).removeClass('empty');

		if(this.props.hasActiveSubmission) {
			this.refs['submission-caption'].value = this.props.activeSubmission.posts[0].caption;
		}

		this.refs['tags-input'].value = '';
	}

	remove() {
		this.props.remove((err) => {
			if (err)
				return $.snackbar({content: 'Unable to delete gallery'});

			$.snackbar({content: 'Gallery deleted'});
		});
	}

	skip() {
		this.props.skip((err, id) => {
			if (err)
				return $.snackbar({content: 'Unable to skip gallery'});

			$.snackbar({content: 'Gallery skipped! Click to open', timeout: 5000})
				.click(() => {
					window.open('/gallery/' + id);
				});
		});
	}

	verify() {

		var allTags = [];
		this.state.activeSubmission.tags.map(t => allTags.push(t));
		this.state.newTags.map(t => allTags.push(t));

		var params = {
			id: this.state.activeSubmission._id,
			byline: this.state.activeSubmission.posts[0].byline.trim(),
			caption: this.refs['submission-caption'].value,
			posts: this.state.activeSubmission.posts.map(p => p._id),
			stories: this.state.stories.map(s => s._id),
			tags: allTags
		};

		if (!params.posts || params.posts.length == 0)
			return $.snackbar({content: 'A gallery must have at least one post'});

		if(this.refs['submission-caption'].length == 0)
			return $.snackbar({content: 'A gallery must have a caption'});

		this.props.verify(params, (err, id) => {
			if (err)
				return $.snackbar({content: 'Unable to verify gallery'});

			$.snackbar({content: 'Gallery verified! Click to open', timeout: 5000})
				.click(() => {
					window.open('/gallery/' + id);
				});

		});
	}

	render() {

		var activeSubmission = this.props.activeSubmission;

		if(this.props.hasActiveSubmission) {
			var submissionImages = activeSubmission.posts.map((post, i) => {
				if(post.video) {
					return (
						<div key={i}>
							<video width="100%" height="100%" data-id={post._id} controls>
								<source src={post.video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4')} type="video/mp4" />
								Your browser does not support the video tag.\
							</video>
						</div>
					)
				}
				return (
					<div key={i}><img className="img-responsive" src={formatImg(post.image, 'medium')} data-id={post._id} /></div>
				);
			});

			var submissionTags = activeSubmission.tags.map((tag, i) => {
				return <Tag text={tag} onClick={this.removeSubmissionTag.bind(null, tag)} key={i} />
			});

			var newTags = this.state.newTags.map((tag, i) => {
				return <Tag text={tag} onClick={this.removeSubmissionTag.bind(null, tag)} key={i} />
			});

		}

		return (
			<div className="dialog">
				<div className="dialog-body" style={{visibility: this.props.hasActiveSubmission ? 'visible' : 'hidden'}}>
					<div className="submission-images">
						<Slider
							dots={true}
							infinite={false}>
							{submissionImages ? submissionImages : <div></div>}
						</Slider>
					</div>
					<input
						type="text"
						className="form-control floating-label submission-byline"
						placeholder="Byline"
						value={this.props.hasActiveSubmission ? this.props.activeSubmission.posts[0].byline : ''}
						ref="submission-byline" disabled  />
					<textarea
						type="text"
						className="form-control floating-label submission-caption"
						placeholder="Caption"
						onChange={this.props.handleChangeCaption}
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
								{newTags}
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
							<ul className="chips submission-stories">
								{this.state.stories}
							</ul>
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
					<button type="button" className="btn btn-flat submission-revert" ref="submission-revert" onClick={this.revert}>Revert changes</button>
					<button type="button" className="btn btn-flat pull-right submission-verify" ref="submission-verify" onClick={this.verify}>Verify</button>
					<button type="button" className="btn btn-flat pull-right submission-skip" ref="submission-skip" onClick={this.skip}>Skip</button>
					<button type="button" className="btn btn-flat pull-right submission-delete" ref="submission-delete" onClick={this.remove}>Delete</button>
				</div>
			</div>
		);
	}
}