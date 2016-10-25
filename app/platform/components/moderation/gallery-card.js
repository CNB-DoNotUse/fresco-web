import React, { Component, PropTypes } from 'react';
import get from 'lodash/get';
import FrescoImage from '../global/fresco-image';
import { CardBadges, CardUser, CardReports } from './card-parts';

export default class GalleryCard extends Component {

    static propTypes = {
        id: PropTypes.string.isRequired,
        posts: PropTypes.array.isRequired,
        report_reasons: PropTypes.array.isRequired,
        report_count: PropTypes.number.isRequired,
        is_nsfw: PropTypes.bool.isRequired,
        reportData: PropTypes.object.isRequired,
        onClickReportsIndex: PropTypes.func.isRequired,
        onSuspend: PropTypes.func.isRequired,
        onSkip: PropTypes.func.isRequired,
        onToggleGraphic: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        owner: PropTypes.object,
        caption: PropTypes.string,
        opacity: PropTypes.number,
    };

    static defaultProps = {
        opacity: 1,
    };

    render() {
        const {
            posts,
            report_reasons,
            report_count,
            is_nsfw,
            owner,
            caption = 'No caption',
            reportData,
            onClickReportsIndex,
            onSuspend,
            onSkip,
            onToggleGraphic,
            onDelete,
            opacity,
        } = this.props;

        return (
            <div
                style={{ opacity }}
                className="moderation-card moderation-card__gallery"
            >
                <CardBadges strings={report_reasons} />

                <FrescoImage
                    className="moderation-card__image"
                    src={get(posts, '[0].image')}
                    loadWithPlaceholder
                />

                <div className="moderation-card__gallery-meta-wrap">
                    <div className="moderation-card__gallery-caption">
                        {caption}
                    </div>


                    {owner && <CardUser user={owner} />}
                </div>

                {reportData &&
                    <CardReports
                        {...reportData}
                        report_count={report_count}
                        onClickIndex={onClickReportsIndex}
                    />
                }

                <div className="moderation-card__actions-ctr">
                    <span
                        className="moderation-card__action"
                        onClick={onSkip}
                    >
                        skip
                    </span>
                    <div>
                        {report_reasons.includes('nsfw') &&
                            <span
                                className="moderation-card__action"
                                onClick={onToggleGraphic}
                            >
                                {is_nsfw ? 'unmark' : 'mark graphic'}
                            </span>
                        }
                        {owner &&
                            <span
                                className="moderation-card__action"
                                onClick={onSuspend}
                            >
                                {!!owner.suspended_until ? 'unsuspend user' : 'suspend user'}
                            </span>
                        }
                        <span
                            className="moderation-card__action"
                            onClick={onDelete}
                        >
                            delete
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

