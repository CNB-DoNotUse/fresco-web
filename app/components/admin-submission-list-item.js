import React from 'react'

export default class SubmissionListItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        var submission = this.props.submission;

        if(submission.owner) {
            var subOwnerText =
                <p className="md-type-body2">
                    <a href={"/user/" + submission.owner._id} target="_blank">
                        {(submission.owner ? submission.owner.firstname : '') + ' ' + (submission.owner ? submission.owner.lastname : '')}
                    </a>
                </p>
        }

        var location = 'No Location';
                            
        for (var i in submission.posts){
            if (submission.posts[i].location.address){
                location = sub.posts[i].location.address;
                break;
            }
        }

        var assignmentText =
            <div>
                <p className="md-type-body1">{location}</p>
            </div>

        if(submission.assignment) {
            assignmentText = <div><p className="md-type-body2 assignment-link">asdf</p></div>
        }


        return (
            <div className={"list-item" + (this.props.active ? ' active' : '')} onClick={this.props.setActiveSubmission.bind(null, submission._id)}>
                <div>
                    <a href={"/gallery/" + submission._id} target="_blank">
                        <img
                            className="img-circle"
                            style={{width: '40px', height: '40px'}}
                            src={formatImg(submission.posts[0].image, 'small')} />{ /* screen.css got rid of the image style */ }
                    </a>
                </div>
                <div className="flexy">
                    <p className="md-type-body1">{submission.caption || ''}</p>
                </div>
                <div>
                    {subOwnerText}
                </div>
                    {assignmentText}
                <div>
                    <p className="md-type-body1">{timestampToDate(submission.time_created)}</p>
                </div>
            </div>
        );
    }
}