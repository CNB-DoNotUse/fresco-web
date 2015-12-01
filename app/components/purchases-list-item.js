import React from 'react'

export default class PurchasesListItem extends React.Component {
	constructor(props) {
		super(props);

		this.goLink = this.goLink.bind(this);
	}

	goLink() {
		window.open('/post/' + (this.props.purchase.post ? this.props.purchase.post._id : this.props.purchase._id), '_blank');
	}
	
	render() {
		var purchase = this.props.purchase;
		var post = purchase.post;
		var video = post ? post.video != null : purchase.video != null;
		var assignmentText = '';

		if(purchase.assignment) {
			assignmentText = 
				<div>
					<p className="md-type-body2" style={{lineHeight: '16px'}}>{purchase.assignment.title}</p>
					<p className="md-type-body1" style={{lineHeight: '24px'}}>{purchase.assignment.location.address || purchase.assignment.location.googlemaps}</p>
				</div>
		}

		return (
			<div className="list-item" onClick={this.goLink} style={{cursor: 'pointer'}}>
				<div>
					<img
						className="img-circle"
						src={post ? post.image : purchase.image}
						style={{
							margin: '-2px 0',
						    width: '40px',
						    height: '40px'
						}}/>
				</div>
				<div>
					<p className="md-type-body1">{getTimeAgo(Date.now(), purchase.timestamp)}</p>
				</div>
				<div>
					<p className="md-type-body1">{video ? 'Video' : 'Photo'}</p>
				</div>
				<div className="flexy">
					<p className="md-type-body1">${video ? 75 : 30}.00</p>
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