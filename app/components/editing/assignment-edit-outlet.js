import _ from 'lodash'
import React from 'react'
import Tag from './tag.js'
import global from '../../../lib/global'

/**
 * Component for managing added/removed tags
 */

export default class AssignmentEditOutlet extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			suggestions: []
		}
		this.change = this.change.bind(this);
		this.addOutlet = this.addOutlet.bind(this);
	}

	change(e) {
		//Current fields input
		var query = this.refs.autocomplete.value;

		//Field is empty
		if(query.length == 0){
			this.setState({ suggestions: [] });
			this.refs.dropdown.style.display = 'none';
		} else{

			this.refs.dropdown.style.display = 'block';

			$.ajax({
				url: '/api/outlet/list',
				data: { q: query },
				success: (result, status, xhr) => {
					if(result.data)
						this.setState({ suggestions: result.data });
				}
			});
		}
	}

	/**
	 * Adds outlet at passed index to current outlet
	 * @param {[type]} index [description]
	 */
	addOutlet(outlet) {
		if(this.props.outlet){
			return $.snackbar({ content : 'Outlets can only have one owner!' });
		}
		
		//Clear the input field
		this.refs.autocomplete.value = ''
		this.refs.dropdown.style.display = 'none';

		//Send outlet up to parent
		this.props.updateOutlet(outlet);
	}

	render() {

		var outlet = '';

		if(this.props.outlet){
			outlet = <Tag
							text={this.props.outlet.title}
							plus={false}
							onClick={this.props.updateOutlet.bind(null, null)} />
		}

		//Map suggestions for dropdown
		var suggestions = this.state.suggestions.map((outlet, i) => {

			return <li onClick={this.addOutlet.bind(null, outlet)}
						key={i}>{outlet.title}</li>

		});

		return (
			
			<div className="dialog-row split chips">
				<div className="split-cell">
					<input
						type="text"
						className="form-control floating-label"
						placeholder="Owner (Outlet)"
						onKeyUp={this.change}
						ref='autocomplete' />

					<ul ref="dropdown" className="dropdown">
						{suggestions}
					</ul>

					<ul className="chips">
						{outlet}
					</ul>
				</div>
			</div>

		);

	}

}

AssignmentEditOutlet.defaultProps = {
	updateOutlet: () => {}
}