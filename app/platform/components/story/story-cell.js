import React from 'react';
import time from 'app/lib/time';
import UserItem from 'app/platform/components/global/user-item';
import { StoryThumbnail, StoryViewAll } from 'app/platform/components/story/story-thumbnail';
/**
 * Single Story Cell, child of StoryList
 */
export default class StoryCell extends React.Component {

	onClick = () => {
		window.location = '/story/' + this.props.story.id;
	}

	packageThumbnails = () => {
		const { story, thumbnails } = this.props;
		const storyThumbs = [];
		for (let x = 0; x < thumbnails; x ++) {
			storyThumbs.push(
				<StoryThumbnail
					key={`${story.posts[x].id}${x}`}
					src={`${story.posts[x].image}`}
					location={story.posts[x].address}
					postTime="5 minutes ago"/>
			)
		}
		storyThumbs.push(
			<StoryViewAll
				storyID={ story.id }
				owner={ story.owner.username }
				numLeft={ story.posts.length - thumbnails }/>
		);
		return storyThumbs;
	}

	render() {
		const { story } = this.props;
		const timestamp = story.updated_at || story.created_at;
		const timeString = time.formatTime(timestamp);
		const storyInfo = { videos: 0, images: 0, caption: story.title };
		return(
			<li>
				<StoryTitle
					owner={ story.owner }
					storyInfo={ storyInfo }/>
				<ul className="story-thumbnails">
					{ this.packageThumbnails() }
				</ul>
			</li>
		);
	}
}

/**
 * StoryTitle is a header for an individual story
 */
export const StoryTitle = ({ owner, storyInfo }) => (
	<section className="story-info">
		<UserItem user={ owner }
			metaType="story"
			storyInfo={ storyInfo } />
		<div className="download-story">Download New</div>
	</section>
)

/**
 * Post Cell Images DEPRECATED
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
