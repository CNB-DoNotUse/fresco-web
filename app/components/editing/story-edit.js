import React from 'react'

export default class StoryEdit extends React.Component {
	render() {
		<div>
			<div className="dim toggle-sedit">
			</div>
			<div className="edit panel panel-default toggle-sedit">
				<div className="col-lg-4 visible-lg edit-current">
					<div className="meta">
						<div id="story-edit-caption" className="meta-description"></div>
						<div className="meta-list">
							<ul className="md-type-subhead">
								<li>
									<span className="mdi mdi-clock icon"></span><span id="story-edit-date"></span>
								</li>
								<li>
									<span className="mdi mdi-file-image-box icon"></span><span id="story-edit-photo-num"></span>
								</li>
								<li>
									<span className="mdi mdi-movie icon"></span><span id="story-edit-video-num"></span>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div className="col-xs-12 col-lg-8 edit-new dialog">
					<div className="dialog-head">
						<span className="md-type-title">Edit story</span>
						<span className="mdi mdi-close pull-right icon toggle-sedit toggler"></span>
					</div>
					<div className="dialog-foot">
						<button id="story-edit-revert" type="button" className="btn btn-flat">Revert changes</button>
						<button id="story-edit-clear" type="button" className="btn btn-flat">Clear all</button>
						<button id="story-edit-save" type="button" className="btn btn-flat pull-right">Save</button>
						<button id="story-edit-discard" type="button" className="btn btn-flat pull-right toggle-sedit toggler">Discard</button>
					</div>
					<div className="dialog-body">
						<div className="dialog-col col-xs-12 form-group-default">
							<div className="dialog-row">
								<input id="story-edit-title-input" type="text" className="form-control floating-label" placeholder="Title" />
							</div>
							<div className="dialog-row">
								<textarea id="story-edit-caption-input" type="text" className="form-control floating-label" placeholder="Caption"></textarea>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	}
}