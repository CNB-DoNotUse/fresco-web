import React from 'react'
import _ from 'lodash'

export default class StoryEdit extends React.Component {

	constructor(props) {
		super(props);
		this.hide = this.hide.bind(this);

		this.save = this.save.bind(this);
		this.revert = this.revert.bind(this);
		this.cancel = this.cancel.bind(this);
		this.clear = this.clear.bind(this);

		console.log(this.props.story);
	}

	hide() {
		$(".toggle-edit").toggleClass("toggled");
	}

	revert() {
		this.refs.editTitle.value = this.props.story.title;
		this.refs.editCaption.value = this.props.story.caption;
	}

	clear() {
		this.refs.editTitle.value = '';
		this.refs.editCaption.value = '';
	}

	save() {

		var params = {
			id: this.props.story._id,
			title: this.refs.editTitle.value,
			caption: this.refs.editCaption.value
		}

		$.ajax("/scripts/story/update", {
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify(params),
			success: (result) => {
				if(result.err)
					return this.error(null, null, result.err);
					
				window.location.reload();
			},
			error: (xhr, status, error) =>{
				$.snackbar({content: resolveError(error)});
			}
		});
	}

	cancel() {
		this.revert();
		this.hide();
	}

	render() {
		return (
			<div>
				<div className="dim toggle-edit">
				</div>
				<div className="edit panel panel-default toggle-edit">
					<div className="col-lg-4 visible-lg edit-current">
						<div className="meta">
							<div id="story-edit-caption" className="meta-description"></div>
							<div className="meta-list">
								<ul className="md-type-subhead">
									<li>
										<span className="mdi mdi-clock icon"></span>
										<span id="story-edit-date">{timestampToDate(this.props.story.time_created)}</span>
									</li>
									<li>
										<span className="mdi mdi-file-image-box icon"></span>
										<span id="story-edit-photo-num">{this.props.story.stats.photos} {this.props.story.stats.photos == 1 ? 'photo' : 'photos'}</span>
									</li>
									<li>
										<span className="mdi mdi-movie icon"></span>
										<span id="story-edit-video-num">{this.props.story.stats.videos} {this.props.story.stats.videos == 1 ? 'video' : 'videos'}</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="col-xs-12 col-lg-8 edit-new dialog">
						<div className="dialog-head">
							<span className="md-type-title">Edit story</span>
							<span className="mdi mdi-close pull-right icon toggle-edit toggler" onClick={this.hide}></span>
						</div>
						<div className="dialog-foot">
							<button id="story-edit-revert" type="button" className="btn btn-flat" onClick={this.revert}>Revert changes</button>
							<button id="story-edit-clear" type="button" className="btn btn-flat" onClick={this.clear}>Clear all</button>
							<button id="story-edit-save" type="button" className="btn btn-flat pull-right" onClick={this.save}>Save</button>
							<button id="story-edit-discard" type="button" className="btn btn-flat pull-right toggle-edit toggler" onClick={this.hide}>Discard</button>
						</div>
						<div className="dialog-body">
							<div className="dialog-col col-xs-12 form-group-default">
								<div className="dialog-row">
									<input
										id="story-edit-title-input"
										type="text"
										className="form-control floating-label"
										placeholder="Title"
										ref="editTitle"
										defaultValue={this.props.story.title} />
								</div>
								<div className="dialog-row">
									<textarea
										id="story-edit-caption-input"
										type="text"
										className="form-control floating-label"
										placeholder="Caption"
										ref="editCaption"
										defaultValue={this.props.story.caption}/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}