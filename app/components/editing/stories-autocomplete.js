var React = require('react');
	ReactDOM = require('react-dom');

/**
 * Auto-complete component for stories input
 */

var StoriesAutoComplete = React.createClass({

	displayName: 'StoriesAutoComplete',

	componentDidMount: function(){

		var self = this;

		//Gallery Stories Autocomplete
		$(this.refs.story_input).typeahead({
			hint: true,
			highlight: true,
			minLength: 1,
			classNames: {
				menu: 'tt-menu shadow-z-2'
			}
		},
		{
			name: 'stories',
			display: 'title',
			source: function(query, syncResults, asyncResults){
				$.ajax({
					url: '/scripts/story/autocomplete',
					data: {
						q: query
					},
					success: function(result, status, xhr){
						asyncResults(result.data || []);
					},
					error: function(xhr, statur, error){
						asyncResults([]);
					}
				});
			},
			templates: {
				empty: [
					'<div id="story-empty-message" class="tt-suggestion">',
						'Create new story',
					'</div>'
				].join('\n'),
			}
		}).on('typeahead:select', function(ev, selectedStory){

			//Check if the story is not in our existing set of stories by object id
			var filter = self.props.stories.filter(function(story){
				return story._id == selectedStory._id;
			})

			if(filter.length == 0)
				self.props.addStory(selectedStory);
			else
				$.snackbar({content: 'This gallery is already in that story!'});
				
			$(this).typeahead('val', '');

		}).on('keydown', function(ev){
			
			emptyMessage = document.getElementById('story-empty-message');

			//Check if we're hitting enter and there is a new story option present
			if (ev.keyCode == 13 && typeof(emptyMessage) !== 'undefined') {
				
				//Check if we have a url
				if($(this).val().indexOf('http://') != -1) {
					$.snackbar({content: 'No URLs please!'});
					return;
				}

				var newStory = {
					title: $(this).val(),
					new: true
				};

				//Check if the story is not in our existing set of stories by title
				var filter = self.props.stories.filter(function(story){
					return story.title == newStory.title;
				})

				if(filter.length > 0){
					$.snackbar({content: 'This gallery is already in that story!'});
					return;
				}

				self.props.addStory(newStory)
				

				$(this).typeahead('val', '');
			}
		});

	},

	render: function(){

		return(

			<input 
				id="gallery-stories-input" 
				type="text" 
				className="form-control floating-label" 
				placeholder="Stories"
				onChange={this.change}
				ref='story_input' />
		);
	}

});

module.exports = StoriesAutoComplete;