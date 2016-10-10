import React, { Component, PropTypes } from 'react';
import get from 'lodash/get';
import partial from 'lodash/partial';
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
    };

    state = {
        opacity: 1,
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({ opacity: 1 });
        }
    }

    componentWillUnmount() {
        if (this.timer) clearTimeout(this.timer);
    }

    onRemove = (cb) => {
        this.setState({ opacity: 1 }, () => {
            this.timer = setTimeout(() => {
                this.setState({ opacity: 0 }, () => {
                    this.timer = setTimeout(cb, 300);
                });
            }, 300);
        });
    }

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
        } = this.props;

        return (
            <div
                style={{ opacity: this.state.opacity }}
                className="moderation-card moderation-card__gallery"
            >
                <FrescoImage
                    className="moderation-card__image"
                    src={get(posts, '[0].image')}
                    loadWithPlaceholder
                />

                <div className="moderation-card__gallery-caption">
                    {caption}
                </div>

                <CardBadges strings={report_reasons} />

                {owner && <CardUser user={owner} />}

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
                        onClick={partial(this.onRemove, onSkip)}
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
                                {owner.suspended_until ? 'unsuspend user' : 'suspend user'}
                            </span>
                        }
                        <span
                            className="moderation-card__action"
                            onClick={partial(this.onRemove, onDelete)}
                        >
                            delete
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

