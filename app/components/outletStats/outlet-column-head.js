import React from 'react'
import global from '../../../lib/global'
import moment from 'moment'

/**
 * 
 */
export default class OutletColumnHead extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        var outlet = this.props.outlet,
            userStats = this.props.userStats,
            purchaseStats = this.props.purchaseStats;

        return (
            <div className="head" ref="head">
                <div className="title">
                    <div>
                        <h3>{outlet.title}</h3>
                        <a href={'/outlet/' + outlet._id}>
                            <span className="mdi mdi-logout-variant launch"></span>
                        </a>
                    </div>

                    <span 
                        className="mdi mdi-drag-vertical drag" 
                        ondrag={this.drag}
                        draggable={true}></span>
                </div>

                <div className="users">
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
                </div>

                <div className="revenue">
                    <ul>
                        <li>
                            <span className="count">{purchaseStats.photos}</span>
                            <span>photos</span>
                        </li>
                        <li>
                            <span className="count">{purchaseStats.videos}</span>
                            <span>videos</span>
                        </li>
                        <li>
                            <span className="count">{purchaseStats.revenue}</span>
                            <span>revenue</span>
                        </li>
                        <li>
                            <span className="count">{purchaseStats.margin}</span>
                            <span>margin</span>
                        </li>
                    </ul>
                </div>

                <div className="goal">
                    <div className="circle">
                        <p className="fraction">
                            <span className="numerator">{outlet.goal}</span>
                            <span className="denominator">{'/' + (purchaseStats.dayCount || 0)}</span>
                        </p>
                    </div>

                    <div className="actions">
                        <span 
                            className="mdi mdi-minus" 
                            onClick={this.props.adjustGoal.bind(null, -1)}>
                        </span>
                        <span 
                            className="mdi mdi-plus" 
                            onClick={this.props.adjustGoal.bind(null, 1)}>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

OutletColumnHead.deafultProps = {
    outlet: {}
}