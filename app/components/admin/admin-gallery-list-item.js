import React from 'react'
import global from '../../../lib/global'

export default class AdminGalleryListItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        var gallery = this.props.gallery;

        if(!gallery.posts.length) {
            return <div></div>
        }

        if(gallery.owner) {
            var galleryOwnerText =
                <p className="md-type-body2">
                    <a href={"/user/" + gallery.owner.id} target="_blank">
                        {(gallery.owner ? gallery.owner.firstname : '') + ' ' + (gallery.owner ? gallery.owner.lastname : '')}
                    </a>
                </p>
        }

        var location = 'No Location';
                            
        for (var i in gallery.posts) {
            if(gallery.posts[i].location) {
                if (gallery.posts[i].location.address) {
                    location = gallery.posts[i].location.address;
                    break;
                }
            }
        }
        var assignmentLink = <div></div>;

        if(gallery.assignment) {
            assignmentLink = <p className="md-type-body2 assignment-link" style={{lineHeight: '18px'}}><a href={"/assignment/" + gallery.assignment.id}>{gallery.assignment.title}</a></p>
        }

        return (
            <div className={"list-item" + (this.props.active ? ' active' : '')} 
                    onClick={this.props.setActiveGallery.bind(null, gallery.id, this.props.type)}>
                <div>
                    <a href={"/gallery/" + gallery.id} target="_blank">
                        <img
                            className="img-circle"
                            style={{width: '40px', height: '40px'}}
                            src={global.formatImg(gallery.posts[0].image, 'small')} />{ /* screen.css got rid of the image style */ }
                    </a>
                </div>
                <div className="flexy list-item-caption">
                    <p className="md-type-body1">{gallery.caption || 'No Caption'}</p>
                </div>
                <div className="list-item-owner">
                    {galleryOwnerText}
                </div>
                <div className="list-item-assignment">
                    {assignmentLink}
                    <p className="md-type-body1 assignment-location" style={gallery.assignment ? {lineHeight: '18px'} : {}}>{location}</p>
                </div>
                <div className="list-item-timestamp">
                    <p className="md-type-body1">{global.formatTime(gallery.time_created)}</p>
                </div>
            </div>
        );
    }
}