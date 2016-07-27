import React, { Component, PropTypes } from 'react'
import moment from 'moment'
import utils from 'utils'

export default class PurchasesListItem extends React.Component {
	constructor(props) {
		super(props);

		this.openLink = this.openLink.bind(this);
	}

	/**
	 * Opens passed link
	 */
	openLink(link) {
		window.open(link, '_blank');
	}
	
	render() {
		const { purchase, showTitle } = this.props;
		const {assignment, post, outlet} = purchase;
		let video = post ? post.video != null : purchase.video != null;
		let timeString = moment(purchase.created_at).format('MMM Do, h:mma');
		let title = outlet.title;
		let price = '$' + (video ? '75' : '30') + '.00';

		return (
			<div 
				className="list-item" 
				onClick={this.openLink.bind(this, '/post/' + post.id)} 
				style={{cursor: 'pointer'}}>
				<div>
					<img
						className="img-circle"
						src={post ? utils.formatImg(post.image, 'small') : ''}
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
				{post.owner ? 
					<div 
						className="flexy" 
						onClick={this.openLink.bind(this, '/user/' + post.owner.id)}>
						<p className="md-type-body2">{post.owner.full_name || post.owner.username}</p>
					</div>
					: ''
				}
				
				{purchase.assignment ? 
					<div onClick={this.openLink.bind(this, '/assignment/' + assignment.id)}>
						<p className="md-type-body2" style={{lineHeight: '16px'}}>
							{assignment.title}
						</p>
						
						<p className="md-type-body1" style={{lineHeight: '24px'}}>
							{purchase.assignment.location.address || purchase.assignment.location.googlemaps}
						</p>
					</div>
					: ''
				}
				
				{showTitle ?
					<div>
						<p className="md-type-body2 toggle-aradd  toggler">{showTitle ? title : ''}</p>
					</div>
					: ''
				}
			</div>
		);
	}
}

PurchasesListItem.propTypes = {
    purchase: PropTypes.object.isRequired
};

PurchasesListItem.defaultProps = {
	showTitle: true
}