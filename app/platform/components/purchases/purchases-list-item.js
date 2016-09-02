import React, { Component, PropTypes } from 'react'
import moment from 'moment';
import utils from 'utils';
import FrescoImage from '../global/fresco-image';

class PurchasesListItem extends React.Component {
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
		const {assignment, post, outlet, amount} = purchase;
		const video = post.stream != null;
		const timeString = moment(purchase.created_at).format('MMM Do, h:mma');
		const title = outlet.title;
		const price = `$${(amount/100).toFixed(2)}`; //amount to 2 decimal points

		return (
			<a href={`/post/${post.id}`}>
				<div className="list-item">
					<div>
						<FrescoImage
							className='img-circle'
							src={post.image}
							size='small'
							style={{
								margin: '-2px 0',
							    width: '40px',
							    height: '40px'
							}} />
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
					{post.owner ? (
						<div className="flexy" >
							<a href={`/user/${post.owner.id}`}>
								<p className="md-type-body2">{post.owner.full_name || post.owner.username}</p>
							</a>
						</div>
					) : ''}
					
					{purchase.assignment ? (
						<div onClick={this.openLink.bind(this, '/assignment/' + assignment.id)}>
							<p className="md-type-body2" style={{lineHeight: '16px'}}>
								{assignment.title}
							</p>
							
							<p className="md-type-body1" style={{lineHeight: '24px'}}>
								{purchase.assignment.location.address || purchase.assignment.location.googlemaps}
							</p>
						</div>
					) : ''}
					
					{showTitle ? (
						<div>
							<a href={`/outlet/${outlet.id}`}>
								<p className="md-type-body2 toggle-aradd  toggler">{showTitle ? outlet.title : ''}</p>
							</a>
						</div>
					) : ''}
				</div>
			</a>
		);
	}
}

PurchasesListItem.propTypes = {
    purchase: PropTypes.object.isRequired
};

PurchasesListItem.defaultProps = {
	showTitle: true
}

export default PurchasesListItem;