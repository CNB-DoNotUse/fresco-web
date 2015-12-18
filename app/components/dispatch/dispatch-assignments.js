import React from 'react';
import AssignmentListItem from './assignment-list-item'

/** //

Description : The list switcher for assignments for the dispatch page

// **/

/**
 * List toggle component
 */

export default class DispatchAssignments extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			assignments: []
		}
		this.toggleList = this.toggleList.bind(this);
		this.scroll = this.scroll.bind(this);
	}

	componentDidMount() {

		//Access parent var load method
		this.loadAssignments(0, 'active', (assignments) => {
			
			//Update offset based on psts from callaback
			var offset = assignments ? assignments.length : 0;

			//Set posts & callback from successful response
			this.setState({
				assignments: assignments,
				offset : offset
			});

		});
	      
	}

	componentDidUpdate(prevProps, prevState) {
	    
		if(prevProps.viewMode !== this.props.viewMode){

			//Access parent var load method
			this.loadAssignments(0, this.props.viewMode, (assignments) => {
				
				//Update offset based on psts from callaback
				var offset = assignments ? assignments.length : 0;

				//Set posts & callback from successful response
				this.setState({
					assignments: assignments,
					offset : offset
				});

			});
		}

	}

	//Scroll listener for main window
	scroll(type, event) {

		var grid;

		if(type == 'active')
			grid = this.refs.activeList
		else if (type == 'pending')
			grid = this.refs.pendingList;
		else if (type == 'expired')
			grid = this.refs.expiredList;

		//Check that nothing is loading and that we're at the end of the scroll, 
		//and that we have a parent bind to load  more posts
		if(!this.state.loading && grid.scrollTop === (grid.scrollHeight - grid.offsetHeight) && this.props.loadPosts){

			//Set that we're loading
			this.setState({ loading : true });

			//Run load on parent call
			this.loadAssignments(this.state.offset, type, (assignments) =>{

				//Disables scroll, and returns nil if posts are nill
				if(!assignments || assignments.length == 0){ 
					
					this.setState({
						scrollable: false
					});

					return;

				}

				var offset = this.state.assignments.length + posts.length;

				//Set galleries from successful response, and unset loading
				this.setState({
					assignments: this.state.assignments.concat(assignments),
					offset : offset,
					loading : false
				});

			}, this);
		}
	}

	render() {

		var AssignmentList = this.state.assignments.map((assignment, i)  => {

			return (
				<AssignmentListItem 
					assignment={assignment}
					setActiveAssignment={this.props.setActiveAssignment}
					key={i} />
			)

		});


		return (

			<div className="card panel assignments-panel">
				<div className="card-head small">
					<div className="tab-control full">
						<button ref="active-button"  className="btn btn-flat toggled" onClick={this.toggleList.bind(null, 'active')}>Active</button>
						<button ref="pending-button" className="btn btn-flat" onClick={this.toggleList.bind(null, 'pending')}>Pending</button>
						<button ref="expired-button" className="btn btn-flat" onClick={this.toggleList.bind(null, 'expired')}>History</button>
					</div>
				</div>
				<div className="card-foot center toggle-card">
					<button 
						type="button" 
						id="open-assignment-window" 
						className="btn btn-flat toggle-card toggler" 
						disabled={!(this.props.user.outlet && this.props.user.outlet.verified)} 
						onClick={this.props.toggleSubmissionCard.bind(null, true)}>Post an assignment</button>
				</div>
				<div className="card-body">
					<div className="tabs full">
						<div className="tab toggled">
							<div 
								ref="activeList" 
								className="list"
								onScroll={this.scroll.bind(null, 'active')}>{AssignmentList}</div>
						</div>
						<div className="tab">
							<div 
								ref="pendingList" 
								className="list"
								onScroll={this.scroll.bind(null, 'pending')}></div>
						</div>
						<div className="tab">
							<div 
								ref="historyList" 
								className="list"
								onScroll={this.scroll.bind(null, 'expired')}></div>
						</div>
					</div>
				</div>
			</div>
			
		);

	}

	/**
	 * Toggle Assignment List
	 * @param  {string} toggle Which list to toggle to
	 */
	toggleList(toggle) {

		if(toggle === this.props.viewMode) return;

		var buttons = document.getElementsByClassName('btn-flat'),
			button = this.refs[toggle + '-button'];

		//Remove toggle from all other buttons
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].className = buttons[i].className.replace(/\btoggled\b/,'');
		};

		//Add toggle to clicked button
		button.className += ' toggled';

		this.setState({
			assignments: []
		});

		this.props.updateViewMode(toggle);

	}

	/**
	 * Loads assignments
	 * @param  {int}   passedOffset offset to load off of
	 * @param  {string}   type         type of assignments to retrieve
	 * @param  {function} callback     callback containing response
	 */
	loadAssignments(passedOffset, type, callback) {

		var params = {
			offset: passedOffset,
			limit: 10
		}

		this.props.findAssignments(null, params, (response) => {
			//Do nothing, because of bad response
			if(!response || response.err)
				callback([]);
			else{
				callback(response);
			}
		});
	}
}	
