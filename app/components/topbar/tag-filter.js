import React from 'react'
import Tag from '../editing/tag'

export default class TagFilter extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			toggled: false
		}

		this.hideDropdown = this.hideDropdown.bind(this);
		this.clicked = this.clicked.bind(this);

		this.handleTagInput = this.handleTagInput.bind(this);

	}

	//Hides the dropdown menu and removes the whole-screen dim
	hideDropdown() {
		
		this.refs.drop.classList.remove('toggled');
		
		var toRemoveToggle = document.getElementsByClassName('toggle-drop');
		
		for (var i = 0; i < toRemoveToggle.length; i++) {
			toRemoveToggle[i].classList.remove('toggled');
		}

		this.setState({
			toggled: false
		});
	}

	//Called whenever the master button is clicked
	clicked(event) {
		if(this.state.toggled) return this.hideDropdown();

		var drop =  $(this.refs.toggle_button).siblings(".drop-menu");
			
		drop.toggleClass("toggled");
		
		if (drop.hasClass("toggled")) {

			this.setState({
				toggled: true
			});

			var offset = drop.offset().left;
			while (offset + drop.outerWidth() > $(window).width() - 7) {
				drop.css("left", parseInt(drop.css("left")) - 1 + "px");
				offset = drop.offset().left;
			}
		} else {

			this.setState({
				toggled: false
			});

		}
		
		$(".dim.toggle-drop").toggleClass("toggled");

	}

	handleTagInput(e) {
		if(e.keyCode != 13) return;

		var tagText = this.refs.tagFilterInput.value;
		if(!tagText.length) return;

		if(this.props.filterList.indexOf(tagText) != -1) return;

		this.props.onTagAdd(tagText);
		this.refs.tagFilterInput.value = '';
	}

	render() {
		var tags = [],
			available = [],
			tagList = _.clone(this.props.tagList, true),
			filterList = _.clone(this.props.filterList, true);

		for (var t in tagList) {
			available.push(<Tag onClick={this.props.onTagAdd.bind(null, tagList[t])} text={tagList[t]} key={t} />)
		}

		for (var t in filterList) {
			tags.push(<Tag onClick={this.props.onTagRemove.bind(null, filterList[t])} text={filterList[t]} key={t} />);
		}

		return (
			<div className="drop filter-location pull-right hidden-xs">
				<button className="toggle-drop md-type-subhead" ref="toggle_button" onClick={this.clicked}>
					<span>{this.props.filterList.length ? 'Filtering ' + this.props.filterList.length : ('Any ' + this.props.text)}</span>
					<span className="mdi mdi-menu-down icon"></span>
				</button>
				<div className="drop-menu panel panel-default" ref="drop">
					<div className="toggle-drop toggler md-type-subhead" onClick={this.hideDropdown}>
						<span>Filter {this.props.text}</span>
						<span className="mdi mdi-menu-up icon pull-right"></span>
					</div>
					<div className="drop-body">
						<div className="chips">
							<div className="split-cell">
								<div className="form-group-default">
									<div className="form-control-wrapper">
										<input
											id="tag-filter-input"
											type="text" className="form-control empty"
											ref="tagFilterInput"
											onKeyUp={this.handleTagInput}
											/>
										<div className="floating-label">{this.props.text}</div>
										<span className="material-input"></span>
									</div>
								</div>
								<ul id="tag-filter" className="chips">{tags}</ul>
							</div>
							<div className="split-cell">
								<span className="md-type-body2">Available {this.props.text}</span>
								<ul id="filter-available" className="chips">{available}</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
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