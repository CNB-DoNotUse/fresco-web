import React, { PropTypes } from 'react';
import utils from 'utils';

export const UserStats = ({ mau, dau, galleryCount }) => (
    <div className="users">
        <ul>
            <li>
                <p>{mau}</p>
                <p>MAU</p>
            </li>
            <li>
                <p>{dau}</p>
                <p>DAU</p>
            </li>
            <li>
                <p>{galleryCount}</p>
                <p>galleries/user/day</p>
            </li>
        </ul>
    </div>
);

UserStats.propTypes = {
    mau: PropTypes.number,
    dau: PropTypes.number,
    galleryCount: PropTypes.number,
};

export const PurchaseStats = ({ photos = 0, videos = 0, margin = 0, revenue = 0 }) => (
    <div className="revenue">
        <ul>
            <li>
                <span className="count">{photos}</span>
                <span>{utils.isPlural(photos) ? 'photos' : 'photo'}</span>
            </li>
            <li>
                <span className="count">{videos}</span>
                <span>{utils.isPlural(photos) ? 'videos' : 'video'}</span>
            </li>
            <li>
                <span className="count">{`$${revenue}`}</span>
                <span>revenue</span>
            </li>
            <li>
                <span className="count">{`$${margin}`}</span>
                <span>margin</span>
            </li>
            <li>
                <span className="count">0</span>
                <span>assignments</span>
            </li>
        </ul>
    </div>
);

PurchaseStats.propTypes = {
    photos: PropTypes.number,
    videos: PropTypes.number,
    margin: PropTypes.number,
    revenue: PropTypes.number,
};

export const OutletGoal = ({ dailyVideoCount, adjustGoal, goal }) =>  {
    const percentage = 50;

    let circleColor = 'red';
    if (dailyVideoCount >= goal) circleColor = 'green';
    else if (dailyVideoCount > (0.25 * goal)) circleColor = 'orange';

    return (
        <div className="goal">
            <div className={`c100 p${percentage} circle small ${circleColor}`}>
                <p className="fraction">
                    <span className="numerator">
                        {dailyVideoCount}
                    </span>
                    <span className="denominator">
                        {`/${(goal || 0)}`}
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
                    onClick={() => adjustGoal(-1)}
                />
                <span
                    className="mdi mdi-plus"
                    onClick={() => adjustGoal(1)}
                />
            </div>
        </div>
    );
};

OutletGoal.propTypes = {
    dailyVideoCount: PropTypes.number,
    goal: PropTypes.number,
    adjustGoal: PropTypes.func,
};

