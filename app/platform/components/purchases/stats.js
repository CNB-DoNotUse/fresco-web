import React, { PropTypes } from 'react';
import api from 'app/lib/api';

export default class PurchasesStats extends React.Component {
    static propTypes = {
        stats: PropTypes.object,
        updatePurchases: PropTypes.bool,
        loadStats: PropTypes.func,
        downloadExports: PropTypes.func,
    }

    static defaultProps = {
        stats: {
            last_day: 0,
            last_7days: 0,
            last_30days: 0,
            total_revenue: 0,
        },
    }

    state = {
        stats: this.props.stats,
    }

    componentDidMount() {
        // Load stats when component first mounts
        this.loadStats();
    }

    componentDidUpdate() {
        // Tell the component to update its purchases
        if (this.props.updatePurchases) {
            this.loadStats();
        }
    }

	/**
	 * Loads stats for purchases
	 */
    loadStats = () => {
		// Access parent var load method
        this.props.loadStats((stats) => {
            if (Object.keys(stats).length === 0) {
                this.setState({ stats: this.props.stats });
            } else {
                this.setState({ stats });
            }
        });
    }

    emailStatement = () => {
        api
        .post('outlet/export/email')
        .then(() => {
            $.snackbar({
                content: 'Account statement successfully sent! Please check your email.',
            });
        })
        .catch(() => {
            $.snackbar({ content: 'Could not email statement' });
        });
    }

    render() {
        const { downloadExports } = this.props;
        const {
            revenue_last_day,
            revenue_last_7days,
            revenue_last_30days,
            total_revenue,
        } = this.state.stats;

        return (
            <div className="col-md-4">
                <h3 className="md-type-button md-type-black-secondary">Total purchases</h3>

                <ul className="md-type-subhead">
                    <li>
                        <span>${revenue_last_day / 100}</span>
                        <span className="md-type-caption"> last 24 hours</span>
                    </li>
                    <li>
                        <span>${revenue_last_7days / 100}</span>
                        <span className="md-type-caption"> last 7 days</span>
                    </li>
                    <li>
                        <span>${revenue_last_30days / 100}</span>
                        <span className="md-type-caption"> last 30 days</span>
                    </li>

                    <li>
                        <span>${total_revenue / 100}</span>
                        <span className="md-type-caption"> total</span>
                    </li>
                </ul>

                <button
                    id="export-csv"
                    type="button"
                    className="btn"
                    onClick={() => downloadExports('csv')}
                >
                    Export to .csv
                </button>

                <button
                    id="email-statement-button"
                    type="button"
                    className="btn"
                    onClick={this.emailStatement}
                >
                    Email my statement
                </button>
            </div>
        );
    }
}

