import React, { PropTypes } from 'react';
import utils from 'utils';

export default class OutletColumnHead extends React.Component {
    static propTypes = {
        outlet: PropTypes.object,
        userStats: PropTypes.object,
        purchaseStats: PropTypes.object,
        dailyVideoCount: PropTypes.number,
        adjustGoal: PropTypes.func,
    };

    render() {
        const { outlet, dailyVideoCount, purchaseStats, userStats } = this.props;
        // const percentage = Math.round((dailyVideoCount / (outlet.goal)) * 100);
        const percentage = 50;

        let circleColor = 'red';
        if (dailyVideoCount >= outlet.goal) circleColor = 'green';
        else if (dailyVideoCount > (0.25 * outlet.goal)) circleColor = 'orange';

        return (
            <div
                className="outlet-column__head"
                ref={r => this.head = r}
            >
                <div className="title">
                    <div>
                        <h3>{outlet.title}</h3>
                        <a href={'/outlet/' + outlet._id}>
                            <span className="mdi mdi-logout-variant launch"/>
                        </a>
                    </div>

                    <span className="mdi mdi-drag-vertical drag" />
                </div>

                {/*<div className="users">
                    <ul>
                        <li>
                            <p>{userStats.mau}</p>
                            <p>MAU</p>
                        </li>
                        <li>
                            <p>{userStats.dau}</p>
                            <p>DAU</p>
                        </li>
                        <li>
                            <p>{userStats.galleryCount}</p>
                            <p>galleries/user/day</p>
                        </li>
                    </ul>
                </div>*/}

                <div className="revenue">
                    <ul>
                        <li>
                            <span className="count">{purchaseStats.photos}</span>
                            <span>{utils.isPlural(purchaseStats.photos) ? 'photos' : 'photo'}</span>
                        </li>
                        <li>
                            <span className="count">{purchaseStats.videos}</span>
                            <span>{utils.isPlural(purchaseStats.photos) ? 'videos' : 'video'}</span>
                        </li>
                        <li>
                            <span className="count">{purchaseStats.revenue}</span>
                            <span>revenue</span>
                        </li>
                        <li>
                            <span className="count">{purchaseStats.margin}</span>
                            <span>margin</span>
                        </li>
                        <li>
                            <span className="count">0</span>
                            <span>assignments</span>
                        </li>
                    </ul>
                </div>

                <div className="goal">
                    <div className={"c100 p" + percentage + " circle small " + circleColor}>
                        <p className="fraction">
                            <span className="numerator">
                                {this.props.dailyVideoCount}
                            </span>
                            <span className="denominator">
                               {'/' + (outlet.goal || 0)}
                           </span>
                        </p>

                        <div className="slice">
                            <div className="bar" />
                            <div className="fill" />
                        </div>
                    </div>

                    <div className="actions">
                        <span
                            className="mdi mdi-minus"
                            onClick={() => this.props.adjustGoal(-1)}
                        />
                        <span
                            className="mdi mdi-plus"
                            onClick={() => this.props.adjustGoal(1)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

