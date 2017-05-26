import React from 'react';
import time from 'app/lib/time';
import UserItem from 'app/platform/components/global/user-item';
import { StoryThumbnail, StoryViewAll } from 'app/platform/components/story/story-thumbnail';
/**
 * Single Story Cell, child of StoryList
 */
export default class StoryCell extends React.Component {

	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
	}

	onClick() {
		window.location = '/story/' + this.props.story.id;
	}

	render() {
		const { story } = this.props;
		const timestamp = story.updated_at || story.created_at;
		const timeString = time.formatTime(timestamp);
		const storyInfo = { videos: 0, images: 0, caption: story.caption };
		const storyThumbs = story.posts.map((post, ind) => (
			<StoryThumbnail
				key={ind}
				src={`${post.image}`}
				location="New York, NY"
				postTime="5 minutes ago"/>
		))
		return(
			<li>
				<a href={`story/${story.id}`}>
				<section className="story-info">
					<UserItem user={ story.owner }
					 	metaType="story"
					 	storyInfo={ storyInfo } />
					<div className="download-story">Download New</div>
				</section>
				</a>

				<ul className="story-thumbnails">
					{ storyThumbs }
					<StoryViewAll
						storyLink=""
						owner={ story.owner.username }
						numLeft={ 5 }/>
				</ul>
			</li>
		);
	}
}

// <StoryThumbnail
// 	src="http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg"
// 	location="New York, NY"
// 	postTime="5 minutes ago"/>
// <StoryThumbnail
// 	src="http://i1.kym-cdn.com/photos/images/facebook/000/632/652/6ca.jpg"
// 	location="New York, NY"
// 	postTime="5 minutes ago"
// 	unread={ true }/>

/**
 * Post Cell Images
 */
class StoryCellImages extends React.Component {

	render() {

		if (!this.props.thumbnails || this.props.thumbnails.length == 0){
			return (
				<div className="flex-row"></div>
			);
		}
		else if (this.props.thumbnails.length == 1){
			return(
				<div className="flex-row">
                    <div className="img">
                        <FrescoImage src={this.props.thumbnails[0].image} size="small" />
                    </div>
				</div>
			);
		}
		else if(this.props.thumbnails.length < 5){

			return(
				<div className="flex-row">
                    <div className="img">
                        <FrescoImage src={this.props.thumbnails[0].image} size="small" />
                    </div>
                    <div className="img">
                        <FrescoImage src={this.props.thumbnails[1].image} size="small" />
                    </div>
				</div>
			);

		}
		else if(this.props.thumbnails.length >= 5 && this.props.thumbnails.length < 8){
			return(
				<div className="flex-row">
					<div className="flex-col">
                        <div className="img">
                            <FrescoImage src={this.props.thumbnails[0].image} size="small" />
                        </div>
					</div>
					<div className="flex-col">
						<div className="flex-row">
                            <div className="img">
                                <FrescoImage src={this.props.thumbnails[0].image} size="small" />
                            </div>
                            <div className="img">
                                <FrescoImage src={this.props.thumbnails[1].image} size="small" />
                            </div>
						</div>
						<div className="flex-row">
                            <div className="img">
                                <FrescoImage src={this.props.thumbnails[3].image} size="small" />
                            </div>
                            <div className="img">
                                <FrescoImage src={this.props.thumbnails[3].image} size="small" />
                            </div>
						</div>
					</div>
				</div>
			);
		}
        else if(this.props.thumbnails.length >= 8){
            return(
                <div className="flex-col">
                    <div className="flex-row">
                        <div className="img">
                            <FrescoImage src={this.props.thumbnails[0].image} size="small" />
                        </div>
                        <div className="img">
                            <FrescoImage src={this.props.thumbnails[1].image} size="small" />
                        </div>
                        <div className="img">
                            <FrescoImage src={this.props.thumbnails[2].image} size="small" />
                        </div>
                        <div className="img">
                            <FrescoImage src={this.props.thumbnails[3].image} size="small" />
                        </div>
                    </div>
                    <div className="flex-row">
                        <div className="img">
                            <FrescoImage src={this.props.thumbnails[0].image} size="small" />
                        </div>
                        <div className="img">
                            <FrescoImage src={this.props.thumbnails[2].image} size="small" />
                        </div>
                        <div className="img">
                            <FrescoImage src={this.props.thumbnails[3].image} size="small" />
                        </div>
                        <div className="img">
                            <FrescoImage src={this.props.thumbnails[4].image} size="small" />
                        </div>
                    </div>
                </div>
            );
        }
    }
}
