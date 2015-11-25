import React from 'react'

export default class AdminGalleryListItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        var gallery = this.props.gallery;

        if(gallery.owner) {
            var galleryOwnerText =
                <p className="md-type-body2">
                    <a href={"/user/" + gallery.owner._id} target="_blank">
                        {(gallery.owner ? gallery.owner.firstname : '') + ' ' + (gallery.owner ? gallery.owner.lastname : '')}
                    </a>
                </p>
        }

        var location = 'No Location';
                            
        for (var i in gallery.posts){
            if (gallery.posts[i].location.address) {
                location = gallery.posts[i].location.address;
                break;
            }
        }
        var assignmentLink = <div></div>;

        if(gallery.assignment) {
            assignmentLink = <p className="md-type-body2 assignment-link" style={{lineHeight: '18px'}}><a href={"/assignment/" + gallery.assignment._id}>{gallery.assignment.title}</a></p>
        }

        var assignmentText =
            <div>
                {assignmentLink}
                <p className="md-type-body1 assignment-location" style={gallery.assignment ? {lineHeight: '18px'} : {}}>{location}</p>
            </div>


        return (
            <div className={"list-item" + (this.props.active ? ' active' : '')} onClick={this.props.setActiveGallery.bind(null, gallery._id, this.props.type)}>
                <div>
                    <a href={"/gallery/" + gallery._id} target="_blank">
                        <img
                            className="img-circle"
                            style={{width: '40px', height: '40px'}}
                            src={formatImg(gallery.posts[0].image, 'small')} />{ /* screen.css got rid of the image style */ }
                    </a>
                </div>
                <div className="flexy">
                    <p className="md-type-body1">{gallery.caption || ''}</p>
                </div>
                <div>
                    {galleryOwnerText}
                </div>
                    {assignmentText}
                <div>
                    <p className="md-type-body1">{timestampToDate(gallery.time_created)}</p>
                </div>
            </div>
        );
    }
}