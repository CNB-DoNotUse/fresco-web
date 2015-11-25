import React from 'react'

/**
 * Auto-complete component for stories input
 */

export default class StoriesAutoComplete extends React.Component {

	componentDidMount() {

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
			source: (query, syncResults, asyncResults) => {
				$.ajax({
					url: '/scripts/story/autocomplete',
					data: {
						q: query
					},
					success: (result, status, xhr) => {
						asyncResults(result.data || []);
					},
					error: (xhr, statur, error) => {
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
		}).on('typeahead:select', (ev, selectedStory) => {

			this.props.addStory(selectedStory);
				
			$(this.refs.story_input).typeahead('val', '');

		}).on('keydown', (ev, story) => {

		});

	}

	render() {

		return (

			<input 
				id="gallery-stories-input" 
				type="text" 
				className="form-control" 
				placeholder="Stories"
				onChange={this.change}
				ref='story_input' />
		);
	}

}