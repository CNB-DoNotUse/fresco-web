import React from 'react'
import global from '../../../lib/global'

export default class PurchasesListItem extends React.Component {
	constructor(props) {
		super(props);

		this.openPurchase = this.openPurchase.bind(this);
		this.openAssignment = this.openAssignment.bind(this);
	}

	/**
	 * Opens assignment on click
	 */
	openAssignment() {

		if(!this.props.purchase.assignment) return;

		window.open('/assignment/' + this.props.purchase.assignment._id, '_blank');

	}

	/**
	 * Opens purchase
	 */
	openPurchase() {

		if(!this.props.purchase.post) return;

		window.open('/post/' + this.props.purchase.post._id, '_blank');
	}
	
	render() {

		var purchase = this.props.purchase,
			post = purchase.post,
			video = post ? post.video != null : purchase.video != null,
			timeString = global.formatTime(purchase.timestamp, true),
			price = '$' + (video ? '75' : '30') + '.00',
			assignmentText = '';

		if(purchase.assignment) {
			assignmentText = 
				<div onClick={this.openAssignment}>
					<p className="md-type-body2" style={{lineHeight: '16px'}}>
						{purchase.assignment.title}
					</p>
					<p className="md-type-body1" style={{lineHeight: '24px'}}>
						{purchase.assignment.location.address || purchase.assignment.location.googlemaps}
					</p>
				</div>
		}

		return (
			<div className="list-item" onClick={this.openPurchase} style={{cursor: 'pointer'}}>
				<div>
					<img
						className="img-circle"
						src={post ? global.formatImg(post.image, 'small') : ''}
						style={{
							margin: '-2px 0',
						    width: '40px',
						    height: '40px'
						}}/>
				</div>
				<div>
					<p className="md-type-body1">{timeString}</p>
				</div>
				<div>
					<p className="md-type-body1">{video ? 'Video' : 'Photo'}</p>
				</div>
				<div className="flexy">
					<p className="md-type-body1">{price}</p>
				</div>
				{assignmentText}
				<div>
					<p className="md-type-body2 toggle-aradd toggler">{this.props.showTitle ? this.props.title : ''}</p>
				</div>
			</div>
		);
	}
}

PurchasesListItem.defaultProps = {
	showTitle: true,
	title: ''
}