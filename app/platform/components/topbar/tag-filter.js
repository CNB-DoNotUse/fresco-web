import React from 'react'
import Tag from '../editing/tag'
import Dropdown from '../global/dropdown'

export default class TagFilter extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			toggled: false
		}

		this.handleTagInput = this.handleTagInput.bind(this);
	}

	handleTagInput(e) {
		//Call on tag input function if passed as a prop
		if(this.props.onTagInput){
			this.props.onTagInput(this.refs.tagFilterInput.value);
		} 
		//Otherwise interact normally
		else {		
			if(e.keyCode != 13) return;

			var tagText = this.refs.tagFilterInput.value;
			if(!tagText.length) return;

			if(this.props.filterList.indexOf(tagText) != -1) return;

			this.props.onTagAdd(tagText);
			this.refs.tagFilterInput.value = '';
		}

	}

	render() {
		var tags = [],
			available = [],
			tagList = _.clone(this.props.tagList, true),
			filterList = _.clone(this.props.filterList, true);

		for (var t in tagList) {
			available.push(
				<Tag 
					onClick={this.props.onTagAdd.bind(null, tagList[t])} 
					text={tagList[t]} key={t} />
			);
		}

		for (var t in filterList) {
			tags.push(
				<Tag
					onClick={this.props.onTagRemove.bind(null, filterList[t])} 
					text={filterList[t]} 
					key={t} />
			);
		}

		var dropdownLabel = this.props.filterList.length ? 'Filtering ' + this.props.filterList.length : ('Any ' + this.props.text);

		var dropdownButton = <div className="toggle" ref="toggle_button" onClick={this.toggle}>
								<span>{dropdownLabel}</span>
								<span className="mdi mdi-menu-down" ref="menu-icon"></span>
							</div>;

		var availableBody = '';
		if(available.length) {
			availableBody = <div className="split-cell">
								<span className="md-type-body2">Available {this.props.text}</span>
								<ul id="filter-available" className="chips">{available}</ul>
							</div>
		}

		return (
			<Dropdown inList={true} title={dropdownLabel} dropdownClass={"tags-dropdown"}>
				<div className="chips">
					<div className="split-cell">
						<div className="form-group-default">
							<div className="form-control-wrapper">
								<input
									id="tag-filter-input"
									type="text" 
									className="form-control empty"
									ref="tagFilterInput"
									onKeyUp={this.handleTagInput} />
								
								<div className="floating-label">{this.props.text}</div>
								
								<span className="material-input"></span>
							</div>
						</div>
						
						<ul id="tag-filter" className="chips">
							{tags}
						</ul>
					</div>
					
					{availableBody}
				</div>
			</Dropdown>
		);
	}
}

TagFilter.defaultProps = {
	text: 'Tags',
 	tagList: [],
 	filterList: [],
 	onTagAdd: function() {},
	onTagRemove: function() {}
}