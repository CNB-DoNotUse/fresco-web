import React from 'react'
import moment from 'moment'
import global from '../../../lib/global'

export default class PurchasesListItem extends React.Component {
	constructor(props) {
		super(props);

		this.openLink = this.openLink.bind(this);
	}

	/**
	 * Opens passed link
	 */
	openLink(link) {

		console.log(link);

		window.open(link, '_blank');

	}
	
	render() {

		var purchase = this.props.purchase,
			post = purchase.post,
			video = post ? post.video != null : purchase.video != null,
			timeString = moment(purchase.timestamp).format('MMM Do, h:mma'),
			price = '$' + (video ? '75' : '30') + '.00',
			assignment = '',
			user = '',
			outlet = '';


		if(purchase.assignment) {
			assignment = 
				<div onClick={this.openLink.bind(this, '/assignment/' + purchase.assignment._id)}>
					<p className="md-type-body2" style={{lineHeight: '16px'}}>
						{purchase.assignment.title}
					</p>
					
					<p className="md-type-body1" style={{lineHeight: '24px'}}>
						{purchase.assignment.location.address || purchase.assignment.location.googlemaps}
					</p>
				</div>
		}

		if(post.owner){
			user = <div 
						className="flexy" 
						onClick={this.openLink.bind(this, '/user/' + post.owner._id)}>
						<p className="md-type-body2">{post.owner.firstname + ' ' + post.owner.lastname}</p>
					</div>
		}

		if(this.props.showTitle) {
			outlet = <div>
						<p className="md-type-body2 toggle-aradd  toggler">{this.props.showTitle ? this.props.title : ''}</p>
					</div>
		}

		return (
			<div 
				className="list-item" 
				onClick={this.openLink.bind(this, '/post/' + post._id)} 
				style={{cursor: 'pointer'}}>
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
				<div className={post.owner ? '' : 'flexy'}>
					<p className="md-type-body1">{price}</p>
				</div>
				{user}
				
				{assignment}
				
				{outlet}
			</div>
		);
	}
}

PurchasesListItem.defaultProps = {
	showTitle: true,
	title: ''
}