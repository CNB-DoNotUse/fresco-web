import React from 'react';
import StoryEditStats from './edit-stats';

export default class StoryEdit extends React.Component {

	constructor(props) {
		super(props);

		this.hide = this.hide.bind(this);
		this.save = this.save.bind(this);
		this.revert = this.revert.bind(this);
		this.cancel = this.cancel.bind(this);
		this.delete = this.delete.bind(this);
		this.clear = this.clear.bind(this);

	}

	hide() {
		this.props.toggle();
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

		var self = this,
			params = {
				id: this.props.story.id,
				title: this.refs.editTitle.value,
				caption: this.refs.editCaption.value
			}

		$.ajax("/api/story/update", {
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify(params),
			success: function(result){
				if(result.err)
					return this.error(null, null, result.err);
				if(!self.props.updateStory){
					location.reload();
				} else{
					//Update parent story
					self.hide();
					self.props.updateStory(result.data);
				}

			},
			error: (xhr, status, error) =>{
				$.snackbar({content: resolveError(error)});
			}
		});
	}

	delete() {
		alertify.confirm("Are you sure you want to delete this story? This cannot be undone.", (e) => {
			$.post('/api/story/delete',
			{
				id: this.props.story.id
			}, (data) => {
				if(data.err) {
					return $.snackbar({ content: 'There was a problem deleting yoru story' });
				}

				window.location = '/archive/stories';
			})
		});
	}

	cancel() {
		this.revert();
		this.props.toggle();
	}

	render() {

		var toggled = this.props.toggled ? 'toggled' : '';

		return (
			<div>

				<div className={"dim toggle-edit " + toggled}></div>
				<div className={"edit panel panel-default toggle-edit " + toggled}>

					<div className="col-lg-4 visible-lg edit-current">
						<StoryEditStats story={this.props.story} />
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
							<button id="story-edit-delete" type="button" className="btn btn-flat pull-right" onClick={this.delete}>Delete</button>
							<button id="story-edit-discard" type="button" className="btn btn-flat pull-right toggle-edit toggler" onClick={this.cancel}>Discard</button>
						</div>

						<div className="dialog-body">
							<div className="dialog-col col-xs-12 form-group-default">
								<div className="dialog-row">
									<input
										id="story-edit-title-input"
										type="text"
										className="form-control floating-label"
										placeholder="Title"
										title="Title"
										ref="editTitle"
										defaultValue={this.props.story.title} />
								</div>
								<div className="dialog-row">
									<textarea
										id="story-edit-caption-input"
										type="text"
										className="form-control floating-label"
										placeholder="Caption"
										title="Caption"
										ref="editCaption"
										defaultValue={this.props.story.caption} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

StoryEdit.defaultProps = {
	toggled: false,
	toggle: function () { console.log('StoryEdit missing toggle implementation'); }
}
